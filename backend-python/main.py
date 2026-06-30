"""
main.py — API du moteur d'optimisation topologique (service Python séparé).

À lancer indépendamment du serveur Next.js :
    pip install fastapi uvicorn numpy scipy scikit-image numpy-stl python-multipart
    uvicorn main:app --reload --port 8000

Le frontend (Next.js) appelle ce service via HTTP (voir Partie 5 pour le
point d'intégration côté Next.js).
"""
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import numpy as np
import uuid
import os

from simp.simp_3d import optimisation_simp_3d, grille_vers_stl
from stockage_supabase import uploader_stl

app = FastAPI(title="UAV-D+ Moteur d'optimisation")

# Autoriser les appels depuis le frontend Next.js (ajuster l'URL en prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOSSIER_STL = "stl_generes"
os.makedirs(DOSSIER_STL, exist_ok=True)


class ParametresOptimisation(BaseModel):
    mission: str
    charge_utile_kg: float
    materiau: str
    nb_variantes: int = 5


class VarianteResultat(BaseModel):
    id: str
    variante: str
    materiau: str
    masse_kg: float
    contrainte_mpa: float
    coefficient_securite: float
    deplacement_mm: float
    volume_mm3: float
    fichier_stl: str   # nom du fichier (utile pour debug / suppression)
    stl_url: str        # URL publique Supabase, à utiliser par le frontend


# Résolution de la grille SIMP et échelle physique réelle qu'elle représente.
# Avant : 1 voxel = 1mm (codé en dur), ce qui donnait un "bras" de 20mm de
# long — bien plus petit qu'un vrai bras de drone, d'où des masses
# ridiculement faibles et des coefficients de sécurité absurdement élevés.
#
# Maintenant : on fixe la longueur RÉELLE du bras (en mm) et on en déduit
# la taille de chaque voxel. À ajuster avec votre collaboratrice selon la
# vraie envergure du drone visé (ex: distance châssis -> moteur).
NELX, NELY, NELZ = 20, 7, 7
LONGUEUR_BRAS_MM = 120.0  # longueur réelle représentée par la grille (axe X)
TAILLE_VOXEL_MM = LONGUEUR_BRAS_MM / NELX
VOLUME_VOXEL_MM3 = TAILLE_VOXEL_MM ** 3

# Limites admissibles indicatives (MPa) par matériau — pour calculer un
# coefficient de sécurité réaliste (contrainte admissible / contrainte
# subie), plutôt qu'une formule arbitraire.
LIMITES_ADMISSIBLES_MPA = {
    "Aluminium": 270,
    "AlSi10Mg": 230,
    "Aluminium 2014-T6": 414,
    "Titane 6Al-4V": 880,
    "ABS": 40,
}

DENSITES = {
    "Aluminium": 2.70e-6,
    "AlSi10Mg": 2.68e-6,
    "Aluminium 2014-T6": 2.80e-6,
    "Titane 6Al-4V": 4.43e-6,
    "ABS": 1.04e-6,
}

MODULES_YOUNG = {
    "Aluminium": 69000,
    "AlSi10Mg": 70000,
    "Aluminium 2014-T6": 73000,
    "Titane 6Al-4V": 114000,
    "ABS": 2300,
}


@app.post("/optimiser", response_model=list[VarianteResultat])
def lancer_optimisation(params: ParametresOptimisation):
    """
    Lance `nb_variantes` exécutions de SIMP 3D avec des réglages légèrement
    différents (fraction volumique, pénalisation) pour produire des
    propositions distinctes, comme demandé : "SIMP génère les nouvelles
    structures, le classement les trie ensuite".
    """
    if params.materiau not in DENSITES:
        raise HTTPException(400, f"Matériau inconnu : {params.materiau}")

    # --- conversion charge utile -> force réelle subie par UN bras ---
    # Hypothèse simplifiée : la charge utile (+ une marge pour le poids du
    # moteur/hélice, ~80g) se répartit sur 4 bras (config. quadricoptère),
    # avec un facteur dynamique (x2) pour couvrir l'accélération en vol
    # (montée, manœuvre) plutôt que le seul poids statique au repos.
    NB_BRAS = 4
    MASSE_MOTEUR_HELICE_KG = 0.08
    FACTEUR_DYNAMIQUE = 2.0
    G = 9.81

    masse_totale_a_porter_kg = params.charge_utile_kg + MASSE_MOTEUR_HELICE_KG
    force_par_bras_n = (masse_totale_a_porter_kg * G * FACTEUR_DYNAMIQUE) / NB_BRAS

    # --- conversion en charge normalisée pour SIMP ---
    # SIMP résout un problème adimensionné ; on fait varier l'intensité de
    # la charge normalisée proportionnellement à la force réelle (par
    # rapport à une charge de référence arbitraire de 1N), ce qui influence
    # la FORME générée (une charge plus importante concentre davantage de
    # matière près du point d'application). La valeur absolue du
    # coefficient de sécurité, elle, est calculée séparément ci-dessous à
    # partir de la vraie force en Newtons — donc reste physiquement exacte
    # même si la charge normalisée SIMP est une approximation de la forme.
    CHARGE_REFERENCE_N = 1.0
    charge_normalisee = -(force_par_bras_n / CHARGE_REFERENCE_N)

    resultats = []

    # Variation des réglages pour obtenir des propositions différentes
    volfracs = np.linspace(0.25, 0.45, params.nb_variantes)

    for i, volfrac in enumerate(volfracs):
        grille, historique = optimisation_simp_3d(
            nelx=NELX, nely=NELY, nelz=NELZ,
            volfrac=float(volfrac),
            penal=3.0,
            max_iter=15,
            charge_normalisee=charge_normalisee,
        )

        # --- métriques dérivées du résultat SIMP, à l'échelle physique réelle ---
        nb_voxels_pleins = float(grille.sum())
        volume_mm3 = nb_voxels_pleins * VOLUME_VOXEL_MM3
        masse_kg = volume_mm3 * DENSITES[params.materiau]

        # --- contrainte réelle (formule poutre en flexion simplifiée) ---
        # contrainte = M / I * c, avec M = force_par_bras_n * longueur_bras
        # (moment fléchissant), et I/c approximés à partir de la section
        # transversale réelle occupée par la matière restante (proportionnelle
        # à la fraction volumique obtenue) — donne une contrainte qui AUGMENTE
        # bien avec la charge réelle demandée, contrairement à avant où seule
        # la compliance SIMP (indépendante de l'échelle physique de charge)
        # déterminait le résultat.
        section_mm2 = (nb_voxels_pleins / NELX) * (TAILLE_VOXEL_MM ** 2)
        section_mm2 = max(section_mm2, 1.0)  # éviter une division par ~0
        cote_equivalent_mm = np.sqrt(section_mm2)
        moment_inertie_mm4 = (cote_equivalent_mm ** 4) / 12
        moment_flechissant_n_mm = force_par_bras_n * LONGUEUR_BRAS_MM
        contrainte_mpa = (moment_flechissant_n_mm * (cote_equivalent_mm / 2)) / moment_inertie_mm4

        compliance_finale = historique[-1]
        facteur_echelle = (1.0 / TAILLE_VOXEL_MM) ** 2
        deplacement_mm = compliance_finale * facteur_echelle * 1e-2

        limite_admissible = LIMITES_ADMISSIBLES_MPA[params.materiau]
        coefficient_securite = limite_admissible / max(contrainte_mpa, 1e-6)

        # --- export STL ---
        identifiant = str(uuid.uuid4())[:8]
        nom_fichier = f"variante_{identifiant}.stl"
        chemin_complet = os.path.join(DOSSIER_STL, nom_fichier)
        grille_vers_stl(grille, seuil=0.5, chemin_sortie=chemin_complet, echelle_mm=TAILLE_VOXEL_MM)

        # --- upload vers Supabase Storage ---
        # En cas d'échec (Supabase non configuré, hors-ligne, etc.), on
        # se replie sur l'URL servie localement par ce même serveur
        # (endpoint GET /fichiers/{nom}) plutôt que de faire échouer toute
        # la requête — utile en développement avant que Supabase soit
        # pleinement configuré.
        try:
            stl_url = uploader_stl(chemin_complet, nom_fichier)
        except Exception as e:
            print(f"[avertissement] Upload Supabase échoué ({e}), repli sur URL locale.")
            stl_url = f"/fichiers/{nom_fichier}"  # à préfixer du host par le frontend si besoin

        resultats.append(VarianteResultat(
            id=identifiant,
            variante=f"Proposition {i+1}",
            materiau=params.materiau,
            masse_kg=round(masse_kg, 4),
            contrainte_mpa=round(contrainte_mpa, 4),
            coefficient_securite=round(coefficient_securite, 2),
            deplacement_mm=round(deplacement_mm, 5),
            volume_mm3=round(volume_mm3, 1),
            fichier_stl=nom_fichier,
            stl_url=stl_url,
        ))

    return resultats


@app.get("/fichiers/{nom_fichier}")
def recuperer_fichier_stl(nom_fichier: str):
    """
    Sert un fichier STL généré, pour que le viewer 3D du frontend puisse
    le charger directement (Drone3DViewerByUrl attend une URL chargeable).

    À terme, une fois Supabase Storage branché, cet endpoint devient
    inutile : le frontend chargera directement l'URL publique Supabase
    plutôt que de repasser par ce serveur Python.
    """
    chemin = os.path.join(DOSSIER_STL, nom_fichier)
    if not os.path.isfile(chemin):
        raise HTTPException(404, "Fichier introuvable.")
    return FileResponse(chemin, media_type="model/stl", filename=nom_fichier)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "moteur-optimisation-uav-d-plus"}
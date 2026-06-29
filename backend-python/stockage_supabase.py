"""
stockage_supabase.py — Upload des fichiers STL générés vers Supabase Storage.

Installer d'abord : pip install supabase

Variables d'environnement nécessaires (à mettre dans un fichier .env,
chargé via python-dotenv, ou définies directement dans l'environnement) :
    SUPABASE_URL=https://xxxxx.supabase.co
    SUPABASE_ANON_KEY=eyJ...

Ces valeurs sont les mêmes que celles utilisées côté frontend Next.js
(lib/supabase.ts) — récupérées dans Project Settings > API de votre
projet Supabase.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

BUCKET = "drone-stl-files"

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise RuntimeError(
                "SUPABASE_URL / SUPABASE_ANON_KEY non définis. "
                "Définissez-les comme variables d'environnement avant de lancer le serveur."
            )
        _client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _client


def uploader_stl(chemin_local: str, nom_fichier_distant: str) -> str:
    """
    Uploade un fichier STL local vers le bucket Supabase Storage et
    retourne son URL publique.

    chemin_local         : chemin du fichier .stl sur le disque local
                            (ex: stl_generes/variante_xxxx.stl)
    nom_fichier_distant   : nom à utiliser dans le bucket (ex: variante_xxxx.stl)
    """
    client = _get_client()

    with open(chemin_local, "rb") as f:
        contenu = f.read()

    chemin_distant = f"variantes/{nom_fichier_distant}"

    # upsert=true : si un fichier du même nom existe déjà, on le remplace
    # plutôt que d'échouer (utile en cas de relance/test répété)
    client.storage.from_(BUCKET).upload(
        chemin_distant,
        contenu,
        file_options={"content-type": "model/stl", "upsert": "true"},
    )

    url_publique = client.storage.from_(BUCKET).get_public_url(chemin_distant)
    return url_publique


def supprimer_stl(nom_fichier_distant: str) -> None:
    """Supprime un fichier STL du bucket (ex: nettoyage après expiration)."""
    client = _get_client()
    client.storage.from_(BUCKET).remove([f"variantes/{nom_fichier_distant}"])
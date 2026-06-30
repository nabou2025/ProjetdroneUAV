// lib/firestoreOptimisation.ts
//
// Fonctions prêtes à l'emploi pour insérer/lire les projets d'optimisation
// dans Firestore. Architecture des collections :
//
//   projets_optimisation/{projetId}
//     - userId, mission, chargeUtileKg, materiau, sourceType, dateCreation
//
//   projets_optimisation/{projetId}/resultats/{resultatId}
//     - variante, materiau, masseKg, contrainteMpa, coefficientSecurite,
//       deplacementMm, volumeMm3, stlUrl, selectionnee

import {
  collection, addDoc, doc, setDoc, getDocs, updateDoc, query, where,
  orderBy, Timestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

export type ResultatOptimisation = {
  variante: string;
  materiau: string;
  masseKg: number;
  contrainteMpa: number;
  coefficientSecurite: number;
  deplacementMm: number;
  volumeMm3: number;
  stlUrl: string;
  score?: number;
};

/**
 * Crée un nouveau projet d'optimisation pour l'utilisateur connecté.
 * Retourne l'identifiant du projet créé.
 */
export async function creerProjetOptimisation(params: {
  mission: string;
  chargeUtileKg: number;
  materiau: string;
  sourceType: "fourni" | "import";
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non connecté.");

  const ref = await addDoc(collection(db, "projets_optimisation"), {
    userId: user.uid,
    ...params,
    dateCreation: Timestamp.now(),
  });
  return ref.id;
}

/**
 * Enregistre les résultats générés (les variantes SIMP) pour un projet.
 * Retourne la liste des identifiants Firestore créés, dans le même ordre
 * que les résultats fournis — utile pour relier ensuite chaque variante
 * affichée à son document Firestore (ex: marquer la sélection finale).
 */
export async function enregistrerResultats(
  projetId: string,
  resultats: ResultatOptimisation[]
): Promise<string[]> {
  const sousCollection = collection(db, "projets_optimisation", projetId, "resultats");
  const refs = await Promise.all(
    resultats.map(r => addDoc(sousCollection, { ...r, selectionnee: false }))
  );
  return refs.map(ref => ref.id);
}

/**
 * Récupère tous les résultats d'un projet.
 */
export async function recupererResultats(projetId: string) {
  const sousCollection = collection(db, "projets_optimisation", projetId, "resultats");
  const snapshot = await getDocs(sousCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Marque une variante comme sélectionnée par l'utilisateur (page Résultats).
 */
export async function selectionnerVariante(projetId: string, resultatId: string) {
  const ref = doc(db, "projets_optimisation", projetId, "resultats", resultatId);
  await updateDoc(ref, { selectionnee: true });
}

/**
 * Récupère l'historique des projets de l'utilisateur connecté.
 */
export async function recupererMesProjets() {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilisateur non connecté.");

  const q = query(
    collection(db, "projets_optimisation"),
    where("userId", "==", user.uid),
    orderBy("dateCreation", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
// app/api/optimisation/analyser/route.ts
//
// Service 1 — Analyse du fichier Excel de résultats (Fusion 360 ou autre
// étude générative) et calcul du top 5 selon les critères validés avec
// l'encadrant : rejet si sécurité < 2 ou contrainte > limite admissible,
// puis classement pondéré (sécurité > masse/déplacement > contrainte).
//
// Installer d'abord : npm install xlsx

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Limites admissibles indicatives (MPa) par matériau — à ajuster avec
// l'encadrant si des valeurs plus précises sont disponibles.
const LIMITES_ADMISSIBLES: Record<string, number> = {
  "Aluminium": 270,
  "AlSi10Mg": 230,
  "Aluminium 2014-T6": 414,
  "Titane 6Al-4V": 880,
  "ABS": 40,
};

type ResultatBrut = {
  Variante: string;
  "Matériau": string;
  "Masse (kg)": number;
  "Contrainte (MPa)": number;
  "Coefficient de sécurité": number;
  "Déplacement (mm)": number;
  "Volume (mm³)": number;
};

type ResultatScore = ResultatBrut & { score: number };

function normaliser(valeurs: number[], lowerIsBetter = false): number[] {
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const range = max - min || 1e-9;
  return valeurs.map(v => {
    const n = (v - min) / range;
    return lowerIsBetter ? 1 - n : n;
  });
}

function calculerTop5(lignes: ResultatBrut[]): ResultatScore[] {
  // 1. Dédoublonnage (le fichier source peut contenir des cycles répétés)
  const vues = new Set<string>();
  const uniques = lignes.filter(l => {
    const cle = ${l["Matériau"]}-${l["Masse (kg)"]}-${l["Contrainte (MPa)"]}-${l["Coefficient de sécurité"]}-${l["Volume (mm³)"]};
    if (vues.has(cle)) return false;
    vues.add(cle);
    return true;
  });

  // 2. Filtrage : rejet des solutions non conformes
  const valides = uniques.filter(l => {
    const limite = LIMITES_ADMISSIBLES[l["Matériau"]] ?? Infinity;
    return l["Coefficient de sécurité"] >= 2 && l["Contrainte (MPa)"] < limite;
  });

  if (valides.length === 0) return [];

  // 3. Scoring pondéré : sécurité(5) + masse(4) + déplacement(4) + contrainte(3)
  const securites = normaliser(valides.map(l => l["Coefficient de sécurité"]));
  const masses = normaliser(valides.map(l => l["Masse (kg)"]), true);
  const deplacements = normaliser(valides.map(l => l["Déplacement (mm)"]), true);
  const contraintes = normaliser(valides.map(l => l["Contrainte (MPa)"]), true);

  const avecScore: ResultatScore[] = valides.map((l, i) => ({
    ...l,
    score: (securites[i] * 5 + masses[i] * 4 + deplacements[i] * 4 + contraintes[i] * 3) / 16,
  }));

  // 4. Top 5
  return avecScore.sort((a, b) => b.score - a.score).slice(0, 5);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fichier = formData.get("fichier") as File | null;
    const source = formData.get("source") as string | null; // "fourni" | "import"

    let buffer: ArrayBuffer;

    if (source === "fourni") {
      // Le fichier "déjà optimisé" fourni par l'enseignant est stocké côté
      // serveur (ex: dans /public/data/ ou récupéré depuis Supabase Storage).
      // À remplacer par le vrai chemin une fois le fichier déployé.
      const fs = await import("fs/promises");
      const path = await import("path");
      const cheminFichier = path.join(process.cwd(), "data", "Topo-Results-Fusion.xlsx");
      const data = await fs.readFile(cheminFichier);
      buffer = data.buffer;
    } else if (fichier) {
      buffer = await fichier.arrayBuffer();
    } else {
      return NextResponse.json({ erreur: "Aucun fichier fourni." }, { status: 400 });
    }

    const workbook = XLSX.read(buffer, { type: "array" });
    const feuille = workbook.Sheets[workbook.SheetNames[0]];
    const lignes = XLSX.utils.sheet_to_json<ResultatBrut>(feuille);

    const top5 = calculerTop5(lignes);

    return NextResponse.json({ top5 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ erreur: "Erreur lors de l'analyse du fichier." }, { status: 500 });
  }
}
NEXT_PUBLIC_SUPABASE_URL=https://vsqgkwbwgsevkqheqqnq.supabase.co/rest/v1/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcWdrd2J3Z3NldmtxaGVxcW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDMzNzYsImV4cCI6MjA5ODMxOTM3Nn0.C_cXBtxa-cs868zfwRbB5x0_eMuInx208GocdtpZwrk

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = "drone-stl-files";

/**
 * Upload un fichier STL (reçu depuis le backend Python, ou un Blob côté
 * client) vers Supabase Storage, et retourne son URL publique.
 */
export async function uploaderFichierSTL(
  fichier: File | Blob,
  nomFichier: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(variantes/${nomFichier}, fichier, {
      contentType: "model/stl",
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Supprime un fichier STL (ex: nettoyage après expiration du projet).
 */
export async function supprimerFichierSTL(nomFichier: string) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([variantes/${nomFichier}]);
  if (error) throw error;
}
// app/login/page.tsx
//
// Remplace le système localStorage par une vraie authentification Firebase.
// À adapter visuellement selon votre design existant — la logique
// d'authentification ci-dessous est la partie importante à intégrer.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    try {
      if (mode === "connexion") {
        await signInWithEmailAndPassword(auth, email, motDePasse);
      } else {
        const credentials = await createUserWithEmailAndPassword(auth, email, motDePasse);
        // Créer le profil utilisateur dans Firestore dès l'inscription
        await setDoc(doc(db, "users", credentials.user.uid), {
          nom,
          email,
          role: "Ingénieur",
          dateCreation: new Date().toISOString(),
        });
      }
      // TODO: préciser la destination finale une fois décidée (vous avez
      // indiqué vouloir y revenir) — pour l'instant, redirection vers /accueil
      router.push("/accueil");
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/invalid-credential": "Email ou mot de passe incorrect.",
        "auth/email-already-in-use": "Cet email est déjà utilisé.",
        "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
        "auth/invalid-email": "Adresse email invalide.",
      };
      setErreur(messages[err.code] || "Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0f1117", fontFamily: "'Inter', sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#13151f", border: "1px solid #1e2235", borderRadius: 16,
        padding: 36, width: 360, display: "flex", flexDirection: "column", gap: 14,
      }}>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {mode === "connexion" ? "Connexion" : "Créer un compte"}
        </h1>

        {mode === "inscription" && (
          <input
            type="text" placeholder="Nom complet" value={nom}
            onChange={e => setNom(e.target.value)} required
            style={inputStyle}
          />
        )}
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
          style={inputStyle}
        />
        <input
          type="password" placeholder="Mot de passe" value={motDePasse}
          onChange={e => setMotDePasse(e.target.value)} required minLength={6}
          style={inputStyle}
        />

        {erreur && (
          <div style={{ color: "#fca5a5", fontSize: 12.5 }}>{erreur}</div>
        )}

        <button type="submit" disabled={chargement} style={{
          padding: "11px 0", borderRadius: 10, border: "none",
          background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer",
          opacity: chargement ? 0.6 : 1,
        }}>
          {chargement ? "Veuillez patienter…" : mode === "connexion" ? "Se connecter" : "S'inscrire"}
        </button>

        <button
          type="button"
          onClick={() => setMode(m => m === "connexion" ? "inscription" : "connexion")}
          style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 12.5, cursor: "pointer" }}
        >
          {mode === "connexion" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px", borderRadius: 8, border: "1px solid #1e2235",
  background: "#0f1117", color: "#e2e8f0", fontSize: 13.5, outline: "none",
};
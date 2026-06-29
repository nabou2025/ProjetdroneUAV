"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Settings, Sliders, BarChart2, Clock, Bell, Boxes,
  ChevronDown, ChevronRight, ChevronLeft, CheckCircle2, ThumbsUp,
  Weight, Shield, Move, Gauge, Layers, Printer,
} from "lucide-react";
import Drone3DViewerByUrl from "./Drone3DViewerByUrl";
import { selectionnerVariante } from "@/lib/firestoreOptimisation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/accueil" },
  { icon: Settings,        label: "Configuration", href: "/dashboard/configuration" },
  { icon: Sliders,         label: "Optimisation",   href: "/optimisation" },
  { icon: BarChart2,       label: "Résultats",      href: "/optimisation/resultats", active: true },
  { icon: Clock,           label: "Historique",     href: "/dashboard/historique" },
  { icon: Settings,        label: "Paramètres",     href: "/dashboard/parametres" },
];

const colors = {
  bg: "#f4f6fb",
  sidebarBg: "#0a1a3f",
  sidebarActive: "#1d4ed8",
  cardBg: "#ffffff",
  border: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  accent: "#2563eb",
};

// Données de repli (utilisées seulement si aucun résultat réel n'est
// présent dans sessionStorage — ex: accès direct à cette page en dev,
// sans être passé par /optimisation). En usage normal, ces données sont
// remplacées par les vraies variantes générées par le moteur SIMP.
const RESULTATS_REPLI = [
  { id: "repli-1", variante: "Résultat 11", materiau: "Titane 6Al-4V",    masse_kg: 0.124, contrainte_mpa: 0.013, coefficient_securite: 65651.6, deplacement_mm: 0.00022, volume_mm3: 28025.7, fichier_stl: null },
  { id: "repli-2", variante: "Résultat 13", materiau: "AlSi10Mg",          masse_kg: 0.075, contrainte_mpa: 0.008, coefficient_securite: 29981.7, deplacement_mm: 0.00002, volume_mm3: 28018.3, fichier_stl: null },
  { id: "repli-3", variante: "Résultat 7",  materiau: "ABS",               masse_kg: 0.030, contrainte_mpa: 0.003, coefficient_securite: 6860.96, deplacement_mm: 0.00024, volume_mm3: 27993.1, fichier_stl: null },
  { id: "repli-4", variante: "Résultat 10", materiau: "Aluminium 2014-T6", masse_kg: 0.081, contrainte_mpa: 0.013, coefficient_securite: 30753.2, deplacement_mm: 0.00043, volume_mm3: 29041.0, fichier_stl: null },
  { id: "repli-5", variante: "Résultat 15", materiau: "ABS",               masse_kg: 0.017, contrainte_mpa: 0.362, coefficient_securite: 55.228,  deplacement_mm: 0.04700, volume_mm3: 15892.9, fichier_stl: null },
];

type Variante = {
  id: string;
  variante: string;
  materiau: string;
  masse_kg: number;
  contrainte_mpa: number;
  coefficient_securite: number;
  deplacement_mm: number;
  volume_mm3: number;
  fichier_stl: string | null;
};

// URL du service Python qui sert les fichiers STL générés (à ajuster une
// fois Supabase Storage branché — pour l'instant, sert le fichier
// directement depuis le dossier stl_generes/ du backend Python, à exposer
// via un endpoint GET /fichiers/{nom} si besoin, ou via Supabase une fois
// l'upload mis en place).
const BASE_URL_FICHIERS = "http://localhost:8000/fichiers";

export default function ResultatsPage() {
  const router = useRouter();
  const [resultats, setResultats] = useState<Variante[]>(RESULTATS_REPLI);
  const [selectedId, setSelectedId] = useState<string>(RESULTATS_REPLI[0].id);
  const [utiliseDonneesReelles, setUtiliseDonneesReelles] = useState(false);

  useEffect(() => {
    const stocke = sessionStorage.getItem("variantes_optimisation");
    if (stocke) {
      try {
        const variantes: Variante[] = JSON.parse(stocke);
        if (Array.isArray(variantes) && variantes.length > 0) {
          setResultats(variantes);
          setSelectedId(variantes[0].id);
          setUtiliseDonneesReelles(true);
        }
      } catch {
        // si le contenu stocké est corrompu, on garde les données de repli
      }
    }
  }, []);

  const selected = resultats.find(r => r.id === selectedId) ?? resultats[0];

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
  };

  const handleConfirm = async () => {
    const projetId = sessionStorage.getItem("projet_id_courant");
    const firestoreId = (selected as any).firestoreId;

    if (projetId && firestoreId) {
      try {
        await selectionnerVariante(projetId, firestoreId);
      } catch (e) {
        console.warn("Impossible d'enregistrer la sélection dans Firestore (non bloquant) :", e);
      }
    }

    // Données nécessaires à la page Export (résumé + lien de téléchargement)
    sessionStorage.setItem("variante_choisie", JSON.stringify(selected));

    router.push("/export");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg, color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 230, minWidth: 230, background: colors.sidebarBg, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 22px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Boxes size={17} color="#60a5fa" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>UAV-D+</div>
        </div>

        <nav style={{ flex: 1, padding: "8px 14px" }}>
          {navItems.map(({ icon: Icon, label, href, active }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 9, marginBottom: 4,
                background: active ? colors.sidebarActive : "transparent",
                color: active ? "#fff" : "#94a3b8",
                fontSize: 13.5, fontWeight: active ? 600 : 400, cursor: "pointer",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={16} />{label}
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ padding: "16px 18px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", flexShrink: 0 }}>
            <Settings size={15} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Expert</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Jean Dupont</div>
          </div>
          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <main style={{ flex: 1, padding: "32px 40px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Propositions de structures optimisées</h1>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, marginTop: 6 }}>
                Comparez les 5 variantes générées et choisissez celle qui convient à votre projet.
              </p>
            </div>
            <button style={{
              width: 38, height: 38, borderRadius: "50%", border: `1px solid ${colors.border}`,
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <Bell size={17} color={colors.textSecondary} />
            </button>
          </div>

          {!utiliseDonneesReelles && (
            <div style={{
              maxWidth: 1400, marginBottom: 16, padding: "10px 16px",
              background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10,
              fontSize: 12.5, color: "#92400e",
            }}>
              Aucun résultat reçu du moteur d'optimisation pour cette session — affichage de données d'exemple. Lancez l'optimisation depuis la page précédente pour voir vos vraies propositions.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, maxWidth: 1400 }}>

            {/* Grille des résultats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {resultats.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  style={{
                    ...cardStyle, cursor: "pointer", overflow: "hidden",
                    border: r.id === selectedId ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{r.variante} — {r.materiau}</span>
                    {r.id === selectedId && <CheckCircle2 size={16} color={colors.accent} />}
                  </div>
                  <Drone3DViewerByUrl
                    url={r.fichier_stl ? `${BASE_URL_FICHIERS}/${r.fichier_stl}` : null}
                    height={190}
                    placeholderSeed={resultats.indexOf(r) + 1}
                  />
                </div>
              ))}

              {/* Emplacement supplémentaire : carte d'info plutôt qu'un résultat vide */}
              <div style={{
                ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 24, textAlign: "center", color: colors.textSecondary, gap: 8,
              }}>
                <Layers size={22} color={colors.accent} />
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  Ces variantes sont générées par le moteur d'optimisation
                  (analyse topologique SIMP) à partir de vos paramètres de mission.
                </div>
              </div>
            </div>

            {/* Panneau de détails — variante sélectionnée */}
            <div style={{ ...cardStyle, padding: 20, alignSelf: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: colors.textSecondary, marginBottom: 14 }}>
                Variante sélectionnée
              </div>

              <Drone3DViewerByUrl
                url={selected.fichier_stl ? `${BASE_URL_FICHIERS}/${selected.fichier_stl}` : null}
                height={170}
                placeholderSeed={resultats.indexOf(selected) + 1}
              />

              <div style={{ marginTop: 14, fontSize: 15, fontWeight: 700 }}>{selected.variante}</div>
              <div style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 16 }}>{selected.materiau}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: Weight, label: "Masse", value: `${selected.masse_kg} kg` },
                  { icon: Shield, label: "Coefficient de sécurité", value: selected.coefficient_securite > 999 ? "Très élevé" : selected.coefficient_securite.toFixed(1) },
                  { icon: Gauge, label: "Contrainte max.", value: `${selected.contrainte_mpa.toFixed(3)} MPa` },
                  { icon: Move, label: "Déplacement", value: `${selected.deplacement_mm < 0.001 ? "< 0.001" : selected.deplacement_mm.toFixed(3)} mm` },
                  { icon: Layers, label: "Volume", value: `${selected.volume_mm3.toFixed(0)} mm³` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: colors.textSecondary }}>
                      <Icon size={13} /> {label}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 18, padding: "13px 0", borderRadius: 12, border: "none",
                  background: colors.accent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >
                <ThumbsUp size={16} /> Choisir cette variante
              </button>

              <div style={{
                marginTop: 12, display: "flex", alignItems: "flex-start", gap: 8,
                fontSize: 11.5, color: colors.textSecondary, lineHeight: 1.5,
              }}>
                <Printer size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                Une fois choisie, la structure peut être exportée en STL pour
                impression 3D (en local ou via votre propre imprimante).
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1400, marginTop: 24 }}>
            <button
              onClick={() => router.push("/optimisation")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 22px", borderRadius: 10, border: `1px solid ${colors.border}`,
                background: "transparent", color: colors.textSecondary, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              <ChevronLeft size={16} /> Retour
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
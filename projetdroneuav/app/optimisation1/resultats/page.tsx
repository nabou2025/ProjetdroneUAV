"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Settings, Sliders, BarChart2, Clock, Bell, Boxes,
  ChevronDown, ChevronRight, ChevronLeft, CheckCircle2, ThumbsUp,
  Weight, Shield, Move, Gauge, Layers, Printer,
} from "lucide-react";
import Drone3DViewerByUrl from "./Drone3DViewerByUrl";

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

// Issu de l'analyse réelle du fichier Excel fourni, mêmes 5 variantes que
// la page Optimisation. `stlUrl: null` tant que le backend ne fournit pas
// encore les fichiers générés — le viewer affiche alors une forme
// procédurale représentative en attendant l'intégration réelle.
const RESULTS = [
  { id: 1, variante: "Résultat 11", materiau: "Titane 6Al-4V",    masse: 0.124, contrainte: 0.013, securite: 65651.6, deplacement: 0.00022, volume: 28025.7, stlUrl: null },
  { id: 2, variante: "Résultat 13", materiau: "AlSi10Mg",          masse: 0.075, contrainte: 0.008, securite: 29981.7, deplacement: 0.00002, volume: 28018.3, stlUrl: null },
  { id: 3, variante: "Résultat 7",  materiau: "ABS",               masse: 0.030, contrainte: 0.003, securite: 6860.96, deplacement: 0.00024, volume: 27993.1, stlUrl: null },
  { id: 4, variante: "Résultat 10", materiau: "Aluminium 2014-T6", masse: 0.081, contrainte: 0.013, securite: 30753.2, deplacement: 0.00043, volume: 29041.0, stlUrl: null },
  { id: 5, variante: "Résultat 15", materiau: "ABS",               masse: 0.017, contrainte: 0.362, securite: 55.228,  deplacement: 0.04700, volume: 15892.9, stlUrl: null },
];

export default function ResultatsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number>(1);

  const selected = RESULTS.find(r => r.id === selectedId)!;

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
  };

  const handleConfirm = () => {
    // TODO backend: enregistrer la variante choisie (selectedId) pour le
    // projet en cours, puis proposer l'export STL / impression 3D locale.
    router.push("/dashboard/export");
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, maxWidth: 1400 }}>

            {/* Grille des 5 résultats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {RESULTS.map(r => (
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
                  <Drone3DViewerByUrl url={r.stlUrl} height={190} placeholderSeed={r.id} />
                </div>
              ))}

              {/* 6e emplacement : carte d'info plutôt qu'un résultat vide */}
              <div style={{
                ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 24, textAlign: "center", color: colors.textSecondary, gap: 8,
              }}>
                <Layers size={22} color={colors.accent} />
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  Ces variantes sont générées par le moteur d'optimisation
                  (IA + analyse topologique) à partir de vos paramètres de mission.
                </div>
              </div>
            </div>

            {/* Panneau de détails — variante sélectionnée */}
            <div style={{ ...cardStyle, padding: 20, alignSelf: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: colors.textSecondary, marginBottom: 14 }}>
                Variante sélectionnée
              </div>

              <Drone3DViewerByUrl url={selected.stlUrl} height={170} placeholderSeed={selected.id} />

              <div style={{ marginTop: 14, fontSize: 15, fontWeight: 700 }}>{selected.variante}</div>
              <div style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 16 }}>{selected.materiau}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: Weight, label: "Masse", value: `${selected.masse} kg` },
                  { icon: Shield, label: "Coefficient de sécurité", value: selected.securite > 999 ? "Très élevé" : selected.securite.toFixed(1) },
                  { icon: Gauge, label: "Contrainte max.", value: `${selected.contrainte.toFixed(3)} MPa` },
                  { icon: Move, label: "Déplacement", value: `${selected.deplacement < 0.001 ? "< 0.001" : selected.deplacement.toFixed(3)} mm` },
                  { icon: Layers, label: "Volume", value: `${selected.volume.toFixed(0)} mm³` },
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
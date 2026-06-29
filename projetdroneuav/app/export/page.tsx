"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Settings, Sliders, BarChart2, Clock, Bell, Boxes,
  ChevronDown, Download, Printer, RotateCcw, CheckCircle2,
  Weight, Shield, Gauge, Move, Layers,
} from "lucide-react";
import Drone3DViewerByUrl from "../optimisation/resultats/Drone3DViewerByUrl";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/accueil" },
  { icon: Settings,        label: "Configuration", href: "/dashboard/configuration" },
  { icon: Sliders,         label: "Optimisation",   href: "/optimisation" },
  { icon: BarChart2,       label: "Résultats",      href: "/optimisation/resultats" },
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

type VarianteChoisie = {
  id: string;
  variante: string;
  materiau: string;
  masse_kg: number;
  contrainte_mpa: number;
  coefficient_securite: number;
  deplacement_mm: number;
  volume_mm3: number;
  fichier_stl: string | null;
  stl_url?: string;
};

export default function ExportPage() {
  const router = useRouter();
  const [variante, setVariante] = useState<VarianteChoisie | null>(null);

  useEffect(() => {
    const stocke = sessionStorage.getItem("variante_choisie");
    if (stocke) {
      try {
        setVariante(JSON.parse(stocke));
      } catch {
        setVariante(null);
      }
    }
  }, []);

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 24,
  };

  const urlTelechargement = variante?.stl_url
    ? (variante.stl_url.startsWith("http") ? variante.stl_url : `http://localhost:8000${variante.stl_url}`)
    : null;

  const handleNouveauProjet = () => {
    sessionStorage.removeItem("variantes_optimisation");
    sessionStorage.removeItem("variante_choisie");
    sessionStorage.removeItem("projet_id_courant");
    router.push("/accueil");
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
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 9, marginBottom: 4,
                color: "#94a3b8", fontSize: 13.5, fontWeight: 400, cursor: "pointer",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
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
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={26} color="#16a34a" /> Structure prête à exporter
              </h1>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, marginTop: 6 }}>
                Téléchargez votre structure optimisée ou préparez-la pour l'impression 3D.
              </p>
            </div>
            <button style={{
              width: 38, height: 38, borderRadius: "50%", border: `1px solid ${colors.border}`,
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <Bell size={17} color={colors.textSecondary} />
            </button>
          </div>

          {!variante ? (
            <div style={{ ...cardStyle, maxWidth: 600, textAlign: "center" }}>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, marginBottom: 16 }}>
                Aucune variante sélectionnée pour cette session. Reprenez le
                processus d'optimisation pour générer et choisir une structure.
              </p>
              <button
                onClick={() => router.push("/accueil")}
                style={{
                  padding: "10px 22px", borderRadius: 10, border: "none",
                  background: colors.accent, color: "#fff", fontWeight: 600, cursor: "pointer",
                }}
              >
                Retour à l'accueil
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 22, maxWidth: 1200 }}>

              {/* Colonne gauche : aperçu + récapitulatif */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em", color: colors.textSecondary }}>
                    Aperçu de la structure retenue
                  </div>
                  <Drone3DViewerByUrl url={urlTelechargement} height={280} placeholderSeed={1} />
                  <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700 }}>{variante.variante}</div>
                  <div style={{ fontSize: 13, color: colors.textSecondary }}>{variante.materiau}</div>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em", color: colors.textSecondary }}>
                    Caractéristiques techniques
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[
                      { icon: Weight, label: "Masse", value: `${variante.masse_kg} kg` },
                      { icon: Shield, label: "Coef. sécurité", value: variante.coefficient_securite > 999 ? "Très élevé" : variante.coefficient_securite.toFixed(1) },
                      { icon: Gauge, label: "Contrainte max.", value: `${variante.contrainte_mpa.toFixed(3)} MPa` },
                      { icon: Move, label: "Déplacement", value: `${variante.deplacement_mm.toFixed(4)} mm` },
                      { icon: Layers, label: "Volume", value: `${variante.volume_mm3.toFixed(0)} mm³` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 10, background: "#fafbfd",
                        border: `1px solid ${colors.border}`,
                      }}>
                        <Icon size={16} color={colors.accent} />
                        <div>
                          <div style={{ fontSize: 11, color: colors.textSecondary }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne droite : actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em", color: colors.textSecondary }}>
                    Export du fichier
                  </div>
                  {urlTelechargement ? (
                    <a
                      href={urlTelechargement}
                      download={variante.fichier_stl ?? "structure-optimisee.stl"}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "13px 0", borderRadius: 12, border: "none",
                        background: colors.accent, color: "#fff", fontSize: 14, fontWeight: 700,
                        textDecoration: "none", marginBottom: 10,
                      }}
                    >
                      <Download size={17} /> Télécharger le fichier STL
                    </a>
                  ) : (
                    <div style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 10 }}>
                      Fichier STL indisponible pour cette variante.
                    </div>
                  )}
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, lineHeight: 1.5 }}>
                    Format STL, compatible avec la plupart des logiciels CAO
                    et trancheurs d'impression 3D (Cura, PrusaSlicer, etc.).
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: colors.textSecondary }}>
                    Impression 3D
                  </div>
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
                    padding: "12px 14px", fontSize: 12.5, color: "#1e40af", lineHeight: 1.5,
                  }}>
                    <Printer size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    Cette structure peut être imprimée sur l'imprimante 3D
                    du laboratoire. Apportez le fichier STL téléchargé ou
                    transmettez-le directement à l'équipe technique.
                  </div>
                </div>

                <button
                  onClick={handleNouveauProjet}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 0", borderRadius: 12, border: `1px solid ${colors.border}`,
                    background: "#fff", color: colors.textSecondary, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <RotateCcw size={16} /> Démarrer un nouveau projet
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
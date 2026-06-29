"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Settings, Sliders, BarChart2, Clock, Bell, Boxes,
  ChevronDown, ChevronRight, ChevronLeft, Trophy, Zap, Shield, Weight,
  Move, Gauge, Loader2,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/accueil" },
  { icon: Settings,        label: "Configuration", href: "/dashboard/configuration" },
  { icon: Sliders,         label: "Optimisation",   href: "/optimisation", active: true },
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

const MISSIONS = [
  { id: "surveillance", label: "Surveillance / inspection" },
  { id: "livraison_colis", label: "Livraison de colis" },
  { id: "livraison_medicament", label: "Livraison de médicaments / sachets légers" },
  { id: "cartographie", label: "Cartographie & topographie" },
];

// Issu de l'analyse réelle du fichier Excel fourni (Tous_les_resultats),
// classé selon les critères : sécurité > masse/déplacement > contrainte,
// après filtrage (coef. sécurité ≥ 2, contrainte < limite admissible du matériau).
const TOP5_RESULTS = [
  { variante: "Résultat 11", materiau: "Titane 6Al-4V",      masse: 0.124, contrainte: 0.013, securite: 65651.6, deplacement: 0.00022, volume: 28025.7, score: 0.759 },
  { variante: "Résultat 13", materiau: "AlSi10Mg",            masse: 0.075, contrainte: 0.008, securite: 29981.7, deplacement: 0.00002, volume: 28018.3, score: 0.700 },
  { variante: "Résultat 7",  materiau: "ABS",                 masse: 0.030, contrainte: 0.003, securite: 6860.96, deplacement: 0.00024, volume: 27993.1, score: 0.691 },
  { variante: "Résultat 10", materiau: "Aluminium 2014-T6",   masse: 0.081, contrainte: 0.013, securite: 30753.2, deplacement: 0.00043, volume: 29041.0, score: 0.690 },
  { variante: "Résultat 15", materiau: "ABS",                 masse: 0.017, contrainte: 0.362, securite: 55.228,  deplacement: 0.04700, volume: 15892.9, score: 0.687 },
];

const MATERIAUX = Array.from(new Set(TOP5_RESULTS.map(r => r.materiau)));

export default function OptimisationPage() {
  const router = useRouter();
  const [mission, setMission] = useState("livraison_colis");
  const [chargeUtile, setChargeUtile] = useState("0.5");
  const [materiau, setMateriau] = useState("");
  const [launching, setLaunching] = useState(false);

  const filtered = useMemo(() => {
    if (!materiau) return TOP5_RESULTS;
    return TOP5_RESULTS.filter(r => r.materiau === materiau);
  }, [materiau]);

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 22,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: colors.textSecondary, marginBottom: 6, display: "block", fontWeight: 500,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${colors.border}`, background: "#fff",
    color: colors.textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  const handleLaunch = () => {
    setLaunching(true);
    // TODO backend: appeler le moteur d'optimisation (IA U-Net + SIMP) avec
    // mission, chargeUtile, materiau comme paramètres, en s'appuyant sur les
    // variantes filtrées comme point de départ.
    setTimeout(() => {
      router.push("/optimisation/resultats");
    }, 1800);
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
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Optimisation</h1>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, marginTop: 6 }}>
                Définissez votre mission, puis comparez les meilleures variantes avant de lancer l'optimisation.
              </p>
            </div>
            <button style={{
              width: 38, height: 38, borderRadius: "50%", border: `1px solid ${colors.border}`,
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <Bell size={17} color={colors.textSecondary} />
            </button>
          </div>

          {/* Paramètres mission */}
          <div style={{ ...cardStyle, marginBottom: 24, maxWidth: 1100 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.04em", color: colors.textSecondary }}>
              Paramètres de la mission
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Type de mission</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={mission} onChange={e => setMission(e.target.value)}>
                  {MISSIONS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Charge utile</label>
                <div style={{ position: "relative" }}>
                  <input type="number" step="0.1" style={inputStyle} value={chargeUtile} onChange={e => setChargeUtile(e.target.value)} />
                  <span style={{ position: "absolute", right: 12, top: 9, fontSize: 12, color: colors.textSecondary }}>kg</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Matériau préféré</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={materiau} onChange={e => setMateriau(e.target.value)}>
                  <option value="">Tous les matériaux</option>
                  {MATERIAUX.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Top 5 recommandations */}
          <div style={{ maxWidth: 1100, marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Trophy size={18} color="#d97706" />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Top 5 des recommandations
              </h2>
              <span style={{ fontSize: 12, color: colors.textSecondary }}>
                — classées par sécurité, masse, déformation et contrainte
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {filtered.map((r, i) => (
                <div key={r.variante} style={{
                  ...cardStyle, padding: 16,
                  border: i === 0 ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                  position: "relative",
                }}>
                  {i === 0 && (
                    <div style={{
                      position: "absolute", top: -10, right: 12,
                      background: colors.accent, color: "#fff", fontSize: 10, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 999,
                    }}>
                      MEILLEUR
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>{r.variante}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{r.materiau}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: colors.textSecondary }}><Weight size={12} /> Masse</span>
                      <span style={{ fontWeight: 600 }}>{r.masse} kg</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: colors.textSecondary }}><Shield size={12} /> Sécurité</span>
                      <span style={{ fontWeight: 600, color: "#16a34a" }}>{r.securite > 999 ? "Très élevé" : r.securite.toFixed(1)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: colors.textSecondary }}><Move size={12} /> Déplacement</span>
                      <span style={{ fontWeight: 600 }}>{r.deplacement < 0.001 ? "< 0.001" : r.deplacement.toFixed(3)} mm</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: colors.textSecondary }}><Gauge size={12} /> Contrainte</span>
                      <span style={{ fontWeight: 600 }}>{r.contrainte.toFixed(3)} MPa</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, height: 5, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${r.score * 100}%`, background: colors.accent, borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 4, textAlign: "right" }}>
                    Score {Math.round(r.score * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lancer l'optimisation */}
          <div style={{ maxWidth: 1100, display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <button
              onClick={handleLaunch}
              disabled={launching}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "16px 40px", borderRadius: 14, border: "none",
                background: launching ? "#93a8c9" : `linear-gradient(135deg, #1d4ed8, ${colors.accent})`,
                color: "#fff", fontSize: 15.5, fontWeight: 700,
                cursor: launching ? "not-allowed" : "pointer",
                boxShadow: launching ? "none" : "0 8px 24px -8px rgba(37,99,235,0.5)",
              }}
            >
              {launching ? (
                <><Loader2 size={19} className="animate-spin" /> Génération en cours…</>
              ) : (
                <><Zap size={19} /> Lancer l'optimisation IA</>
              )}
            </button>
          </div>

          <div style={{ maxWidth: 1100, display: "flex", justifyContent: "flex-start" }}>
            <button
              onClick={() => router.push("/accueil")}
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
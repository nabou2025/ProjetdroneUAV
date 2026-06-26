"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, Settings, BarChart2, Box, Download, HelpCircle, Menu, LogOut, Info,
} from "lucide-react";

const navItems = [
  { icon: Home,       label: "Accueil",         href: "/dashboard" },
  { icon: Settings,   label: "Configuration",   href: "/configuration" },
  { icon: BarChart2,  label: "Résultats",        href: "/dashboard/resultats" },
  { icon: Box,        label: "Visualisation 3D", href: "/dashboard/visualisation" },
  { icon: Download,   label: "Export STL",       href: "/dashboard/export" },
  { icon: Settings,   label: "Paramètres",       href: "/dashboard/parametres" },
  { icon: HelpCircle, label: "Aide",             href: "/dashboard/aide" },
];

const pipelineSteps = [
  { num: 1, label: "Configuration" },
  { num: 2, label: "Contraintes" },
  { num: 3, label: "Optimisation" },
  { num: 4, label: "Résultats" },
  { num: 5, label: "Visualisation & Export" },
];

// ──────────────────────────────────────────────────────────────
// Cette page est conçue pour basculer facilement vers un vrai
// backend plus tard : il suffit de remplacer le contenu de
// `runOptimization` par un appel à votre API FastAPI (fetch ou
// websocket pour le streaming des itérations), en gardant la
// même signature (callback onProgress(iteration, objective)).
// ──────────────────────────────────────────────────────────────
const ITERATIONS_MAX = 200;
const TICK_MS = 60; // vitesse de la simulation

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function OptimisationPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  const [iteration, setIteration] = useState(0);
  const [history, setHistory] = useState<number[]>([1]); // valeur objectif normalisée, départ à 1
  const [elapsedSec, setElapsedSec] = useState(0);
  const [done, setDone] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("uav_user");
    if (!stored) { router.replace("/login"); return; }
    try { setUser(JSON.parse(stored)); } catch { router.replace("/login"); }
  }, [router]);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = () => {
    localStorage.removeItem("uav_user");
    router.replace("/login");
  };

  // Simulation de l'optimisation : décroissance exponentielle bruitée
  // de la fonction objectif, jusqu'à convergence à ITERATIONS_MAX.
  useEffect(() => {
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      setIteration(prev => {
        const next = prev + 1;

        setHistory(h => {
          const decay = Math.exp(-4.2 * (next / ITERATIONS_MAX));
          const noise = 1 + (Math.random() - 0.5) * 0.06;
          const value = Math.max(decay * noise, 0.0009);
          return [...h, value];
        });

        setElapsedSec((Date.now() - startTimeRef.current) / 1000);

        if (next >= ITERATIONS_MAX) {
          clearInterval(interval);
          setDone(true);
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  // Redirection automatique vers les résultats une fois terminé
  useEffect(() => {
    if (done) {
      redirectTimeoutRef.current = setTimeout(() => {
        router.push("/dashboard/contraintes/optimisation/resultats");
      }, 900);
    }
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [done, router]);

  const progressPct = Math.min(100, (iteration / ITERATIONS_MAX) * 100);
  const estimatedTotalSec = iteration > 0 ? (elapsedSec / iteration) * ITERATIONS_MAX : 0;
  const remainingSec = Math.max(0, estimatedTotalSec - elapsedSec);

  // ── construction du graphique (échelle log sur Y, comme le prototype) ──
  const chartW = 760;
  const chartH = 220;
  const padL = 56, padR = 16, padT = 12, padB = 28;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const yTicks = [1, 0.1, 0.01, 0.001, 0.0001];
  const yMin = Math.log10(0.00009);
  const yMax = Math.log10(1.05);
  const yToPx = (v: number) => {
    const t = (Math.log10(Math.max(v, 0.00009)) - yMin) / (yMax - yMin);
    return padT + (1 - t) * plotH;
  };
  const xToPx = (i: number) => padL + (i / ITERATIONS_MAX) * plotW;

  const pathD = history
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xToPx(i).toFixed(1)} ${yToPx(v).toFixed(1)}`)
    .join(" ");

  const cardStyle: React.CSSProperties = {
    background: "#13151f", border: "1px solid #1e2235",
    borderRadius: 14, padding: 22,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 0, minWidth: sidebarOpen ? 220 : 0,
        background: "#13151f", borderRight: "1px solid #1e2235",
        display: "flex", flexDirection: "column",
        transition: "all 0.3s ease", overflow: "hidden", flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div style={{ padding: "24px 20px 16px", cursor: "pointer" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              <span style={{ color: "#fff" }}>UAV-</span>
              <span style={{ color: "#3b82f6" }}>D+</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>
              Système d'aide à la génération de structures topologiques optimisées pour drones UAV
            </div>
          </div>
        </Link>

        <nav style={{ flex: 1, padding: "8px 12px" }}>
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 13, fontWeight: 400,
                transition: "background 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1a1f2e"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={16} />{label}
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ padding: "12px", borderTop: "1px solid #1e2235" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 12px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#60a5fa", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Utilisateur"}
              </div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{user?.role || "Ingénieur"}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", borderRadius: 8, border: "none",
            background: "transparent", color: "#ef4444", fontSize: 13, cursor: "pointer",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#2d1515")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

        {/* Topbar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 28px", background: "#13151f",
          borderBottom: "1px solid #1e2235", position: "sticky", top: 0, zIndex: 10,
        }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <Menu size={20} />
          </button>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>3. Optimisation en cours</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#22c55e" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              Système en ligne
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "#1e2235", borderRadius: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>
                {initials}
              </div>
              <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{user?.name?.split(" ")[0]}</span>
            </div>
          </div>
        </header>

        {/* Pipeline */}
        <div style={{ padding: "20px 28px 0", background: "#13151f", borderBottom: "1px solid #1e2235" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 16 }}>
            {pipelineSteps.map(({ num, label }, i) => (
              <div key={num} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: num === 3 ? "#3b82f6" : "#1a1f2e",
                    border: `2px solid ${num === 3 ? "#3b82f6" : "#2d3548"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    color: num === 3 ? "#fff" : "#475569",
                    flexShrink: 0,
                  }}>
                    {num}
                  </div>
                  <span style={{ fontSize: 12, color: num === 3 ? "#60a5fa" : "#475569", fontWeight: num === 3 ? 600 : 400 }}>
                    {label}
                  </span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div style={{ width: 32, height: 1, background: "#1e2235", margin: "0 8px", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, padding: "40px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>

          <div style={{ width: "100%", maxWidth: 820 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
              Optimisation en cours{done ? " — terminée" : "..."}
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 28 }}>
              Méthode : <span style={{ color: "#94a3b8" }}>IA (U-Net) + SIMP</span>
            </p>

            {/* Barre de progression */}
            <div style={{ marginBottom: 8 }}>
              <div style={{
                width: "100%", height: 10, borderRadius: 999,
                background: "#1a1f2e", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  width: `${progressPct}%`,
                  background: done
                    ? "linear-gradient(90deg, #16a34a, #22c55e)"
                    : "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                  transition: "width 0.06s linear",
                  boxShadow: "0 0 14px rgba(59,130,246,0.5)",
                }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: done ? "#22c55e" : "#60a5fa" }}>
                {progressPct.toFixed(0)}%
              </span>
            </div>

            {/* Compteurs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Itération
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
                  {iteration} / {ITERATIONS_MAX}
                </div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Temps écoulé
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
                  {formatTime(elapsedSec)}
                </div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Temps estimé restant
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
                  {done ? "00:00" : formatTime(remainingSec)}
                </div>
              </div>
            </div>

            {/* Graphique */}
            <div style={{ ...cardStyle, marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.4 }}>
                Évolution de la fonction objectif
              </div>
              <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
                {/* grille horizontale + labels Y (échelle log) */}
                {yTicks.map(t => (
                  <g key={t}>
                    <line
                      x1={padL} x2={chartW - padR}
                      y1={yToPx(t)} y2={yToPx(t)}
                      stroke="#1e2235" strokeWidth={1}
                    />
                    <text x={padL - 10} y={yToPx(t) + 3} fontSize={10} fill="#475569" textAnchor="end">
                      {t}
                    </text>
                  </g>
                ))}
                {/* axe X labels */}
                {[0, 50, 100, 150, 200].map(t => (
                  <text key={t} x={xToPx(t)} y={chartH - 6} fontSize={10} fill="#475569" textAnchor="middle">
                    {t}
                  </text>
                ))}
                <text x={(padL + chartW - padR) / 2} y={chartH - padB + 22} fontSize={10} fill="#64748b" textAnchor="middle">
                  Itérations
                </text>

                {/* courbe */}
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2} />
                {history.length > 0 && (
                  <circle
                    cx={xToPx(history.length - 1)}
                    cy={yToPx(history[history.length - 1])}
                    r={4}
                    fill="#60a5fa"
                  />
                )}
              </svg>
            </div>

            {/* Info box */}
            <div style={{
              background: "#0a1628", border: "1px solid #1e3a5f",
              borderRadius: 10, padding: "12px 16px",
              fontSize: 12, color: "#64748b", lineHeight: 1.6,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <Info size={15} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                {done
                  ? "Optimisation terminée. Redirection vers les résultats..."
                  : "Veuillez patienter pendant que nous calculons la structure optimisée. Vous serez automatiquement redirigé vers les résultats."}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
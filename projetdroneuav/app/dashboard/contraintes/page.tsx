"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, Settings, Sliders, Zap, BarChart2, Box, Download,
  FolderOpen, Clock, HelpCircle, Menu, LogOut, ChevronRight, ChevronLeft, Info,
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

type Motor = { id: number; x: number; y: number };

export default function ContraintesPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  // Conditions de charge
  const [typeCharge, setTypeCharge] = useState("hover");
  const [valeurCharge, setValeurCharge] = useState(19.62);
  const [facteurSecurite, setFacteurSecurite] = useState(1.5);

  // Positions des moteurs (mm, repère centré sur le châssis)
  const [motors, setMotors] = useState<Motor[]>([
    { id: 1, x: -120, y: 120 },
    { id: 2, x: 120, y: 120 },
    { id: 3, x: -120, y: -120 },
    { id: 4, x: 120, y: -120 },
  ]);

  // Paramètres d'optimisation
  const [methode, setMethode] = useState("ia-simp");
  const [iterationsMax, setIterationsMax] = useState(200);
  const [seuilConvergence, setSeuilConvergence] = useState(0.001);
  const [fractionVolumique, setFractionVolumique] = useState(0.5);

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

  const updateMotor = (id: number, axis: "x" | "y", value: number) => {
    setMotors(prev => prev.map(m => (m.id === id ? { ...m, [axis]: value } : m)));
  };

  const handleNext = () => {
    router.push("/dashboard/contraintes/optimisation");
  };

  const handleBack = () => {
    router.push("/dashboard/configuration");
  };

  // --- mise à l'échelle du schéma XY ---
  const svgSize = 280;
  const center = svgSize / 2;
  const maxExtent = Math.max(...motors.map(m => Math.max(Math.abs(m.x), Math.abs(m.y))), 150);
  const scale = (center - 30) / maxExtent;
  const toSvg = (v: number) => v * scale;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid #1e2235", background: "#0f1117",
    color: "#e2e8f0", fontSize: 13, outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 500,
  };

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
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>2. Contraintes et paramètres</div>
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
                    background: num === 2 ? "#3b82f6" : "#1a1f2e",
                    border: `2px solid ${num === 2 ? "#3b82f6" : "#2d3548"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    color: num === 2 ? "#fff" : "#475569",
                    flexShrink: 0,
                  }}>
                    {num}
                  </div>
                  <span style={{ fontSize: 12, color: num === 2 ? "#60a5fa" : "#475569", fontWeight: num === 2 ? 600 : 400 }}>
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

          <div style={{ width: "100%", maxWidth: 1080 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
              Conditions de charge et positions des moteurs
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 28 }}>
              Définissez les contraintes mécaniques qui seront utilisées par l'algorithme d'optimisation topologique.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 }}>

              {/* Conditions de charge */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 18, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Conditions de charge
                </div>

                <label style={labelStyle}>Type de charge</label>
                <select
                  value={typeCharge}
                  onChange={e => setTypeCharge(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 16, cursor: "pointer" }}
                >
                  <option value="hover">Charge verticale (hover)</option>
                  <option value="acceleration">Accélération horizontale</option>
                  <option value="impact">Choc / impact</option>
                  <option value="vent">Rafale de vent latérale</option>
                </select>

                <label style={labelStyle}>Valeur de la charge (N)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valeurCharge}
                  onChange={e => setValeurCharge(parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, marginBottom: 4 }}
                />
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 16 }}>
                  ≈ {(valeurCharge / 9.81).toFixed(2)} kg
                </div>

                <label style={labelStyle}>Facteur de sécurité</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={facteurSecurite}
                  onChange={e => setFacteurSecurite(parseFloat(e.target.value) || 1)}
                  style={inputStyle}
                />
              </div>

              {/* Positions des moteurs */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 18, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Positions des moteurs
                </div>

                <svg width={svgSize} height={svgSize} style={{ display: "block", margin: "0 auto 16px" }}>
                  {/* axes */}
                  <line x1={0} y1={center} x2={svgSize} y2={center} stroke="#1e2235" strokeWidth={1} />
                  <line x1={center} y1={0} x2={center} y2={svgSize} stroke="#1e2235" strokeWidth={1} />
                  {/* labels axes */}
                  <text x={svgSize - 12} y={center - 8} fontSize={10} fill="#ef4444">X</text>
                  <text x={center + 8} y={12} fontSize={10} fill="#22c55e">Y</text>
                  {/* châssis central */}
                  <rect x={center - 14} y={center - 14} width={28} height={28} rx={5} fill="#1e2235" stroke="#334155" strokeWidth={1} />
                  {/* bras + moteurs */}
                  {motors.map(m => {
                    const px = center + toSvg(m.x);
                    const py = center - toSvg(m.y);
                    return (
                      <g key={m.id}>
                        <line x1={center} y1={center} x2={px} y2={py} stroke="#334155" strokeWidth={2} />
                        <circle cx={px} cy={py} r={9} fill="#0f2a4a" stroke="#3b82f6" strokeWidth={2} />
                        <text x={px} y={py + 3} fontSize={9} fill="#60a5fa" textAnchor="middle">{m.id}</text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{ fontSize: 11, color: "#475569", textAlign: "center", marginBottom: 16 }}>
                  Moteurs aux extrémités des bras (mm)
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                  <span>Moteur</span><span>X (mm)</span><span>Y (mm)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {motors.map(m => (
                    <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>#{m.id}</span>
                      <input
                        type="number"
                        value={m.x}
                        onChange={e => updateMotor(m.id, "x", parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }}
                      />
                      <input
                        type="number"
                        value={m.y}
                        onChange={e => updateMotor(m.id, "y", parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Paramètres d'optimisation */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 18, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Paramètres d'optimisation
                </div>

                <label style={labelStyle}>Méthode</label>
                <select
                  value={methode}
                  onChange={e => setMethode(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 16, cursor: "pointer" }}
                >
                  <option value="ia-simp">IA (U-Net) + SIMP</option>
                  <option value="simp">SIMP seul</option>
                  <option value="ia">IA (U-Net) seul</option>
                </select>

                <label style={labelStyle}>Nombre d'itérations max</label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  value={iterationsMax}
                  onChange={e => setIterationsMax(parseInt(e.target.value) || 0)}
                  style={{ ...inputStyle, marginBottom: 16 }}
                />

                <label style={labelStyle}>Seuil de convergence</label>
                <input
                  type="number"
                  step="0.0001"
                  value={seuilConvergence}
                  onChange={e => setSeuilConvergence(parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, marginBottom: 16 }}
                />

                <label style={labelStyle}>Fraction volumique (volfrac)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="1"
                  value={fractionVolumique}
                  onChange={e => setFractionVolumique(parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Info box */}
            <div style={{
              background: "#0a1628", border: "1px solid #1e3a5f",
              borderRadius: 10, padding: "12px 16px",
              fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 32,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <Info size={15} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                Ces paramètres seront utilisés par l'algorithme d'optimisation topologique
                pour générer la structure la plus performante possible.
              </span>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={handleBack}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 10, border: "1px solid #1e2235",
                  background: "transparent", color: "#94a3b8",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1a1f2e"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <ChevronLeft size={16} /> Retour
              </button>

              <button
                onClick={handleNext}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 28px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  color: "#fff",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
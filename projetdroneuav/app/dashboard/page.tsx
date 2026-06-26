"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, Settings, Sliders, Zap, BarChart2, Box, Download,
  FolderOpen, Clock, HelpCircle, Menu, LogOut, ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: Home,       label: "Accueil",         href: "/dashboard" },
  { icon: Settings,   label: "Configuration",   href: "/configuration", active: true },
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

export default function ConfigurationPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selected, setSelected] = useState("");
  const [user, setUser] = useState<{name: string; email: string; role: string} | null>(null);

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

  const handleNext = () => {
    if (!selected) return;
    if (selected === "new") router.push("/dashboard/configuration/parametres");
    else router.push("/dashboard/configuration/import");
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
          {navItems.map(({ icon: Icon, label, href, active }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
                background: active ? "#1e3a5f" : "transparent",
                color: active ? "#60a5fa" : "#94a3b8",
                fontSize: 13, fontWeight: active ? 600 : 400,
                transition: "background 0.15s",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#1a1f2e"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={16} />{label}
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ padding: "12px", borderTop: "1px solid #1e2235" }}>
          {/* User info */}
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
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>1. Configuration du drone</div>
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
                    background: num === 1 ? "#3b82f6" : "#1a1f2e",
                    border: `2px solid ${num === 1 ? "#3b82f6" : "#2d3548"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    color: num === 1 ? "#fff" : "#475569",
                    flexShrink: 0,
                  }}>
                    {num}
                  </div>
                  <span style={{ fontSize: 12, color: num === 1 ? "#60a5fa" : "#475569", fontWeight: num === 1 ? 600 : 400 }}>
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

          <div style={{ width: "100%", maxWidth: 680 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
              Choisir le mode de conception
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32 }}>
              Sélectionnez comment vous souhaitez démarrer votre projet drone.
            </p>

            {/* Cards choix */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>

              {/* Créer nouvelle structure */}
              <div
                onClick={() => setSelected("new")}
                style={{
                  background: selected === "new" ? "#0f2a4a" : "#13151f",
                  border: `2px solid ${selected === "new" ? "#3b82f6" : "#1e2235"}`,
                  borderRadius: 16, padding: 28, cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                }}
                onMouseEnter={e => { if (selected !== "new") e.currentTarget.style.borderColor = "#334155"; }}
                onMouseLeave={e => { if (selected !== "new") e.currentTarget.style.borderColor = "#1e2235"; }}
              >
                {/* Icône drone */}
                <div style={{
                  width: 80, height: 80, borderRadius: 16,
                  background: selected === "new" ? "#1e3a5f" : "#1e2235",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <line x1="18" y1="18" x2="8" y2="8" stroke={selected === "new" ? "#3b82f6" : "#475569"} strokeWidth="3" strokeLinecap="round"/>
                    <line x1="30" y1="18" x2="40" y2="8" stroke={selected === "new" ? "#3b82f6" : "#475569"} strokeWidth="3" strokeLinecap="round"/>
                    <line x1="18" y1="30" x2="8" y2="40" stroke={selected === "new" ? "#3b82f6" : "#475569"} strokeWidth="3" strokeLinecap="round"/>
                    <line x1="30" y1="30" x2="40" y2="40" stroke={selected === "new" ? "#3b82f6" : "#475569"} strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="8" cy="8" r="4" fill={selected === "new" ? "#3b82f6" : "#475569"}/>
                    <circle cx="40" cy="8" r="4" fill={selected === "new" ? "#3b82f6" : "#475569"}/>
                    <circle cx="8" cy="40" r="4" fill={selected === "new" ? "#3b82f6" : "#475569"}/>
                    <circle cx="40" cy="40" r="4" fill={selected === "new" ? "#3b82f6" : "#475569"}/>
                    <rect x="18" y="18" width="12" height="12" rx="3" fill={selected === "new" ? "#3b82f6" : "#475569"}/>
                  </svg>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: selected === "new" ? "#60a5fa" : "#e2e8f0", marginBottom: 6 }}>
                    Créer une nouvelle structure
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    Générer une structure à partir de paramètres et de l'optimisation SIMP
                  </div>
                </div>

                {selected === "new" && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                  </div>
                )}
              </div>

              {/* Importer structure existante */}
              <div
                onClick={() => setSelected("import")}
                style={{
                  background: selected === "import" ? "#0f2a4a" : "#13151f",
                  border: `2px solid ${selected === "import" ? "#3b82f6" : "#1e2235"}`,
                  borderRadius: 16, padding: 28, cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                }}
                onMouseEnter={e => { if (selected !== "import") e.currentTarget.style.borderColor = "#334155"; }}
                onMouseLeave={e => { if (selected !== "import") e.currentTarget.style.borderColor = "#1e2235"; }}
              >
                {/* Icône upload */}
                <div style={{
                  width: 80, height: 80, borderRadius: 16,
                  background: selected === "import" ? "#1e3a5f" : "#1e2235",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect x="6" y="14" width="28" height="20" rx="4" stroke={selected === "import" ? "#3b82f6" : "#475569"} strokeWidth="2.5"/>
                    <path d="M20 6 L20 24 M14 12 L20 6 L26 12" stroke={selected === "import" ? "#3b82f6" : "#475569"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 30 h16" stroke={selected === "import" ? "#3b82f6" : "#475569"} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: selected === "import" ? "#60a5fa" : "#e2e8f0", marginBottom: 6 }}>
                    Importer une structure existante
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    Importer un fichier STL/OBJ/STEP pour l'optimiser
                  </div>
                </div>

                {selected === "import" && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Info box */}
            <div style={{
              background: "#0a1628", border: "1px solid #1e3a5f",
              borderRadius: 10, padding: "12px 16px",
              fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 32,
            }}>
              💡 <strong style={{ color: "#60a5fa" }}>UAV-D+</strong> utilise l'IA (U-Net) et l'optimisation topologique (SIMP)
              pour générer une structure plus légère et performante.
            </div>

            {/* Bouton Suivant */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleNext}
                disabled={!selected}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 28px", borderRadius: 10, border: "none",
                  background: selected ? "linear-gradient(135deg, #1d4ed8, #3b82f6)" : "#1e2235",
                  color: selected ? "#fff" : "#475569",
                  fontSize: 14, fontWeight: 600, cursor: selected ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: selected ? "0 0 20px rgba(59,130,246,0.3)" : "none",
                }}
                onMouseEnter={e => { if (selected) e.currentTarget.style.opacity = "0.85"; }}
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
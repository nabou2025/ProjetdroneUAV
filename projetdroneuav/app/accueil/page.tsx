"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Settings, Sliders, BarChart2, Clock, HelpCircle,
  Bell, Boxes, ChevronDown, ChevronRight, FileSpreadsheet, Sparkles,
  Upload, CheckCircle2,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/accueil", active: true },
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

export default function AccueilPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"existant" | "import" | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    padding: 28,
  };

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setExcelFile(f);
  };

  const handleContinue = () => {
    if (selected === "existant") {
      router.push("/optimisation?source=fourni");
    } else if (selected === "import" && excelFile) {
      // TODO backend: uploader excelFile et faire analyser ses propositions
      router.push("/optimisation?source=import");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg, color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 230, minWidth: 230, background: colors.sidebarBg,
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "22px 22px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
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
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                cursor: "pointer", transition: "background 0.15s",
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
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", flexShrink: 0,
          }}>
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
        <main style={{ flex: 1, padding: "36px 40px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
                Bienvenue sur UAV-D+
              </h1>
              <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 6 }}>
                Choisissez comment démarrer votre optimisation de structure de drone.
              </p>
            </div>
            <button style={{
              width: 38, height: 38, borderRadius: "50%", border: `1px solid ${colors.border}`,
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              <Bell size={17} color={colors.textSecondary} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32, maxWidth: 1000 }}>

            {/* Option 1 — drone optimisé déjà fourni */}
            <div
              onClick={() => setSelected("existant")}
              style={{
                ...cardStyle,
                cursor: "pointer",
                border: `2px solid ${selected === "existant" ? colors.accent : colors.border}`,
                background: selected === "existant" ? "#eff6ff" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: "#dbeafe",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
              }}>
                <Sparkles size={24} color={colors.accent} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                Utiliser le modèle optimisé disponible
              </h3>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
                Démarrez à partir d'une structure de drone déjà optimisée, avec un ensemble
                de variantes prêtes à comparer. Idéal pour tester rapidement le pipeline
                d'optimisation sans préparer vos propres données.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {["Variantes pré-calculées disponibles", "Plusieurs matériaux au choix", "Prêt à optimiser immédiatement"].map(t => (
                  <li key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: colors.textSecondary }}>
                    <CheckCircle2 size={14} color="#16a34a" /> {t}
                  </li>
                ))}
              </ul>
              {selected === "existant" && (
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6, color: colors.accent, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={15} /> Sélectionné
                </div>
              )}
            </div>

            {/* Option 2 — import du fichier Excel personnel */}
            <div
              onClick={() => setSelected("import")}
              style={{
                ...cardStyle,
                cursor: "pointer",
                border: `2px solid ${selected === "import" ? colors.accent : colors.border}`,
                background: selected === "import" ? "#eff6ff" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: "#dbeafe",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
              }}>
                <FileSpreadsheet size={24} color={colors.accent} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                Importer mes propres résultats
              </h3>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
                Vous avez généré vos propres variantes de structure (ex. via une étude
                générative) ? Importez le fichier de résultats pour que l'application
                analyse vos propositions.
              </p>

              <div
                onClick={e => e.stopPropagation()}
                style={{
                  border: `1.5px dashed ${colors.border}`, borderRadius: 10,
                  padding: "16px", textAlign: "center", background: "#fafbfd",
                }}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  id="excel-upload"
                  onChange={handleExcelChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="excel-upload" style={{ cursor: "pointer" }}>
                  <Upload size={20} color={colors.accent} style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 12.5, color: colors.textPrimary }}>
                    {excelFile ? (
                      <span style={{ fontWeight: 600 }}>{excelFile.name}</span>
                    ) : (
                      <>Glissez votre fichier ou <span style={{ color: colors.accent, fontWeight: 600 }}>cliquez pour parcourir</span></>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                    Formats acceptés : XLSX, XLS, CSV
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32, maxWidth: 1000, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleContinue}
              disabled={!selected || (selected === "import" && !excelFile)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "13px 28px", borderRadius: 12, border: "none",
                background: (!selected || (selected === "import" && !excelFile)) ? "#cbd5e1" : colors.accent,
                color: "#fff", fontSize: 14.5, fontWeight: 700,
                cursor: (!selected || (selected === "import" && !excelFile)) ? "not-allowed" : "pointer",
              }}
            >
              Continuer <ChevronRight size={17} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Settings, Sliders, BarChart2, Clock, HelpCircle,
  Bell, Upload, FileText, Trash2, CheckCircle2, AlertTriangle,
  Boxes, Ruler, Layers, Activity, ChevronRight, Info, ChevronDown, Circle,
} from "lucide-react";
import Drone3DViewer from "./Drone3DViewer";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/dashboard" },
  { icon: Settings,        label: "Configuration",  href: "/dashboard/configuration-v2", active: true },
  { icon: Sliders,         label: "Optimisation",    href: "/dashboard/contraintes/optimisation" },
  { icon: BarChart2,       label: "Résultats",       href: "/dashboard/resultats" },
  { icon: Clock,           label: "Historique",      href: "/dashboard/historique" },
  { icon: Settings,        label: "Paramètres",      href: "/dashboard/parametres" },
];

const steps = [
  { num: 1, label: "Informations" },
  { num: 2, label: "Composants" },
  { num: 3, label: "Vérification" },
];

const howItWorks = [
  { icon: Upload,   title: "1. Import du modèle",        desc: "Importez votre drone existant (STL, OBJ, STEP ou STP)." },
  { icon: FileText, title: "2. Saisie des informations",  desc: "Renseignez les paramètres techniques et composants actuels." },
  { icon: CheckCircle2, title: "3. Vérification automatique", desc: "L'application analyse votre drone et vérifie la cohérence des données." },
  { icon: Activity, title: "4. Optimisation",             desc: "Notre IA propose une structure améliorée et plus performante." },
];

type AnalysisResult = {
  structure: string;
  dimensions: string;
  volume: string;
  surface: string;
};

export default function ConfigurationV2Page() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Informations générales
  const [nomDrone, setNomDrone] = useState("");
  const [typeMission, setTypeMission] = useState("livraison");
  const [poidsTotal, setPoidsTotal] = useState("");
  const [chargeUtile, setChargeUtile] = useState("");
  const [tempsVol, setTempsVol] = useState("");
  const [description, setDescription] = useState("");

  // Composants actuels
  const [batterie, setBatterie] = useState("");
  const [nbMoteurs, setNbMoteurs] = useState("4");
  const [puissanceMoteur, setPuissanceMoteur] = useState("");
  const [diametreHelice, setDiametreHelice] = useState("");

  const acceptedExt = [".stl", ".obj", ".step", ".stp"];

  const handleFileSelected = useCallback((f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!acceptedExt.includes(ext)) {
      alert(`Format non supporté. Formats acceptés : ${acceptedExt.join(", ")}`);
      return;
    }
    setFile(f);
    setAnalysis(null);
    setAnalyzing(true);

    // Analyse automatique simulée à partir du fichier réel (taille, etc.)
    // → à terme : à remplacer par un appel backend qui parse réellement
    //   la géométrie (bounding box, volume, nb moteurs détectés...).
    setTimeout(() => {
      const sizeMb = f.size / (1024 * 1024);
      setAnalysis({
        structure: `Quadricoptère (${nbMoteurs} moteurs)`,
        dimensions: "450 mm x 450 mm x 150 mm",
        volume: `${(2.2 + sizeMb * 0.3).toFixed(2)} L`,
        surface: `${(0.5 + sizeMb * 0.08).toFixed(2)} m²`,
      });
      setAnalyzing(false);
    }, 1200);
  }, [nbMoteurs]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelected(f);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelected(f);
  };

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
  };

  // ── Vérification automatique (règles simples, ajustables) ──
  const poidsNum = parseFloat(poidsTotal) || 0;
  const chargeNum = parseFloat(chargeUtile) || 0;
  const batterieNum = parseFloat(batterie) || 0;

  const poidsValide = poidsNum > 0 && poidsNum <= 25; // ex: limite réglementaire générique
  const batterieCompatible = batterieNum > 0;
  const chargeElevee = chargeNum > 0 && poidsNum > 0 && chargeNum / poidsNum > 0.5;

  // Coefficient E (rigidité/efficacité estimée) — heuristique simple à but
  // d'affichage tant que le vrai calcul structurel n'est pas branché.
  const coefficientE = (() => {
    if (!analysis || poidsNum <= 0) return null;
    const ratio = chargeNum > 0 ? chargeNum / poidsNum : 0.3;
    const raw = 0.75 - ratio * 0.5 - (sizeFactor(file) * 0.05);
    return Math.max(0.1, Math.min(0.95, raw));
  })();

  function sizeFactor(f: File | null) {
    if (!f) return 0;
    return Math.min(f.size / (5 * 1024 * 1024), 1);
  }

  const coefficientLabel = coefficientE === null
    ? null
    : coefficientE < 0.5 ? "Faible" : coefficientE < 0.75 ? "Moyen" : "Bon";
  const coefficientColor = coefficientE === null
    ? "#94a3b8"
    : coefficientE < 0.5 ? "#f59e0b" : coefficientE < 0.75 ? "#3b82f6" : "#22c55e";

  const handleSubmit = () => {
    const payload = {
      file: file ? { name: file.name, size: file.size } : null,
      analysis,
      nomDrone, typeMission, poidsTotal, chargeUtile, tempsVol, description,
      batterie, nbMoteurs, puissanceMoteur, diametreHelice,
      coefficientE,
    };
    // TODO étape suivante : persister dans Firestore + uploader le fichier
    // dans Firebase Storage, plutôt que localStorage.
    localStorage.setItem("uav_config_v2", JSON.stringify(payload));
    router.push("/dashboard/configuration-v2/composants");
  };

  // ── styles partagés ──
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

  const cardStyle: React.CSSProperties = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 22,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: colors.textSecondary, marginBottom: 6, display: "block", fontWeight: 500,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${colors.border}`, background: "#fff",
    color: colors.textPrimary, fontSize: 13, outline: "none",
    boxSizing: "border-box",
  };

  const inputGroupStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 0,
  };

  const unitStyle: React.CSSProperties = {
    fontSize: 12, color: colors.textSecondary, marginLeft: -34, pointerEvents: "none",
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

        <main style={{ flex: 1, padding: "28px 36px 0" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
              Configuration du drone
            </h1>
            <button style={{
              width: 38, height: 38, borderRadius: "50%", border: `1px solid ${colors.border}`,
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              <Bell size={17} color={colors.textSecondary} />
              <span style={{
                position: "absolute", top: -4, right: -4,
                background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700,
                width: 18, height: 18, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>3</span>
            </button>
          </div>

          {/* Pipeline (3 étapes) */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 32, maxWidth: 480 }}>
            {steps.map(({ num, label }, i) => (
              <div key={num} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: num === 1 ? colors.accent : "#fff",
                    border: `2px solid ${num === 1 ? colors.accent : colors.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                    color: num === 1 ? "#fff" : "#94a3b8",
                  }}>
                    {num}
                  </div>
                  <span style={{ fontSize: 12, color: num === 1 ? colors.accent : "#94a3b8", fontWeight: num === 1 ? 700 : 400, whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: num === 1 ? colors.accent : colors.border, margin: "0 8px 18px" }} />
                )}
              </div>
            ))}
          </div>

          {/* Grille principale */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* Importer un drone existant */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>Importer un drone existant</div>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `1.5px dashed ${colors.border}`, borderRadius: 12,
                  padding: "28px 20px", textAlign: "center", cursor: "pointer",
                  background: "#fafbfd", marginBottom: 14,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = colors.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedExt.join(",")}
                  onChange={onFileInputChange}
                  style={{ display: "none" }}
                />
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: "#eff6ff",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
                }}>
                  <Upload size={20} color={colors.accent} />
                </div>
                <div style={{ fontSize: 13.5, color: colors.textPrimary, marginBottom: 4 }}>
                  Glisser-déposer votre fichier ici<br />
                  ou <span style={{ color: colors.accent, fontWeight: 600 }}>cliquer pour parcourir</span>
                </div>
                <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 8 }}>
                  Formats acceptés : STL, OBJ, STEP, STP (Max. 50 Mo)
                </div>
              </div>

              {file && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${colors.border}`, background: "#fafbfd",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: "#eff6ff",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <FileText size={16} color={colors.accent} />
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {file.name}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: colors.textSecondary, whiteSpace: "nowrap" }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} Mo
                  </span>
                  {analyzing ? (
                    <div style={{ width: 16, height: 16, border: "2px solid #cbd5e1", borderTopColor: colors.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  ) : (
                    <CheckCircle2 size={18} color="#22c55e" />
                  )}
                  <button onClick={removeFile} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Aperçu 3D */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>Aperçu 3D du drone</div>
              <Drone3DViewer file={file} height={300} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* Informations générales */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>Informations générales</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Nom du drone</label>
                  <input style={inputStyle} placeholder="DJI-X1" value={nomDrone} onChange={e => setNomDrone(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Type de mission</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={typeMission} onChange={e => setTypeMission(e.target.value)}>
                    <option value="livraison">Livraison de colis</option>
                    <option value="surveillance">Surveillance / inspection</option>
                    <option value="cartographie">Cartographie aérienne</option>
                    <option value="loisir">Loisir / FPV</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Poids total</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" step="0.1" style={inputStyle} placeholder="8.0" value={poidsTotal} onChange={e => setPoidsTotal(e.target.value)} />
                    <span style={{ position: "absolute", right: 12, top: 9, fontSize: 12, color: colors.textSecondary }}>kg</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Charge utile</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" step="0.1" style={inputStyle} placeholder="5.0" value={chargeUtile} onChange={e => setChargeUtile(e.target.value)} />
                    <span style={{ position: "absolute", right: 12, top: 9, fontSize: 12, color: colors.textSecondary }}>kg</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Temps de vol actuel</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" style={inputStyle} placeholder="18" value={tempsVol} onChange={e => setTempsVol(e.target.value)} />
                    <span style={{ position: "absolute", right: 12, top: 9, fontSize: 12, color: colors.textSecondary }}>min</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description (optionnel)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 64, resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Entrez une description ou des contraintes spécifiques..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Analyse automatique */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>Analyse automatique du modèle</div>
              {!file ? (
                <div style={{ fontSize: 13, color: colors.textSecondary, textAlign: "center", padding: "32px 0" }}>
                  Importez un fichier pour lancer l'analyse automatique.
                </div>
              ) : analyzing ? (
                <div style={{ fontSize: 13, color: colors.textSecondary, textAlign: "center", padding: "32px 0" }}>
                  Analyse du modèle en cours…
                </div>
              ) : analysis ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { icon: Boxes, label: "Structure détectée", value: analysis.structure },
                    { icon: Ruler, label: "Dimensions estimées", value: analysis.dimensions },
                    { icon: Layers, label: "Volume estimé", value: analysis.volume },
                    { icon: Activity, label: "Surface estimée", value: analysis.surface },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 10, background: "#fafbfd",
                      border: `1px solid ${colors.border}`,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, background: "#eff6ff",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={16} color={colors.accent} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: colors.accent }}>{label}</div>
                        <div style={{ fontSize: 13, color: colors.textPrimary, marginTop: 1 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

            {/* Composants actuels */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>Composants actuels</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Batterie</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" style={inputStyle} placeholder="4000" value={batterie} onChange={e => setBatterie(e.target.value)} />
                    <span style={{ position: "absolute", right: 12, top: 9, fontSize: 12, color: colors.textSecondary }}>mAh</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Nombre de moteurs</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={nbMoteurs} onChange={e => setNbMoteurs(e.target.value)}>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Puissance moteur (KV)</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" style={inputStyle} placeholder="920" value={puissanceMoteur} onChange={e => setPuissanceMoteur(e.target.value)} />
                    <span style={{ position: "absolute", right: 12, top: 9, fontSize: 12, color: colors.textSecondary }}>KV</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Diamètre hélice</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" style={inputStyle} placeholder="10" value={diametreHelice} onChange={e => setDiametreHelice(e.target.value)} />
                    <span style={{ position: "absolute", right: 12, top: 9, fontSize: 12, color: colors.textSecondary }}>pouces</span>
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
                padding: "10px 12px", fontSize: 12, color: "#1e40af",
              }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                Vous pourrez modifier ces composants lors de l'optimisation.
              </div>
            </div>

            {/* Vérification automatique */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>Vérification automatique</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                {[
                  {
                    label: "Poids",
                    ok: poidsNum > 0 ? poidsValide : null,
                    text: poidsNum === 0 ? "—" : poidsValide ? "Valide" : "Hors limite",
                  },
                  {
                    label: "Batterie",
                    ok: batterieNum > 0 ? batterieCompatible : null,
                    text: batterieNum === 0 ? "—" : "Compatible",
                  },
                  {
                    label: "Charge utile",
                    ok: chargeNum > 0 && poidsNum > 0 ? !chargeElevee : null,
                    text: chargeNum === 0 || poidsNum === 0 ? "—" : chargeElevee ? "Élevée" : "Correcte",
                  },
                  {
                    label: "Coefficient E estimé",
                    ok: coefficientE === null ? null : coefficientE >= 0.5,
                    text: coefficientE === null ? "—" : `${coefficientLabel} (${coefficientE.toFixed(2)})`,
                  },
                ].map(({ label, ok, text }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 4px", borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <span style={{ fontSize: 13, color: ok === null ? "#94a3b8" : colors.textPrimary }}>{label}</span>
                    {ok === null ? (
                      <span style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontSize: 11.5, fontWeight: 500, color: "#aab4c2",
                        padding: "3px 9px", borderRadius: 999,
                        border: "1px dashed #d8dee8", background: "#fafbfd",
                      }}>
                        <Circle size={8} fill="#cbd5e1" stroke="none" />
                        À compléter
                      </span>
                    ) : (
                      <span style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontSize: 12.5, fontWeight: 600,
                        color: ok ? "#16a34a" : "#d97706",
                      }}>
                        {ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        {text}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {coefficientE !== null && (
                <div style={{
                  background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10,
                  padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#92400e" }}>Coefficient E (estimation)</span>
                    <Info size={13} color="#92400e" />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: coefficientColor, marginBottom: 4 }}>
                    {coefficientE.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: "#78716c", lineHeight: 1.5 }}>
                    {coefficientLabel === "Faible"
                      ? "Le coefficient E est faible. L'optimisation pourra améliorer significativement l'autonomie."
                      : coefficientLabel === "Moyen"
                      ? "Le coefficient E est correct. Une optimisation ciblée peut encore améliorer les performances."
                      : "Le coefficient E est bon. La structure actuelle est déjà proche de l'optimal."}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            onClick={handleSubmit}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 0", borderRadius: 12, border: "none",
              background: colors.accent, color: "#fff",
              fontSize: 14.5, fontWeight: 700, cursor: "pointer", marginBottom: 10,
            }}
          >
            Enregistrer et lancer l'optimisation <ChevronRight size={17} />
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: colors.textSecondary, marginBottom: 28 }}>
            🔒 Vos données sont sécurisées et seront utilisées uniquement pour l'optimisation.
          </div>

          {/* Bandeau "Comment ça fonctionne" */}
          <div style={{ ...cardStyle, marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.accent, marginBottom: 18 }}>
              Comment ça fonctionne ?
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
              {howItWorks.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", background: "#eff6ff",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
                  }}>
                    <Icon size={19} color={colors.accent} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #b6c0cc; }
      `}</style>
    </div>
  );
}
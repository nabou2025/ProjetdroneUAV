"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, Settings, BarChart2, Box, Download,
  HelpCircle, Menu, LogOut, ChevronRight, ChevronLeft,
} from "lucide-react";

function DroneSVG({ type }: { type: string }) {
  const color = "#3b82f6";
  const arm = "#475569";
  const motor = "#1e293b";
  const motorStroke = "#334155";

  const arms: [number,number][] = type === "tri"
    ? [[130,90],[50,40],[210,40],[90,160]]
    : type === "quad"
    ? [[130,90],[50,40],[210,40],[50,150],[210,150]]
    : type === "hexa"
    ? [[130,90],[50,40],[210,40],[20,110],[240,110],[50,160],[210,160]]
    : [[130,90],[40,35],[130,25],[220,35],[240,110],[220,170],[130,185],[40,170],[20,110]];

  const motors = arms.slice(1);

  return (
    <svg width="260" height="200" viewBox="0 0 260 200">
      {/* Bras */}
      {motors.map(([mx,my], i) => (
        <line key={i} x1="130" y1="90" x2={mx} y2={my}
          stroke={arm} strokeWidth="5" strokeLinecap="round"/>
      ))}
      {/* Moteurs */}
      {motors.map(([mx,my], i) => (
        <g key={i}>
          <circle cx={mx} cy={my} r="14" fill={motor} stroke={motorStroke} strokeWidth="2"/>
          <circle cx={mx} cy={my} r="7" fill="#0f172a" stroke={arm} strokeWidth="1"/>
          <ellipse cx={mx} cy={my} rx="20" ry="3.5" fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>
        </g>
      ))}
      {/* Corps */}
      <rect x="116" y="76" width="28" height="28" rx="6" fill="#334155"/>
      <circle cx="130" cy="90" r="10" fill="#1e293b" stroke={color} strokeWidth="1.5"/>
      <circle cx="130" cy="90" r="4" fill={color} opacity="0.7"/>
    </svg>
  );
}

const navItems = [
  { icon: Home,       label: "Accueil",         href: "/dashboard" },
  { icon: Settings,   label: "Configuration",   href: "/dashboard/configuration", active: true },
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

const TYPES = [
  { id: "tri",   label: "Tri",  sub: "3 bras" },
  { id: "quad",  label: "Quad", sub: "4 bras" },
  { id: "hexa",  label: "Hexa", sub: "6 bras" },
  { id: "octo",  label: "Octo", sub: "8 bras" },
];

const MATERIAUX = [
  { id: "alu",    label: "Aluminium 6061",  sub: "E = 70 GPa · 2 700 kg/m³" },
  { id: "carbone",label: "Fibre de carbone",sub: "E = 70 GPa · 1 600 kg/m³" },
  { id: "titane", label: "Titane Ti-6AI-4V",sub: "E = 116 GPa · 4 500 kg/m³" },
  { id: "pla",    label: "PLA",             sub: "E = 3.5 GPa · 1 240 kg/m³" },
];

export default function ParametresPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{name:string;email:string;role:string}|null>(null);

  // Paramètres drone
  const [typeDrone, setTypeDrone]     = useState("quad");
  const [masse, setMasse]             = useState(800);
  const [chargeUtile, setChargeUtile] = useState(200);
  const [autonomie, setAutonomie]     = useState(30);
  const [materiau, setMateriau]       = useState("carbone");

  useEffect(() => {
    const stored = localStorage.getItem("uav_user");
    if (!stored) { router.replace("/login"); return; }
    try { setUser(JSON.parse(stored)); } catch { router.replace("/login"); }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("uav_user");
    router.replace("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n:string) => n[0]).join("").toUpperCase().slice(0,2)
    : "U";

  const handleNext = () => {
    // Sauvegarder les paramètres
    localStorage.setItem("uav_config", JSON.stringify({ typeDrone, masse, chargeUtile, autonomie, materiau }));
    router.push("/dashboard/contraintes");
  };

  const s = { /* shared input style */
    card: (active: boolean): React.CSSProperties => ({
      flex: 1, padding: "10px 8px", borderRadius: 8, cursor: "pointer",
      border: `2px solid ${active ? "#3b82f6" : "#1e2235"}`,
      background: active ? "#0f2a4a" : "#1a1f2e",
      color: active ? "#60a5fa" : "#94a3b8",
      fontSize: 13, fontWeight: active ? 700 : 400,
      textAlign: "center" as const, transition: "all 0.15s",
    }),
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0f1117", color:"#e2e8f0", fontFamily:"'Inter',sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 0, minWidth: sidebarOpen ? 220 : 0,
        background:"#13151f", borderRight:"1px solid #1e2235",
        display:"flex", flexDirection:"column",
        transition:"all 0.3s ease", overflow:"hidden", flexShrink:0,
      }}>
        <Link href="/dashboard" style={{ textDecoration:"none" }}>
          <div style={{ padding:"24px 20px 16px", cursor:"pointer" }}>
            <div style={{ fontSize:22, fontWeight:800 }}>
              <span style={{ color:"#fff" }}>UAV-</span>
              <span style={{ color:"#3b82f6" }}>D+</span>
            </div>
            <div style={{ fontSize:11, color:"#64748b", marginTop:4, lineHeight:1.4 }}>
              Système d'aide à la génération de structures topologiques optimisées pour drones UAV
            </div>
          </div>
        </Link>

        <nav style={{ flex:1, padding:"8px 12px" }}>
          {navItems.map(({ icon:Icon, label, href, active }) => (
            <Link key={label} href={href} style={{ textDecoration:"none" }}>
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"9px 12px", borderRadius:8, marginBottom:2, cursor:"pointer",
                background: active ? "#1e3a5f" : "transparent",
                color: active ? "#60a5fa" : "#94a3b8",
                fontSize:13, fontWeight: active ? 600 : 400,
                transition:"background 0.15s",
              }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.background="#1a1f2e"; }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.background="transparent"; }}
              >
                <Icon size={16}/>{label}
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ padding:"12px", borderTop:"1px solid #1e2235" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 8px 12px" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"#1e3a5f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#60a5fa", flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name || "Utilisateur"}</div>
              <div style={{ fontSize:10, color:"#64748b" }}>{user?.role || "Ingénieur"}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width:"100%", display:"flex", alignItems:"center", gap:8,
            padding:"9px 12px", borderRadius:8, border:"none",
            background:"transparent", color:"#ef4444", fontSize:13, cursor:"pointer",
          }}
            onMouseEnter={e => (e.currentTarget.style.background="#2d1515")}
            onMouseLeave={e => (e.currentTarget.style.background="transparent")}
          >
            <LogOut size={15}/> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto" }}>

        {/* Topbar */}
        <header style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"14px 28px", background:"#13151f",
          borderBottom:"1px solid #1e2235", position:"sticky", top:0, zIndex:10,
        }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
            <Menu size={20}/>
          </button>
          <div style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>2. Paramètres du drone</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#22c55e" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e" }}/>
              Système en ligne
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 10px", background:"#1e2235", borderRadius:8 }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:"#1e3a5f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#60a5fa" }}>{initials}</div>
              <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{user?.name?.split(" ")[0]}</span>
            </div>
          </div>
        </header>

        {/* Pipeline */}
        <div style={{ padding:"20px 28px 0", background:"#13151f", borderBottom:"1px solid #1e2235" }}>
          <div style={{ display:"flex", alignItems:"center", paddingBottom:16, overflowX:"auto" }}>
            {pipelineSteps.map(({ num, label }, i) => (
              <div key={num} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap" }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%",
                    background: num <= 2 ? "#3b82f6" : "#1a1f2e",
                    border:`2px solid ${num <= 2 ? "#3b82f6" : "#2d3548"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:700,
                    color: num <= 2 ? "#fff" : "#475569",
                    flexShrink:0,
                  }}>{num}</div>
                  <span style={{ fontSize:12, color: num <= 2 ? "#60a5fa" : "#475569", fontWeight: num <= 2 ? 600 : 400 }}>{label}</span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div style={{ width:32, height:1, background:"#1e2235", margin:"0 8px", flexShrink:0 }}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <main style={{ flex:1, padding:"28px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24, maxWidth:1100, margin:"0 auto" }}>

            {/* Colonne gauche — formulaire */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Type de drone */}
              <div style={{ background:"#13151f", border:"1px solid #1e2235", borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>
                  Type de drone
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {TYPES.map(t => (
                    <div key={t.id} onClick={() => setTypeDrone(t.id)} style={s.card(typeDrone === t.id)}>
                      <div style={{ fontWeight:700 }}>{t.label}</div>
                      <div style={{ fontSize:11, marginTop:2, color: typeDrone === t.id ? "#93c5fd" : "#64748b" }}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paramètres mécaniques */}
              <div style={{ background:"#13151f", border:"1px solid #1e2235", borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:16 }}>
                  Paramètres mécaniques
                </div>

                {/* Masse totale */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, color:"#94a3b8" }}>Masse totale</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{masse} g</span>
                  </div>
                  <input type="range" min={200} max={2000} step={50} value={masse}
                    onChange={e => setMasse(Number(e.target.value))}
                    style={{ width:"100%", accentColor:"#3b82f6" }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569", marginTop:4 }}>
                    <span>200 g</span><span>2 000 g</span>
                  </div>
                </div>

                {/* Charge utile */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, color:"#94a3b8" }}>Charge utile</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{chargeUtile} g</span>
                  </div>
                  <input type="range" min={0} max={1000} step={25} value={chargeUtile}
                    onChange={e => setChargeUtile(Number(e.target.value))}
                    style={{ width:"100%", accentColor:"#3b82f6" }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569", marginTop:4 }}>
                    <span>0 g</span><span>1 000 g</span>
                  </div>
                </div>

                {/* Autonomie */}
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, color:"#94a3b8" }}>Autonomie cible</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{autonomie} min</span>
                  </div>
                  <input type="range" min={5} max={60} step={5} value={autonomie}
                    onChange={e => setAutonomie(Number(e.target.value))}
                    style={{ width:"100%", accentColor:"#3b82f6" }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569", marginTop:4 }}>
                    <span>5 min</span><span>60 min</span>
                  </div>
                </div>
              </div>

              {/* Matériau */}
              <div style={{ background:"#13151f", border:"1px solid #1e2235", borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>
                  Matériau de la pièce
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {MATERIAUX.map(m => (
                    <div key={m.id} onClick={() => setMateriau(m.id)}
                      style={{
                        padding:"12px 14px", borderRadius:10, cursor:"pointer",
                        border:`2px solid ${materiau === m.id ? "#3b82f6" : "#1e2235"}`,
                        background: materiau === m.id ? "#0f2a4a" : "#1a1f2e",
                        transition:"all 0.15s",
                      }}
                    >
                      <div style={{ fontSize:13, fontWeight:600, color: materiau === m.id ? "#60a5fa" : "#e2e8f0" }}>{m.label}</div>
                      <div style={{ fontSize:11, color:"#64748b", marginTop:3 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne droite — aperçu */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Aperçu drone */}
              <div style={{ background:"#13151f", border:"1px solid #1e2235", borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>
                  Aperçu du drone
                </div>
                <div style={{ background:"#0a0c14", borderRadius:10, height:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <DroneSVG type={typeDrone} />
                </div>
                <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    { label:"Type",      value: TYPES.find(t => t.id === typeDrone)?.label + " (" + TYPES.find(t => t.id === typeDrone)?.sub + ")" },
                    { label:"Masse",     value: masse + " g" },
                    { label:"Charge",    value: chargeUtile + " g" },
                    { label:"Autonomie", value: autonomie + " min" },
                    { label:"Matériau",  value: MATERIAUX.find(m => m.id === materiau)?.label },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"6px 0", borderBottom:"1px solid #1a1f2e" }}>
                      <span style={{ color:"#64748b" }}>{label}</span>
                      <span style={{ color:"#e2e8f0", fontWeight:500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimation résultats */}
              <div style={{ background:"#13151f", border:"1px solid #1e2235", borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>
                  Estimation IA
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ background:"#0a1628", borderRadius:10, padding:14, textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:"#22c55e" }}>~{Math.round(18 + (masse - 800) / 100)}%</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>Réd. masse est.</div>
                  </div>
                  <div style={{ background:"#0a1628", borderRadius:10, padding:14, textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:"#22c55e" }}>+{Math.round(autonomie * 0.18)} min</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>Gain autonomie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:28, maxWidth:1100, margin:"28px auto 0" }}>
            <button onClick={() => router.push("/dashboard/configuration")}
              style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"11px 24px", borderRadius:10, border:"1px solid #1e2235",
                background:"transparent", color:"#94a3b8", fontSize:14, fontWeight:600, cursor:"pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor="#334155")}
              onMouseLeave={e => (e.currentTarget.style.borderColor="#1e2235")}
            >
              <ChevronLeft size={16}/> Retour
            </button>
            <button onClick={handleNext}
              style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"11px 28px", borderRadius:10, border:"none",
                background:"linear-gradient(135deg, #1d4ed8, #3b82f6)",
                color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer",
                boxShadow:"0 0 20px rgba(59,130,246,0.3)",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity="0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity="1")}
            >
              Suivant <ChevronRight size={16}/>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
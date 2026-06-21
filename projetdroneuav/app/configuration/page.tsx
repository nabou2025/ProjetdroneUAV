'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const DroneViewer = dynamic(() => import('../components/DroneViewer'), { ssr: false });

type DroneType = 'tricopter' | 'quadcopter' | 'hexacopter' | 'octocopter';
type Materiau  = 'aluminium' | 'carbon_fiber' | 'titanium' | 'pla' | 'nylon';
type Methode   = 'simp_ia' | 'simp' | 'ia';

const DRONES = [
  { type: 'tricopter'  as DroneType, label: 'Tri',  bras: 3 },
  { type: 'quadcopter' as DroneType, label: 'Quad', bras: 4 },
  { type: 'hexacopter' as DroneType, label: 'Hexa', bras: 6 },
  { type: 'octocopter' as DroneType, label: 'Octo', bras: 8 },
];

const MATERIAUX = {
  aluminium:    { label: 'Aluminium 6061',   e: '70 GPa',  d: '2 700 kg/m³' },
  carbon_fiber: { label: 'Fibre de carbone', e: '70 GPa',  d: '1 600 kg/m³' },
  titanium:     { label: 'Titane Ti-6Al-4V', e: '116 GPa', d: '4 500 kg/m³' },
  pla:          { label: 'PLA',              e: '3.5 GPa', d: '1 240 kg/m³' },
  nylon:        { label: 'Nylon PA12',       e: '2.8 GPa', d: '1 150 kg/m³' },
};

const METHODES = [
  { id: 'simp_ia' as Methode, label: 'SIMP + IA', sub: 'FEA réel + U-Net',  tag: 'Recommandé' },
  { id: 'simp'    as Methode, label: 'SIMP seul', sub: 'Physique classique', tag: 'Précis'     },
  { id: 'ia'      as Methode, label: 'IA seule',  sub: 'U-Net instantané',   tag: 'Rapide'     },
];

const STEPS = ['Connexion', 'Configuration', 'Optimisation', 'Résultats', 'Export'];

export default function ConfigurationPage() {
  const router = useRouter();
  const [drone,     setDrone]     = useState<DroneType>('quadcopter');
  const [mat,       setMat]       = useState<Materiau>('aluminium');
  const [methode,   setMethode]   = useState<Methode>('simp_ia');
  const [masse,     setMasse]     = useState(1000);
  const [payload,   setPayload]   = useState(200);
  const [volfrac,   setVolfrac]   = useState(0.4);
  const [capaMah,   setCapaMah]   = useState(5000);
  const [tension,   setTension]   = useState(22.2);
  const [autonomie, setAutonomie] = useState(30);
  const [nelx,      setNelx]      = useState(60);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const nbBras        = DRONES.find(d => d.type === drone)?.bras ?? 4;
  const estimReduc    = Math.round(60 * (1 - volfrac) * 0.95);
  const estimGain     = +(autonomie * (estimReduc / 100) * 0.55).toFixed(1);

  const lancerOptimisation = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/optimiser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masse, payload, autonomie_cible: autonomie,
          nb_bras: nbBras, materiau: mat, volfrac,
          capacite_mah: capaMah, tension_v: tension,
          nelx, nely: Math.round(nelx / 2),
        }),
      });
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);
      const data = await res.json();
      localStorage.setItem('uavd_resultats', JSON.stringify(data));
      router.push('/resultats');
    } catch (e: any) {
      setError(e.message ?? 'Backend inaccessible — vérifie que FastAPI tourne sur le port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDrone('quadcopter'); setMat('aluminium'); setMethode('simp_ia');
    setMasse(1000); setPayload(200); setVolfrac(0.4);
    setCapaMah(5000); setTension(22.2); setAutonomie(30); setNelx(60);
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-white font-sans relative overflow-hidden">

      {/* Drone arrière-plan */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none z-0 scale-150">
        <DroneViewer nbBras={nbBras} optimized={false} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 h-[60px] bg-[#0d1117]/90 border-b border-[#1e2d47] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1DDB7A]/10 border border-[#1DDB7A]/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" stroke="#1DDB7A" strokeWidth="1.2" fill="none"/>
              <circle cx="8" cy="8" r="2" fill="#1DDB7A"/>
            </svg>
          </div>
          <span className="font-bold text-base">UAV-D+</span>
        </div>
        <div className="flex gap-7 text-sm">
          {['Accueil','Dashboard','Configuration','Résultats','Rapport','Export'].map(l => (
            <a key={l} href={l === 'Accueil' ? '/' : `/${l.toLowerCase()}`}
              className={`transition-colors ${l === 'Configuration' ? 'text-[#1DDB7A]' : 'text-slate-400 hover:text-white'}`}>
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#1DDB7A]/10 border border-[#1DDB7A]/20 text-[#1DDB7A] px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DDB7A] inline-block animate-pulse"></span>
          Système actif
        </div>
      </nav>

      <div className="relative z-10 px-8 py-7">

        {/* En-tête */}
        <div className="mb-5">
          <p className="text-xs text-slate-500 mb-1">Accueil / <span className="text-[#1DDB7A]">Configuration</span></p>
          <h1 className="text-2xl font-bold">Configuration du drone</h1>
          <p className="text-sm text-slate-400 mt-1">Paramètres mécaniques et énergétiques avant optimisation</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                  ${i === 0 ? 'bg-[#1DDB7A] border-[#1DDB7A] text-black' :
                    i === 1 ? 'border-[#1DDB7A] text-[#1DDB7A]' :
                    'border-[#1e2d47] text-slate-600'}`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-1 ${i === 1 ? 'text-[#1DDB7A]' : 'text-slate-600'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 mb-4 ${i === 0 ? 'bg-[#1DDB7A]/40' : 'bg-[#1e2d47]'}`}/>}
            </div>
          ))}
        </div>
        <div className="h-0.5 bg-[#1e2d47] rounded mb-6 relative">
          <div className="absolute h-0.5 bg-[#1DDB7A] rounded" style={{width:'25%'}}/>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-2 gap-5">

          {/* Colonne gauche */}
          <div className="flex flex-col gap-5">

            {/* Paramètres drone */}
            <div className="bg-[#0d1117]/80 border border-[#1e2d47] rounded-xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-[#1DDB7A] uppercase tracking-widest mb-4">✦ Paramètres du drone</p>

              <label className="text-xs text-slate-400 mb-2 block">Type de drone</label>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {DRONES.map(d => (
                  <button key={d.type} onClick={() => setDrone(d.type)}
                    className={`py-2.5 rounded-lg text-sm font-semibold border transition-all
                      ${drone === d.type ? 'bg-[#1DDB7A]/10 border-[#1DDB7A] text-[#1DDB7A]' : 'bg-[#131a26] border-[#1e2d47] text-slate-500 hover:border-slate-500'}`}>
                    {d.label}
                    <span className="block text-[10px] font-normal mt-0.5 opacity-70">{d.bras} bras</span>
                  </button>
                ))}
              </div>

              {[
                { label: 'Masse totale', val: masse, set: setMasse, min: 200, max: 3000, step: 50, unit: 'g' },
                { label: 'Charge utile', val: payload, set: setPayload, min: 0, max: 1500, step: 50, unit: 'g' },
              ].map(f => (
                <div key={f.label} className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{f.label}</span>
                    <span className="text-white font-medium">{f.val.toLocaleString()} {f.unit}</span>
                  </div>
                  <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                    onChange={e => f.set(+e.target.value)} className="w-full accent-[#1DDB7A]"/>
                </div>
              ))}

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Fraction volumique (volfrac)</span>
                  <span className="text-white font-medium">{volfrac.toFixed(2)}</span>
                </div>
                <input type="range" min={0.1} max={0.9} step={0.05} value={volfrac}
                  onChange={e => setVolfrac(+e.target.value)} className="w-full accent-[#1DDB7A]"/>
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Léger (10%)</span><span>Dense (90%)</span>
                </div>
              </div>
            </div>

            {/* Batterie */}
            <div className="bg-[#0d1117]/80 border border-[#1e2d47] rounded-xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-[#1DDB7A] uppercase tracking-widest mb-4">⚡ Batterie & autonomie</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Capacité', val: capaMah, set: setCapaMah, min: 1000, max: 20000, step: 500, unit: 'mAh' },
                  { label: 'Tension',  val: tension,  set: setTension,  min: 7.4,  max: 44.4,  step: 3.7,  unit: 'V'   },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-slate-400 block mb-1.5">{f.label}</label>
                    <div className="bg-[#131a26] border border-[#1e2d47] rounded-lg px-3 py-2 flex justify-between mb-2">
                      <span className="text-sm text-white">{typeof f.val === 'number' && f.val % 1 !== 0 ? f.val.toFixed(1) : f.val.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">{f.unit}</span>
                    </div>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                      onChange={e => f.set(+e.target.value)} className="w-full accent-[#1DDB7A]"/>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Autonomie cible</span>
                  <span className="text-white font-medium">{autonomie} min</span>
                </div>
                <input type="range" min={5} max={90} step={5} value={autonomie}
                  onChange={e => setAutonomie(+e.target.value)} className="w-full accent-[#1DDB7A]"/>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="flex flex-col gap-5">

            {/* Matériaux */}
            <div className="bg-[#0d1117]/80 border border-[#1e2d47] rounded-xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-[#1DDB7A] uppercase tracking-widest mb-4">⬡ Matériau de la pièce</p>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.entries(MATERIAUX) as [Materiau, typeof MATERIAUX[Materiau]][]).map(([key, val]) => (
                  <button key={key} onClick={() => setMat(key)}
                    className={`p-3 rounded-lg border text-left transition-all
                      ${mat === key ? 'bg-purple-900/20 border-purple-500' : 'bg-[#131a26] border-[#1e2d47] hover:border-slate-500'}`}>
                    <div className={`text-xs font-semibold mb-1 ${mat === key ? 'text-purple-300' : 'text-slate-300'}`}>{val.label}</div>
                    <div className={`text-[10px] ${mat === key ? 'text-purple-500' : 'text-slate-600'}`}>E = {val.e} · {val.d}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Méthode */}
            <div className="bg-[#0d1117]/80 border border-[#1e2d47] rounded-xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-[#1DDB7A] uppercase tracking-widest mb-4">◈ Méthode d'optimisation</p>
              <div className="flex gap-2.5 mb-5">
                {METHODES.map(m => (
                  <button key={m.id} onClick={() => setMethode(m.id)}
                    className={`flex-1 p-3 rounded-lg border text-left transition-all
                      ${methode === m.id ? 'bg-[#1DDB7A]/10 border-[#1DDB7A]/60' : 'bg-[#131a26] border-[#1e2d47] hover:border-slate-500'}`}>
                    <div className={`text-xs font-semibold mb-1 ${methode === m.id ? 'text-[#1DDB7A]' : 'text-slate-400'}`}>{m.label}</div>
                    <div className="text-[10px] text-slate-600">{m.sub}</div>
                    <div className={`text-[10px] mt-1.5 ${methode === m.id ? 'text-[#1DDB7A]/60' : 'text-slate-700'}`}>{m.tag}</div>
                  </button>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Résolution grille</span>
                  <span className="text-white font-medium font-mono">{nelx} × {Math.round(nelx/2)}</span>
                </div>
                <input type="range" min={20} max={100} step={10} value={nelx}
                  onChange={e => setNelx(+e.target.value)} className="w-full accent-[#1DDB7A]"/>
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Rapide (20×10)</span><span>Précis (100×50)</span>
                </div>
              </div>
            </div>

            {/* Aperçu live */}
            <div className="bg-[#0d1117]/80 border border-[#1e2d47] rounded-xl p-5 backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-[#1DDB7A] uppercase tracking-widest mb-3">◉ Aperçu en temps réel</p>
              <div className="bg-[#131a26] rounded-lg h-28 flex items-center justify-center mb-4">
                <svg width="200" height="100" viewBox="0 0 200 100">
                  <circle cx="100" cy="50" r="14" fill="none" stroke="#1DDB7A" strokeWidth="1.5"/>
                  <circle cx="100" cy="50" r="5" fill="#1DDB7A" opacity="0.6"/>
                  {Array.from({length: nbBras}).map((_, i) => {
                    const a = (i / nbBras) * Math.PI * 2 - Math.PI / 2;
                    const ex = 100 + Math.cos(a) * 62;
                    const ey = 50  + Math.sin(a) * 36;
                    return (
                      <g key={i}>
                        <line x1="100" y1="50" x2={ex} y2={ey} stroke="#1e2d47" strokeWidth="2.5"/>
                        <circle cx={ex} cy={ey} r="8" fill="#131a26" stroke="#1DDB7A" strokeWidth="1"/>
                        <ellipse cx={ex} cy={ey} rx="15" ry="3" fill="none" stroke="#1DDB7A" strokeWidth="0.8" opacity="0.4"/>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#131a26] rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-[#1DDB7A]">~{estimReduc}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Réduction masse</div>
                </div>
                <div className="bg-[#131a26] rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-purple-400">+{estimGain}min</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Gain autonomie</div>
                </div>
                <div className="bg-[#131a26] rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-sky-400">{nbBras}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Rotors</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mt-5 bg-red-900/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            ⚠ {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 mt-5">
          <button onClick={lancerOptimisation} disabled={loading}
            className="flex-1 bg-[#1DDB7A] hover:bg-[#1ac96d] disabled:opacity-50 text-black font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="3" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="black" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Optimisation en cours...
              </>
            ) : '⚡ Lancer l\'optimisation UAV-D+'}
          </button>
          <button onClick={reset}
            className="px-6 bg-[#131a26] hover:bg-[#1e2d47] border border-[#1e2d47] text-slate-400 font-medium py-4 rounded-xl text-sm transition-all">
            Réinitialiser
          </button>
        </div>

      </div>
    </main>
  );
}
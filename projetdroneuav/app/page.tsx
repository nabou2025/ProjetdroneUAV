'use client'
import Link from 'next/link'
import DroneSVG from './components/DroneSVG'
import Particles from './components/Particles'

const NAV_LINKS = ['Accueil', 'Dashboard', 'Configuration', 'Résultats', 'Comparateur', 'Export']

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Halos de fond ── */}
      <div style={{
        position: 'absolute',
        top: '10%', left: '15%',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '5%', right: '10%',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Carte principale ── */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        background: 'radial-gradient(circle at 50% 40%, #0E1525 0%, #080B14 100%)',
        borderRadius: '28px',
        border: '1px solid var(--border)',
        padding: '28px 40px 40px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '680px',
        zIndex: 2,
      }}>

        <Particles />
        <div className="scan-line" />

        {/* ── NAVBAR ── */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: '50px',
          padding: '10px 12px 10px 22px',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '15px', letterSpacing: '0.05em', color: 'var(--ink)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <polygon points="13,1 25,7 25,19 13,25 1,19 1,7" fill="none" stroke="#3B82F6" strokeWidth="1.8"/>
              <circle cx="13" cy="13" r="3.5" fill="#3B82F6"/>
            </svg>
            UAV-D+
          </div>

          {/* Liens */}
          <div style={{ display: 'flex', gap: '26px', fontSize: '13px', color: 'var(--sub)' }}>
            {NAV_LINKS.map((link, i) => (
              <span
                key={link}
                className="nav-link"
                style={{ color: i === 0 ? 'var(--ink)' : undefined, fontWeight: i === 0 ? 600 : 400 }}
              >
                {link}
              </span>
            ))}
          </div>

          {/* Boutons auth */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              background: 'transparent',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '40px',
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Sign out
            </button>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--danger)',
                color: '#fff',
                border: 'none',
                borderRadius: '40px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Sign in
              </button>
            </Link>
          </div>
        </nav>

        {/* ── HERO TEXTE ── */}
        <div style={{ textAlign: 'center', marginTop: '58px', position: 'relative', zIndex: 10 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '40px',
            padding: '5px 16px',
            fontSize: '11.5px',
            color: 'var(--accent-bright)',
            marginBottom: '24px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }}/>
            Intelligence artificielle · UAV · Optimisation
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            <span style={{ color: 'var(--ink)' }}>OPTIMISATION DE </span>
            <span style={{ color: '#2A3A55' }}>DRONES</span>
            <br />
            <span style={{ color: '#2A3A55' }}>PILOTÉE PAR </span>
            <span style={{ color: 'var(--accent)' }}>L'IA.</span>
          </h1>

          <p style={{
            color: 'var(--sub)',
            fontSize: '14.5px',
            maxWidth: '500px',
            margin: '22px auto 0',
            lineHeight: 1.7,
          }}>
            De la contrainte mécanique à la structure optimisée — générez,
            comparez et exportez des topologies de drones UAV en quelques secondes.
          </p>

          <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-primary">
              Commencer →
            </button>
            <button style={{
              background: 'transparent',
              color: 'var(--sub)',
              border: '1px solid var(--border)',
              borderRadius: '40px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              Voir la démo
            </button>
          </div>
        </div>

        {/* ── DRONE vidéo en background ── */}
{/* ── DRONE vidéo en background ── */}
<video
  src="/drone.webm"
  autoPlay
  loop
  muted
  playsInline
  style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: 'auto',
    zIndex: 1,
    mixBlendMode: 'multiply',
    filter: 'brightness(0.9) contrast(1.15)',
    pointerEvents: 'none',
  }}
/>

        {/* ── CARDS STATS flottantes ── */}
        {/* Droite */}
        <div className="glass-card" style={{
          position: 'absolute',
          right: '44px',
          top: '300px',
          width: '195px',
          zIndex: 10,
        }}>
          <div style={{ fontSize: '9.5px', color: 'var(--accent-bright)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
            Réduction de masse
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>−42.6%</div>
          <div style={{ marginTop: '6px', height: '3px', borderRadius: '2px', background: 'var(--border)' }}>
            <div style={{ width: '57%', height: '100%', borderRadius: '2px', background: 'var(--accent)' }} />
          </div>
        </div>

        {/* Gauche */}
        <div className="glass-card" style={{
          position: 'absolute',
          left: '44px',
          bottom: '44px',
          width: '195px',
          zIndex: 10,
        }}>
          <div style={{ fontSize: '9.5px', color: 'var(--accent-bright)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
            Score IA
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>91.4 <span style={{ fontSize: '13px', color: 'var(--sub)', fontWeight: 400 }}>/ 100</span></div>
          <div style={{ marginTop: '6px', height: '3px', borderRadius: '2px', background: 'var(--border)' }}>
            <div style={{ width: '91%', height: '100%', borderRadius: '2px', background: 'var(--accent)' }} />
          </div>
        </div>

        {/* Centre-bas : condition de vol */}
        <div className="glass-card" style={{
          position: 'absolute',
          right: '44px',
          bottom: '44px',
          width: '195px',
          zIndex: 10,
        }}>
          <div style={{ fontSize: '9.5px', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
            Condition de vol
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Optimal</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--sub)', marginTop: '4px' }}>Vent: 12 km/h · Alt: 120m</div>
        </div>

      </div>
    </main>
  )
}
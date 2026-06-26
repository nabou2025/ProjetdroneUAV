'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import WaveBackground from '../components/WaveBackground'

const ROLES = [
  { id: 'etudiant', label: 'Étudiant', icon: '🎓' },
  { id: 'chercheur', label: 'Chercheur', icon: '🔬' },
  { id: 'expert', label: 'Expert', icon: '⚙️' },
]

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('etudiant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const body = mode === 'login'
      ? { action: 'login', email, password }
      : { action: 'register', email, password, name, role }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Une erreur est survenue')
      } else {
        // ✅ Sauvegarde l'utilisateur dans localStorage
        localStorage.setItem('uav_user', JSON.stringify(data.user))
        // ✅ Redirige vers le dashboard
        router.push('/dashboard')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070B12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '960px',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        minHeight: '580px',
        border: '1px solid #1F2E40',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
      }}>

        {/* ── PANNEAU GAUCHE ── */}
        <div style={{
          flex: '1.1',
          position: 'relative',
          background: '#0A1428',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px',
        }}>
          <WaveBackground />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
                <polygon points="13,1 25,7 25,19 13,25 1,19 1,7"
                  fill="none" stroke="#3B82F6" strokeWidth="1.8"/>
                <circle cx="13" cy="13" r="3.5" fill="#3B82F6"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: '16px', color: '#F5F5F5', letterSpacing: '0.04em' }}>
                UAV-D+
              </span>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#F5F5F5', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.01em' }}>
              Bienvenue<br />sur UAV-D+
            </div>
            <p style={{ fontSize: '13px', color: '#7E8DA0', lineHeight: 1.6, maxWidth: '280px' }}>
              Plateforme d'optimisation topologique de drones assistée par intelligence artificielle.
            </p>
          </div>
        </div>

        {/* ── PANNEAU DROIT ── */}
        <div style={{
          flex: '1',
          background: '#0E1622',
          padding: '44px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#E8EDF4', marginBottom: '6px', letterSpacing: '-0.01em' }}>
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p style={{ fontSize: '13px', color: '#7E8DA0' }}>
              {mode === 'login' ? 'Accédez à votre espace de conception' : 'Rejoignez la plateforme en quelques secondes'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input type="text" placeholder="Ndèye Félicité Diop" value={name}
                  onChange={e => setName(e.target.value)} required style={inputStyle} />
              </div>
            )}

            <div>
              <label style={labelStyle}>Adresse e-mail</label>
              <input type="email" placeholder="nom@institution.edu" value={email}
                onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Mot de passe</label>
              <input type="password" placeholder="••••••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            </div>

            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Vous êtes</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ROLES.map(r => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
                      flex: 1, padding: '10px 6px', borderRadius: '8px',
                      border: role === r.id ? '1.5px solid #39E6D4' : '1px solid #1F2E40',
                      background: role === r.id ? 'rgba(57,230,212,0.08)' : 'transparent',
                      color: role === r.id ? '#39E6D4' : '#7E8DA0',
                      fontSize: '11.5px', fontWeight: role === r.id ? 700 : 500,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '4px', transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: '18px' }}>{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(229,72,61,0.1)', border: '1px solid rgba(229,72,61,0.3)',
                borderRadius: '8px', padding: '10px 12px', fontSize: '12.5px', color: '#E5483D',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: '6px', background: '#3B82F6', color: '#fff', border: 'none',
              borderRadius: '9px', padding: '13px', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 24px rgba(59,130,246,0.25)', transition: 'opacity 0.15s',
            }}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: '#1F2E40' }} />
              <span style={{ fontSize: '11px', color: '#586575' }}>
                {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#1F2E40' }} />
            </div>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              style={{
                background: 'transparent', color: '#3B82F6', border: '1px solid #1F2E40',
                borderRadius: '9px', padding: '11px', width: '100%',
                fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {mode === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
            <Link href="/" style={{ display: 'block', marginTop: '16px', fontSize: '12px', color: '#586575', textDecoration: 'none' }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#586575',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  background: '#070B12',
  border: '1px solid #1F2E40',
  borderRadius: '8px',
  padding: '11px 14px',
  fontSize: '13px',
  color: '#E8EDF4',
  outline: 'none',
}
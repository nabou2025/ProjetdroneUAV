import { NextResponse } from 'next/server'

// Base temporaire en mémoire (à remplacer par PostgreSQL plus tard)
const users = [
  { email: 'admin@esp.sn', password: 'test1234', name: 'Félicité Diop', role: 'etudiant' }
]

export async function POST(request) {
  const body = await request.json()
  const { action, email, password, name, role } = body

  // ── LOGIN ──
  if (action === 'login') {
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }
    return NextResponse.json({
      message: 'Connexion réussie',
      user: { email: user.email, name: user.name, role: user.role },
    })
  }

  // ── REGISTER ──
  if (action === 'register') {
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { message: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { message: 'Un compte existe déjà avec cet email' },
        { status: 409 }
      )
    }
    users.push({ email, password, name, role })
    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: { email, name, role },
    })
  }

  return NextResponse.json({ message: 'Action non reconnue' }, { status: 400 })
}
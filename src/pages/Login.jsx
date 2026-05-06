import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoError, setLogoError] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos'); return }
    setLoading(true); setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Credenciales incorrectas. Verificá tu email y contraseña.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #F8F9FC 0%, #EEE9FF 100%)' }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E1147 0%, #2D1B69 100%)' }}>

        {/* Watermark dancer */}
        <div className="absolute bottom-0 right-0 w-72 h-96 opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 200" fill="white" className="w-full h-full">
            <ellipse cx="50" cy="20" rx="10" ry="10" />
            <line x1="50" y1="30" x2="50" y2="100" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            <line x1="50" y1="55" x2="20" y2="40" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <line x1="50" y1="55" x2="85" y2="35" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <line x1="50" y1="100" x2="30" y2="160" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <line x1="50" y1="100" x2="75" y2="155" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <line x1="30" y1="160" x2="20" y2="195" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            <line x1="75" y1="155" x2="90" y2="185" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              {!logoError
                ? <img src="/logo.png" alt="CREAR" className="w-7 h-7 object-contain brightness-0 invert" onError={() => setLogoError(true)} />
                : <span className="text-white font-black text-lg font-display">C</span>
              }
            </div>
            <div>
              <h1 className="text-white font-bold text-xl font-display tracking-wide">CREAR</h1>
              <p className="text-white/40 text-xs tracking-widest uppercase">Academia de Danzas</p>
            </div>
          </div>
        </div>

        <div>
          <blockquote className="text-white/70 text-2xl font-display italic leading-relaxed">
            "La danza es el lenguaje<br />oculto del alma."
          </blockquote>
          <p className="text-white/30 text-sm mt-4">— Martha Graham</p>
        </div>

        <p className="text-white/20 text-xs">v0.1.0 · Tesis 2025</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border border-white/20"
              style={{ background: 'linear-gradient(135deg, #1E1147, #2D1B69)' }}>
              {!logoError
                ? <img src="/logo.png" alt="CREAR" className="w-9 h-9 object-contain brightness-0 invert" onError={() => setLogoError(true)} />
                : <span className="text-white font-black text-xl font-display">C</span>
              }
            </div>
            <h1 className="text-xl font-bold text-gray-800 font-display">CREAR</h1>
            <p className="text-gray-400 text-xs">Academia de Danzas</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Iniciar sesión</h2>
            <p className="text-gray-400 text-sm mb-6">Ingresá tus credenciales para continuar</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@academia.com" autoComplete="email"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm hover:shadow-card-md"
                style={{ background: loading ? '#9C8AF0' : 'linear-gradient(135deg, #6D5AE6, #8B7AEE)' }}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-300 mt-6">v0.1.0 · Tesis 2025</p>
        </div>
      </div>
    </div>
  )
}

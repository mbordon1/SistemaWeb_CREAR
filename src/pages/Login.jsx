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
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Credenciales incorrectas. Verificá tu email y contraseña.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0825] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-900/50">
            {!logoError ? (
              <img src="/logo.png" alt="CREAR" className="w-10 h-10 object-contain brightness-0 invert" onError={() => setLogoError(true)} />
            ) : (
              <span className="text-white font-black text-2xl">C</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">CREAR</h1>
          <p className="text-purple-400 text-sm mt-1">Academia de Danzas</p>
        </div>

        <div className="bg-[#130f35] border border-purple-800/40 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <h2 className="text-lg font-semibold text-white mb-1">Iniciar sesión</h2>
          <p className="text-purple-400/70 text-sm mb-6">Ingresá tus credenciales para acceder</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-purple-300/80 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@academia.com"
                autoComplete="email"
                className="w-full rounded-lg bg-white/5 border border-purple-800/40 text-white placeholder-purple-400/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-purple-300/80 uppercase tracking-wide">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg bg-white/5 border border-purple-800/40 text-white placeholder-purple-400/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium py-2.5 rounded-lg hover:from-violet-500 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-purple-500/50 mt-6">v0.1.0 · Tesis 2025</p>
      </div>
    </div>
  )
}

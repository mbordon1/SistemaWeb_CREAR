import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UsersRound, GraduationCap,
  ClipboardList, CalendarCheck, CreditCard, Star, UserCog, Banknote,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const sections = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/alumnos',       icon: Users,         label: 'Alumnos' },
      { to: '/padres',        icon: UserCog,        label: 'Padres / Tutores' },
      { to: '/grupos',        icon: UsersRound,     label: 'Grupos' },
      { to: '/profesores',    icon: GraduationCap,  label: 'Profesores' },
      { to: '/inscripciones', icon: ClipboardList,  label: 'Inscripciones' },
      { to: '/asistencia',    icon: CalendarCheck,  label: 'Asistencia' },
      { to: '/pagos',         icon: CreditCard,     label: 'Pagos' },
      { to: '/sueldos',       icon: Banknote,       label: 'Sueldos' },
      { to: '/evaluaciones',  icon: Star,           label: 'Evaluaciones' },
    ],
  },
]

export default function Sidebar() {
  const [logoError, setLogoError] = useState(false)
  const [cuotasVencidas, setCuotasVencidas] = useState(0)

  useEffect(() => {
    async function fetchVencidas() {
      const hoy = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('cuotas')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['pendiente', 'vencida'])
        .lt('fecha_vencimiento', hoy)
      setCuotasVencidas(count ?? 0)
    }
    fetchVencidas()
  }, [])

  return (
    <aside className="w-60 shrink-0 flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #2E1065 0%, #3B0764 100%)' }}>


      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20">
            {!logoError ? (
              <img src="/logo.png" alt="CREAR" className="w-6 h-6 object-contain brightness-0 invert"
                onError={() => setLogoError(true)} />
            ) : (
              <span className="text-white font-black text-sm font-display">C</span>
            )}
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight tracking-wide font-display">CREAR</h1>
            <p className="text-white/50 text-[10px] tracking-wider uppercase">Academia de Danzas</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/10 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
        {sections.map(({ label, items }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold text-white/30 tracking-widest uppercase px-3 mb-2">{label}</p>
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label: itemLabel }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
                        : 'text-white/55 hover:bg-white/10 hover:text-white/90'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-white/50'} />
                      <span>{itemLabel}</span>
                      {to === '/pagos' && cuotasVencidas > 0 && (
                        <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                          {cuotasVencidas > 99 ? '99+' : cuotasVencidas}
                        </span>
                      )}
                      {isActive && to !== '/pagos' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                      {isActive && to === '/pagos' && cuotasVencidas === 0 && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer quote */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/25 text-[10px] italic font-display leading-relaxed text-center">
          "La danza es el lenguaje<br />oculto del alma."
        </p>
        <p className="text-white/15 text-[9px] text-center mt-2">v0.1.0 · Tesis 2025</p>
      </div>
    </aside>
  )
}

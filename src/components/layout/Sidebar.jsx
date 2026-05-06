import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UsersRound, GraduationCap,
  ClipboardList, CalendarCheck, CreditCard, Star, UserCog, Banknote,
} from 'lucide-react'

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

  return (
    <aside className="w-60 shrink-0 flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1147 0%, #2D1B69 100%)' }}>

      {/* Dancer silhouette watermark */}
      <div className="absolute bottom-0 right-0 w-40 h-64 opacity-5 pointer-events-none select-none flex items-end justify-end pr-2 pb-8">
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
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
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

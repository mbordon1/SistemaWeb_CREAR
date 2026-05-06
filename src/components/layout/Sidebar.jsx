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

      {/* Arabesque silhouette watermark */}
      <div className="absolute bottom-0 right-0 w-44 h-72 opacity-5 pointer-events-none select-none">
        <svg viewBox="0 0 100 180" fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          {/* Head */}
          <ellipse cx="38" cy="18" rx="8" ry="9" fill="white" stroke="none" />
          {/* Neck */}
          <line x1="38" y1="27" x2="40" y2="34" strokeWidth="4" />
          {/* Torso (leaning forward) */}
          <line x1="40" y1="34" x2="48" y2="72" strokeWidth="6" />
          {/* Front arm extended forward-down */}
          <line x1="43" y1="48" x2="8" y2="60" strokeWidth="4" />
          {/* Back arm extended back */}
          <line x1="43" y1="48" x2="72" y2="44" strokeWidth="4" />
          {/* Supporting leg straight down */}
          <line x1="48" y1="72" x2="44" y2="140" strokeWidth="5" />
          {/* Foot on pointe */}
          <line x1="44" y1="140" x2="50" y2="148" strokeWidth="3" />
          {/* Arabesque leg extended back and high */}
          <line x1="48" y1="72" x2="95" y2="30" strokeWidth="5" />
          {/* Pointed arabesque foot */}
          <line x1="95" y1="30" x2="100" y2="22" strokeWidth="3" />
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

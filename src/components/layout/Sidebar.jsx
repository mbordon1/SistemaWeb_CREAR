import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UsersRound, GraduationCap,
  ClipboardList, CalendarCheck, CreditCard, Star, UserCog, Banknote,
} from 'lucide-react'

const sections = [
  {
    label: 'PRINCIPAL',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { to: '/alumnos',      icon: Users,          label: 'Alumnos' },
      { to: '/padres',       icon: UserCog,        label: 'Padres / Tutores' },
      { to: '/grupos',       icon: UsersRound,     label: 'Grupos' },
      { to: '/profesores',   icon: GraduationCap,  label: 'Profesores' },
      { to: '/inscripciones',icon: ClipboardList,  label: 'Inscripciones' },
      { to: '/asistencia',   icon: CalendarCheck,  label: 'Asistencia' },
      { to: '/pagos',        icon: CreditCard,     label: 'Pagos' },
      { to: '/sueldos',      icon: Banknote,       label: 'Sueldos' },
      { to: '/evaluaciones', icon: Star,           label: 'Evaluaciones' },
    ],
  },
]

export default function Sidebar() {
  const [logoError, setLogoError] = useState(false)

  return (
    <aside className="w-64 bg-[#130f35] border-r border-purple-900/40 flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-purple-900/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="CREAR"
              className="w-7 h-7 object-contain brightness-0 invert"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-white font-black text-sm">C</span>
          )}
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">CREAR</h1>
          <p className="text-xs text-purple-400">Academia de Danzas</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map(({ label, items }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold text-purple-500/60 tracking-widest px-2 mb-2">{label}</p>
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label: itemLabel }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/25'
                        : 'text-purple-300/70 hover:bg-white/5 hover:text-purple-100'
                    }`
                  }
                >
                  <Icon size={16} />
                  {itemLabel}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-purple-900/40">
        <p className="text-[11px] text-purple-500/50 text-center">v0.1.0 · Tesis 2025</p>
      </div>
    </aside>
  )
}

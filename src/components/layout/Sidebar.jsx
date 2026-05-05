import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UsersRound, GraduationCap,
  ClipboardList, CalendarCheck, CreditCard, Star,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alumnos', icon: Users, label: 'Alumnos' },
  { to: '/grupos', icon: UsersRound, label: 'Grupos' },
  { to: '/profesores', icon: GraduationCap, label: 'Profesores' },
  { to: '/inscripciones', icon: ClipboardList, label: 'Inscripciones' },
  { to: '/asistencia', icon: CalendarCheck, label: 'Asistencia' },
  { to: '/pagos', icon: CreditCard, label: 'Pagos' },
  { to: '/evaluaciones', icon: Star, label: 'Evaluaciones' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">CREAR</h1>
        <p className="text-xs text-gray-500 mt-1">Academia de Danzas</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">v0.1.0 · Tesis 2025</p>
      </div>
    </aside>
  )
}

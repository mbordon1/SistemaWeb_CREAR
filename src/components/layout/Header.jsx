import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const titles = {
  '/dashboard':     { title: 'Dashboard',               subtitle: 'Resumen general de la academia' },
  '/alumnos':       { title: 'Alumnos',                  subtitle: 'Gestión de alumnos inscriptos' },
  '/padres':        { title: 'Padres y Tutores',         subtitle: 'Contactos y vínculos familiares' },
  '/grupos':        { title: 'Grupos',                   subtitle: 'Clases y disciplinas' },
  '/profesores':    { title: 'Profesores',               subtitle: 'Plantel docente' },
  '/inscripciones': { title: 'Inscripciones',            subtitle: 'Alta y gestión de inscripciones' },
  '/asistencia':    { title: 'Asistencia',               subtitle: 'Registro de presencia por clase' },
  '/pagos':         { title: 'Pagos y Cuotas',           subtitle: 'Control de cobros y vencimientos' },
  '/sueldos':       { title: 'Sueldos',                  subtitle: 'Liquidación de honorarios docentes' },
  '/evaluaciones':  { title: 'Evaluaciones',             subtitle: 'Seguimiento académico' },
}

export default function Header() {
  const { pathname } = useLocation()
  const page = titles[pathname] ?? { title: 'CREAR', subtitle: '' }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{page.title}</h2>
        {page.subtitle && <p className="text-xs text-gray-400 mt-0.5">{page.subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-52"
          />
        </div>

        {/* Bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #6D5AE6, #9C8AF0)' }}>
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-700 leading-tight">Admin</p>
            <p className="text-[10px] text-gray-400">Administradora</p>
          </div>
        </div>
      </div>
    </header>
  )
}

import { useLocation } from 'react-router-dom'
import { Bell, ChevronRight } from 'lucide-react'

const titles = {
  '/dashboard':     { title: 'Dashboard',          subtitle: 'Resumen general de la academia' },
  '/alumnos':       { title: 'Alumnos',             subtitle: 'Gestión de alumnos inscriptos' },
  '/padres':        { title: 'Padres y Tutores',    subtitle: 'Contactos y vínculos familiares' },
  '/grupos':        { title: 'Grupos',              subtitle: 'Clases y disciplinas' },
  '/profesores':    { title: 'Profesores',          subtitle: 'Plantel docente' },
  '/inscripciones': { title: 'Inscripciones',       subtitle: 'Alta y gestión de inscripciones' },
  '/asistencia':    { title: 'Asistencia',          subtitle: 'Registro de presencia por clase' },
  '/pagos':         { title: 'Pagos y Cuotas',      subtitle: 'Control de cobros y vencimientos' },
  '/sueldos':       { title: 'Sueldos',             subtitle: 'Liquidación de honorarios docentes' },
  '/evaluaciones':  { title: 'Evaluaciones',        subtitle: 'Seguimiento académico' },
}

export default function Header() {
  const { pathname } = useLocation()
  const page = titles[pathname] ?? { title: 'CREAR', subtitle: '' }

  return (
    <header className="bg-white border-b border-[#EDE9FE] px-6 py-0 flex items-center justify-between shrink-0 h-[60px]">

      {/* Left: breadcrumb + title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-gray-400 font-medium hidden sm:block">CREAR</span>
        <ChevronRight size={13} className="text-gray-300 hidden sm:block shrink-0" />
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-[#1E1B4B] leading-tight truncate">{page.title}</h2>
          {page.subtitle && (
            <p className="text-[11px] text-[#A89FC8] mt-0.5 hidden md:block">{page.subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-[#F4F2FF] hover:bg-[#EDE9FE] transition-colors">
          <Bell size={15} className="text-[#7C3AED]" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#EDE9FE]" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-[#1E1B4B] leading-tight">Admin</p>
            <p className="text-[10px] text-[#A89FC8]">Administradora</p>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-card"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            A
          </div>
        </div>
      </div>
    </header>
  )
}

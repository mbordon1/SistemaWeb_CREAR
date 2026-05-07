import { useLocation } from 'react-router-dom'

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

      {/* Avatar */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #6D5AE6, #9C8AF0)' }}>
          A
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-gray-700 leading-tight">Admin</p>
          <p className="text-[10px] text-gray-400">Administradora</p>
        </div>
      </div>
    </header>
  )
}

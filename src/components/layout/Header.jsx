import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

const titles = {
  '/dashboard':    'Dashboard',
  '/alumnos':      'Gestión de Alumnos',
  '/padres':       'Padres y Tutores',
  '/grupos':       'Gestión de Grupos',
  '/profesores':   'Gestión de Profesores',
  '/inscripciones':'Inscripciones',
  '/asistencia':   'Registro de Asistencia',
  '/pagos':        'Pagos y Cuotas',
  '/sueldos':      'Sueldos de Profesores',
  '/evaluaciones': 'Evaluaciones',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'CREAR'

  return (
    <header className="bg-[#130f35]/80 backdrop-blur border-b border-purple-900/40 px-6 py-3.5 flex items-center justify-between shrink-0">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="flex items-center gap-3">
        <button className="text-purple-400 hover:text-purple-200 transition-colors p-1.5 rounded-lg hover:bg-white/5">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          A
        </div>
      </div>
    </header>
  )
}

import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard': 'Dashboard',
  '/alumnos': 'Gestión de Alumnos',
  '/grupos': 'Gestión de Grupos',
  '/profesores': 'Gestión de Profesores',
  '/inscripciones': 'Inscripciones',
  '/asistencia': 'Registro de Asistencia',
  '/pagos': 'Pagos y Cuotas',
  '/evaluaciones': 'Evaluaciones',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'CREAR'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Academia de Danzas CREAR</span>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">A</div>
      </div>
    </header>
  )
}

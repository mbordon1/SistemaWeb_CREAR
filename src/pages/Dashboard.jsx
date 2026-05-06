import { useEffect, useState } from 'react'
import { Users, UsersRound, AlertCircle, ClipboardList, TrendingUp } from 'lucide-react'
import { getDashboardStats } from '../services/dashboard'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'

function StatCard({ label, value, subtitle, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bg} shrink-0`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  )
}

function Avatar({ nombre, apellido }) {
  const initials = `${(nombre?.[0] ?? '').toUpperCase()}${(apellido?.[0] ?? '').toUpperCase()}`
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, #6D5AE6, #9C8AF0)' }}>
      {initials}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ alumnos: 0, grupos: 0, cuotasPendientes: 0, alumnosConClases: 0 })
  const [inscripcionesRecientes, setInscripcionesRecientes] = useState([])
  const [cuotasPendientes, setCuotasPendientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getDashboardStats()
        setStats({
          alumnos: data.totalAlumnos,
          grupos: data.totalGrupos,
          cuotasPendientes: data.cuotasPendientes,
          alumnosConClases: data.alumnosConClases,
        })
        setInscripcionesRecientes(data.inscRecientes)
        setCuotasPendientes(data.cuotasPendientesList)
      } catch (err) {
        console.error('Error cargando dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-display">¡Bienvenida! 👋</h1>
        <p className="text-sm text-gray-400 mt-1">Aquí tenés un resumen de lo que sucede en tu academia hoy.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total alumnos" value={stats.alumnos}
          subtitle="Registrados en el sistema"
          bg="bg-primary-light" color="text-primary"
        />
        <StatCard
          icon={UsersRound} label="Grupos activos" value={stats.grupos}
          subtitle="Clases en curso"
          bg="bg-purple-50" color="text-purple-600"
        />
        <StatCard
          icon={AlertCircle} label="Cuotas pendientes" value={stats.cuotasPendientes}
          subtitle="Pendientes + vencidas"
          bg="bg-amber-50" color="text-amber-500"
        />
        <StatCard
          icon={ClipboardList} label="Con clases activas" value={stats.alumnosConClases}
          subtitle="Alumnos únicos con grupos asignados"
          bg="bg-emerald-50" color="text-emerald-600"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Últimas inscripciones */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Últimas Inscripciones</h3>
              <p className="text-xs text-gray-400 mt-0.5">Alumnos incorporados recientemente</p>
            </div>
            <TrendingUp size={16} className="text-primary" />
          </div>
          {inscripcionesRecientes.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardList size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No hay inscripciones activas</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {inscripcionesRecientes.map((i) => (
                <li key={i.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Avatar nombre={i.alumnos?.nombre} apellido={i.alumnos?.apellido} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {i.alumnos?.apellido}, {i.alumnos?.nombre}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{i.grupos?.nombre} · {i.grupos?.nivel}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                    {i.fecha ? new Date(i.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cuotas pendientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <AlertCircle size={14} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Cuotas a cobrar</h3>
              <p className="text-xs text-gray-400 mt-0.5">Pendientes de pago</p>
            </div>
          </div>
          {cuotasPendientes.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-500 text-lg">✓</span>
              </div>
              <p className="text-sm font-medium text-emerald-600">¡Todo al día!</p>
              <p className="text-xs text-gray-400 mt-1">No hay cuotas pendientes</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {cuotasPendientes.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {c.alumnos?.nombre} {c.alumnos?.apellido}
                    </p>
                    <p className="text-xs text-gray-400">{c.mes}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-semibold text-gray-800">${c.monto?.toLocaleString('es-AR')}</p>
                    <Badge color={c.estado === 'vencida' ? 'red' : 'yellow'}>{c.estado}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

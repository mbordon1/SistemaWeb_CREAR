import { useEffect, useState } from 'react'
import { Users, UsersRound, AlertCircle, ClipboardList, TrendingUp, CheckCircle2 } from 'lucide-react'
import { getDashboardStats } from '../services/dashboard'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

function StatCard({ label, value, subtitle, icon: Icon, iconBg, iconColor, numColor, borderColor }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColor} p-5 shadow-card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <p className={`text-3xl font-black tabular-nums ${numColor}`}>{value}</p>
      </div>
      <p className="text-sm font-semibold text-gray-700 leading-tight">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
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

function mesLabel(mes) {
  return new Date(mes + '-01T00:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
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
        <h1 className="text-2xl font-bold text-gray-800 font-display">¡Bienvenida!</h1>
        <p className="text-sm text-gray-400 mt-1">Resumen general de la Academia de Danzas CREAR.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total alumnos" value={stats.alumnos}
          subtitle="Registrados en el sistema"
          iconBg="bg-primary-light" iconColor="text-primary"
          numColor="text-primary" borderColor="border-l-primary"
        />
        <StatCard
          icon={UsersRound} label="Grupos activos" value={stats.grupos}
          subtitle="Clases en curso"
          iconBg="bg-violet-50" iconColor="text-violet-500"
          numColor="text-violet-500" borderColor="border-l-violet-400"
        />
        <StatCard
          icon={AlertCircle} label="Cuotas pendientes" value={stats.cuotasPendientes}
          subtitle="Pendientes + vencidas"
          iconBg="bg-amber-50" iconColor="text-amber-500"
          numColor="text-amber-500" borderColor="border-l-amber-400"
        />
        <StatCard
          icon={ClipboardList} label="Con clases activas" value={stats.alumnosConClases}
          subtitle="Alumnos únicos inscriptos"
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          numColor="text-emerald-600" borderColor="border-l-emerald-400"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Últimas inscripciones */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Últimas inscripciones</h3>
              <p className="text-xs text-gray-400 mt-0.5">Incorporaciones recientes</p>
            </div>
            <TrendingUp size={16} className="text-primary" />
          </div>
          {inscripcionesRecientes.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Sin inscripciones activas" />
          ) : (
            <ul className="space-y-1">
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
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <AlertCircle size={14} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Cuotas a cobrar</h3>
              <p className="text-xs text-gray-400 mt-0.5">Pendientes de pago</p>
            </div>
          </div>
          {cuotasPendientes.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-emerald-600">¡Todo al día!</p>
              <p className="text-xs text-gray-400 mt-1">No hay cuotas pendientes</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cuotasPendientes.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {c.alumnos?.apellido}, {c.alumnos?.nombre}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{mesLabel(c.mes)}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-semibold text-gray-800">${Number(c.monto).toLocaleString('es-AR')}</p>
                    <Badge color={c.estado === 'vencida' ? 'red' : 'yellow'} dot>{c.estado}</Badge>
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

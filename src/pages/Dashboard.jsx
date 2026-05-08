import { useEffect, useState } from 'react'
import { Users, UsersRound, AlertCircle, ClipboardList, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { getDashboardStats } from '../services/dashboard'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

/* ── Helpers ── */
function mesCorto(mes) {
  return new Date(mes + '-01T00:00:00').toLocaleDateString('es-AR', { month: 'short' })
}
function mesLabel(mes) {
  return new Date(mes + '-01T00:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

/* ── Stat card ── */
function StatCard({ label, value, subtitle, icon: Icon, iconBg, iconColor, numColor, borderColor }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#EDE9FE] border-l-4 ${borderColor} p-5 shadow-card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <p className={`text-3xl font-black tabular-nums leading-none ${numColor}`}>{value}</p>
      </div>
      <p className="text-sm font-semibold text-[#1E1B4B] leading-tight">{label}</p>
      {subtitle && <p className="text-xs text-[#A89FC8] mt-0.5">{subtitle}</p>}
    </div>
  )
}

/* ── Avatar ── */
function Avatar({ nombre, apellido }) {
  const initials = `${(nombre?.[0] ?? '').toUpperCase()}${(apellido?.[0] ?? '').toUpperCase()}`
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
      {initials}
    </div>
  )
}

/* ── Custom tooltip para el chart ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#EDE9FE] rounded-xl shadow-card-md px-4 py-3 text-xs">
      <p className="font-semibold text-[#1E1B4B] mb-1 capitalize">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: ${Number(p.value).toLocaleString('es-AR')}
        </p>
      ))}
    </div>
  )
}

/* ── Dashboard principal ── */
export default function Dashboard() {
  const [stats, setStats] = useState({ alumnos: 0, grupos: 0, cuotasPendientes: 0, alumnosConClases: 0 })
  const [inscripcionesRecientes, setInscripcionesRecientes] = useState([])
  const [cuotasPendientes, setCuotasPendientes] = useState([])
  const [cobrosmensuales, setCobrosmensuales] = useState([])
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
        setCobrosmensuales(
          data.cobrosmensuales.map((r) => ({ ...r, mes: mesCorto(r.mes) }))
        )
      } catch (err) {
        console.error('Error cargando dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  if (loading) return <Spinner className="mt-20" />

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-up">

      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1B4B] font-display">¡Bienvenida!</h1>
          <p className="text-sm text-[#A89FC8] mt-1 capitalize">{today}</p>
        </div>
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
          iconBg="bg-teal-light" iconColor="text-teal"
          numColor="text-teal" borderColor="border-l-teal"
        />
      </div>

      {/* Middle row: inscripciones + cuotas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Últimas inscripciones */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#EDE9FE] shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#1E1B4B]">Últimas inscripciones</h3>
              <p className="text-xs text-[#A89FC8] mt-0.5">Incorporaciones recientes</p>
            </div>
            <div className="p-2 bg-primary-light rounded-xl">
              <TrendingUp size={14} className="text-primary" />
            </div>
          </div>
          {inscripcionesRecientes.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Sin inscripciones activas" />
          ) : (
            <ul className="space-y-1">
              {inscripcionesRecientes.map((i) => (
                <li key={i.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F9F7FF] transition-colors">
                  <Avatar nombre={i.alumnos?.nombre} apellido={i.alumnos?.apellido} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1E1B4B] truncate">
                      {i.alumnos?.apellido}, {i.alumnos?.nombre}
                    </p>
                    <p className="text-xs text-[#A89FC8] truncate">{i.grupos?.nombre} · {i.grupos?.nivel}</p>
                  </div>
                  <span className="text-xs text-[#A89FC8] shrink-0 tabular-nums">
                    {i.fecha ? new Date(i.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cuotas pendientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EDE9FE] shadow-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-amber-50 rounded-xl">
              <AlertCircle size={14} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E1B4B]">Cuotas a cobrar</h3>
              <p className="text-xs text-[#A89FC8] mt-0.5">Pendientes de pago</p>
            </div>
          </div>
          {cuotasPendientes.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 size={20} className="text-teal" />
              </div>
              <p className="text-sm font-semibold text-teal">¡Todo al día!</p>
              <p className="text-xs text-[#A89FC8] mt-1">No hay cuotas pendientes</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cuotasPendientes.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-[#F9F7FF] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E1B4B] truncate">
                      {c.alumnos?.apellido}, {c.alumnos?.nombre}
                    </p>
                    <p className="text-xs text-[#A89FC8] capitalize">{mesLabel(c.mes)}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-bold text-[#1E1B4B]">${Number(c.monto).toLocaleString('es-AR')}</p>
                    <Badge color={c.estado === 'vencida' ? 'red' : 'yellow'} dot>{c.estado}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chart: cobros mensuales */}
      <div className="bg-white rounded-2xl border border-[#EDE9FE] shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#1E1B4B]">Cobros mensuales</h3>
            <p className="text-xs text-[#A89FC8] mt-0.5">Últimos 6 meses · cobrado vs pendiente</p>
          </div>
          <div className="p-2 bg-[#F4F2FF] rounded-xl">
            <BarChart3 size={14} className="text-primary" />
          </div>
        </div>

        {cobrosmensuales.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <BarChart3 size={28} className="text-[#DDD8F5] mb-3" />
            <p className="text-xs text-[#A89FC8]">Sin datos de cobros registrados</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cobrosmensuales} barCategoryGap="32%" barGap={4}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F4F2FF" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: '#A89FC8', fontFamily: 'Inter, sans-serif' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#A89FC8', fontFamily: 'Inter, sans-serif' }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={42}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9F7FF', radius: 6 }} />
              <Bar dataKey="cobrado"   name="Cobrado"   fill="#7C3AED" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pendiente" name="Pendiente" fill="#FCD34D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 justify-end">
          <span className="flex items-center gap-1.5 text-xs text-[#A89FC8]">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /> Cobrado
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#A89FC8]">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-300 inline-block" /> Pendiente
          </span>
        </div>
      </div>

    </div>
  )
}

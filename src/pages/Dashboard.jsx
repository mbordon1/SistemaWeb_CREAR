import { useEffect, useState } from 'react'
import { Users, UsersRound, AlertCircle, ClipboardList } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Spinner from '../components/ui/Spinner'

function StatCard({ label, value, subtitle, color, icon: Icon }) {
  return (
    <div className="bg-[#1a1547]/80 rounded-xl border border-purple-800/30 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color} shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-purple-300/70 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
        {subtitle && <p className="text-purple-400/60 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

function AvatarInitials({ nombre, apellido }) {
  const initials = `${(nombre?.[0] ?? '').toUpperCase()}${(apellido?.[0] ?? '').toUpperCase()}`
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
      {initials}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ alumnos: 0, grupos: 0, cuotasPendientes: 0, inscripciones: 0 })
  const [inscripcionesRecientes, setInscripcionesRecientes] = useState([])
  const [cuotasPendientes, setCuotasPendientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [
          { count: totalAlumnos },
          { count: totalGrupos },
          { count: totalCuotas },
          { count: totalInscripciones },
          { data: inscRecientes },
          { data: cuotas },
        ] = await Promise.all([
          supabase.from('alumnos').select('*', { count: 'exact', head: true }),
          supabase.from('grupos').select('*', { count: 'exact', head: true }),
          supabase.from('cuotas').select('*', { count: 'exact', head: true }).in('estado', ['pendiente', 'vencida']),
          supabase.from('inscripciones').select('*', { count: 'exact', head: true }).eq('estado', 'activa'),
          supabase.from('inscripciones')
            .select('id, fecha, estado, alumnos(nombre, apellido), grupos(nombre, nivel)')
            .eq('estado', 'activa')
            .order('fecha', { ascending: false })
            .limit(6),
          supabase.from('cuotas')
            .select('id, mes, monto, estado, alumnos(nombre, apellido)')
            .in('estado', ['pendiente', 'vencida'])
            .limit(4),
        ])
        setStats({
          alumnos: totalAlumnos ?? 0,
          grupos: totalGrupos ?? 0,
          cuotasPendientes: totalCuotas ?? 0,
          inscripciones: totalInscripciones ?? 0,
        })
        setInscripcionesRecientes(inscRecientes ?? [])
        setCuotasPendientes(cuotas ?? [])
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Alumnos activos" value={stats.alumnos} color="bg-violet-600" />
        <StatCard icon={UsersRound} label="Grupos activos" value={stats.grupos} color="bg-fuchsia-600" />
        <StatCard icon={AlertCircle} label="Cuotas pendientes" value={stats.cuotasPendientes} subtitle="Pendientes + vencidas" color="bg-amber-500" />
        <StatCard icon={ClipboardList} label="Inscripciones" value={stats.inscripciones} subtitle="Matrículas activas" color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Inscripciones recientes */}
        <div className="lg:col-span-3 bg-[#1a1547]/80 rounded-xl border border-purple-800/30 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Últimas Inscripciones</h3>
          {inscripcionesRecientes.length === 0 ? (
            <p className="text-sm text-purple-400/50 py-4 text-center">No hay inscripciones activas</p>
          ) : (
            <ul className="space-y-3">
              {inscripcionesRecientes.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <AvatarInitials nombre={i.alumnos?.nombre} apellido={i.alumnos?.apellido} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {i.alumnos?.apellido}, {i.alumnos?.nombre}
                    </p>
                    <p className="text-xs text-purple-400/60 truncate">{i.grupos?.nombre} · {i.grupos?.nivel}</p>
                  </div>
                  <span className="text-xs text-purple-400/60 shrink-0">
                    {i.fecha ? new Date(i.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cuotas pendientes */}
        <div className="lg:col-span-2 bg-[#1a1547]/80 rounded-xl border border-purple-800/30 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-400" />
            Cuotas a cobrar
          </h3>
          {cuotasPendientes.length === 0 ? (
            <p className="text-sm text-emerald-400/80 py-4 text-center">✔ ¡Todo al día!</p>
          ) : (
            <ul className="space-y-3">
              {cuotasPendientes.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.alumnos?.nombre} {c.alumnos?.apellido}</p>
                    <p className="text-xs text-purple-400/60">{c.mes}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">${c.monto}</p>
                    <span className={`text-xs font-medium ${
                      c.estado === 'vencida' ? 'text-red-400' : 'text-amber-400'
                    }`}>{c.estado}</span>
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

import { useEffect, useState } from 'react'
import { Users, UsersRound, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Spinner from '../components/ui/Spinner'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ alumnos: 0, grupos: 0, deudores: 0 })
  const [cuotasPendientes, setCuotasPendientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [
          { count: totalAlumnos },
          { count: totalGrupos },
          { data: pendientes },
        ] = await Promise.all([
          supabase.from('alumnos').select('*', { count: 'exact', head: true }),
          supabase.from('grupos').select('*', { count: 'exact', head: true }),
          supabase.from('cuotas')
            .select('id, mes, monto, estado, alumnos(nombre, apellido)')
            .in('estado', ['pendiente', 'vencida']).limit(5),
        ])
        setStats({ alumnos: totalAlumnos ?? 0, grupos: totalGrupos ?? 0, deudores: pendientes?.length ?? 0 })
        setCuotasPendientes(pendientes ?? [])
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Alumnos" value={stats.alumnos} color="bg-indigo-500" />
        <StatCard icon={UsersRound} label="Grupos Activos" value={stats.grupos} color="bg-emerald-500" />
        <StatCard icon={AlertCircle} label="Cuotas Pendientes" value={stats.deudores} color="bg-amber-500" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-500" />
          Cuotas pendientes recientes
        </h3>
        {cuotasPendientes.length === 0 ? (
          <p className="text-sm text-gray-500">No hay cuotas pendientes. ¡Todo al día!</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {cuotasPendientes.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.alumnos?.nombre} {c.alumnos?.apellido}</p>
                  <p className="text-xs text-gray-500">Mes: {c.mes}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">${c.monto}</p>
                  <span className={`text-xs font-medium ${c.estado === 'vencida' ? 'text-red-600' : 'text-amber-600'}`}>{c.estado}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

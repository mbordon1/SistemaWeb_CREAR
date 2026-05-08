import { supabase } from '../lib/supabase'

function buildMonthlyChart(rows) {
  const months = {}
  rows.forEach(({ mes, monto, estado }) => {
    if (!months[mes]) months[mes] = { mes, cobrado: 0, pendiente: 0 }
    if (estado === 'pagada') months[mes].cobrado += Number(monto)
    else months[mes].pendiente += Number(monto)
  })
  return Object.values(months).sort((a, b) => a.mes.localeCompare(b.mes))
}

export async function getDashboardStats() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  const fromMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`

  const [
    { count: totalAlumnos },
    { count: totalGrupos },
    { count: cuotasPendientesCount },
    { data: alumnosActivosRaw },
    { data: inscRecientesRaw },
    { data: cuotasRaw },
    { data: cuotasMeses },
  ] = await Promise.all([
    supabase.from('alumnos').select('*', { count: 'exact', head: true }),
    supabase.from('grupos').select('*', { count: 'exact', head: true }),
    supabase.from('cuotas').select('*', { count: 'exact', head: true }).in('estado', ['pendiente', 'vencida']),
    supabase.from('inscripciones').select('alumno_id').eq('estado', 'activa'),
    supabase.from('inscripciones')
      .select('id, fecha, alumno_id, grupo_id')
      .eq('estado', 'activa')
      .order('fecha', { ascending: false })
      .limit(6),
    supabase.from('cuotas')
      .select('id, mes, monto, estado, alumno_id')
      .in('estado', ['pendiente', 'vencida'])
      .limit(5),
    supabase.from('cuotas')
      .select('mes, monto, estado')
      .in('estado', ['pagada', 'pendiente', 'vencida'])
      .gte('mes', fromMonth)
      .order('mes', { ascending: true }),
  ])

  const alumnosConClases = new Set((alumnosActivosRaw ?? []).map((i) => i.alumno_id)).size

  const rawInsc = inscRecientesRaw ?? []
  const rawCuotas = cuotasRaw ?? []

  const alumnoIds = [...new Set([...rawInsc.map((i) => i.alumno_id), ...rawCuotas.map((c) => c.alumno_id)])]
  const grupoIds = [...new Set(rawInsc.map((i) => i.grupo_id))]

  const [{ data: alumnos }, { data: grupos }] = await Promise.all([
    alumnoIds.length
      ? supabase.from('alumnos').select('id, nombre, apellido').in('id', alumnoIds)
      : { data: [] },
    grupoIds.length
      ? supabase.from('grupos').select('id, nombre, nivel').in('id', grupoIds)
      : { data: [] },
  ])

  const alumnosMap = Object.fromEntries((alumnos ?? []).map((a) => [a.id, a]))
  const gruposMap = Object.fromEntries((grupos ?? []).map((g) => [g.id, g]))

  return {
    totalAlumnos: totalAlumnos ?? 0,
    totalGrupos: totalGrupos ?? 0,
    cuotasPendientes: cuotasPendientesCount ?? 0,
    alumnosConClases,
    inscRecientes: rawInsc.map((i) => ({
      ...i,
      alumnos: alumnosMap[i.alumno_id] ?? null,
      grupos: gruposMap[i.grupo_id] ?? null,
    })),
    cuotasPendientesList: rawCuotas.map((c) => ({
      ...c,
      alumnos: alumnosMap[c.alumno_id] ?? null,
    })),
    cobrosmensuales: buildMonthlyChart(cuotasMeses ?? []),
  }
}

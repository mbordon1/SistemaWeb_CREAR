import { supabase } from '../lib/supabase'

export async function getAsistenciasByGrupoFecha(grupo_id, fecha) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('grupo_id', grupo_id)
    .eq('fecha', fecha)
  if (error) throw error

  const alumnoIds = (data ?? []).map((r) => r.alumno_id)
  const { data: alumnos } = alumnoIds.length
    ? await supabase.from('alumnos').select('id, nombre, apellido').in('id', alumnoIds)
    : { data: [] }
  const alumnosMap = Object.fromEntries((alumnos ?? []).map((a) => [a.id, a]))

  return (data ?? []).map((r) => ({ ...r, alumnos: alumnosMap[r.alumno_id] ?? null }))
}

export async function registrarAsistencias(registros) {
  const { data, error } = await supabase
    .from('asistencias')
    .upsert(registros, { onConflict: 'alumno_id,grupo_id,fecha' })
    .select()
  if (error) throw error
  return data
}

export async function getAsistenciasByAlumno(alumno_id) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('alumno_id', alumno_id)
    .order('fecha', { ascending: false })
  if (error) throw error

  const grupoIds = [...new Set((data ?? []).map((r) => r.grupo_id))]
  const { data: grupos } = grupoIds.length
    ? await supabase.from('grupos').select('id, nombre').in('id', grupoIds)
    : { data: [] }
  const gruposMap = Object.fromEntries((grupos ?? []).map((g) => [g.id, g]))

  return (data ?? []).map((r) => ({ ...r, grupos: gruposMap[r.grupo_id] ?? null }))
}

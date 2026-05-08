import { supabase } from '../lib/supabase'

export async function getSueldos() {
  const { data, error } = await supabase
    .from('sueldos')
    .select('*')
    .order('periodo', { ascending: false })
  if (error) throw error

  const profesorIds = [...new Set((data ?? []).map((s) => s.profesor_id).filter(Boolean))]
  const { data: profesores } = profesorIds.length
    ? await supabase.from('profesores').select('id, nombre, apellido').in('id', profesorIds)
    : { data: [] }
  const profesoresMap = Object.fromEntries((profesores ?? []).map((p) => [p.id, p]))

  return (data ?? []).map((s) => ({ ...s, profesores: profesoresMap[s.profesor_id] ?? null }))
}

export async function createSueldo(sueldo) {
  const { data, error } = await supabase.from('sueldos').insert([sueldo]).select().single()
  if (error) throw error
  return data
}

export async function updateSueldo(id, cambios) {
  const { data, error } = await supabase.from('sueldos').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSueldo(id) {
  const { error } = await supabase.from('sueldos').delete().eq('id', id)
  if (error) throw error
}

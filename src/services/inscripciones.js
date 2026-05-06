import { supabase } from '../lib/supabase'

export async function getInscripciones() {
  const { data, error } = await supabase
    .from('inscripciones')
    .select(`*, alumnos (id, nombre, apellido, dni), grupos (id, nombre, nivel, capacidad_maxima)`)
    .order('fecha', { ascending: false })
  if (error) throw error
  return data
}

export async function createInscripcion(inscripcion) {
  const { data: grupo } = await supabase.from('grupos').select('capacidad_maxima').eq('id', inscripcion.grupo_id).single()
  const { count: inscriptosActivos } = await supabase
    .from('inscripciones').select('*', { count: 'exact', head: true })
    .eq('grupo_id', inscripcion.grupo_id).eq('estado', 'activa')
  if (inscriptosActivos >= grupo.capacidad_maxima) {
    throw new Error('El grupo no tiene cupo disponible. El alumno quedará en lista de espera.')
  }
  const { data, error } = await supabase.from('inscripciones').insert([{ ...inscripcion, estado: 'activa' }]).select().single()
  if (error) throw error
  return data
}

export async function updateInscripcion(id, cambios) {
  const { data, error } = await supabase.from('inscripciones').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

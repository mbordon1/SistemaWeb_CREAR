import { supabase } from '../lib/supabase'

export async function getAlumnos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select(`*, grupos (id, nombre, nivel)`)
    .order('apellido', { ascending: true })
  if (error) throw error
  return data
}

export async function getAlumnoById(id) {
  const { data, error } = await supabase
    .from('alumnos')
    .select(`*, grupos (id, nombre, nivel), alumnos_padres (padres (id, nombre, apellido, telefono, email))`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createAlumno(alumno) {
  const { data, error } = await supabase.from('alumnos').insert([alumno]).select().single()
  if (error) throw error
  return data
}

export async function updateAlumno(id, cambios) {
  const { data, error } = await supabase.from('alumnos').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAlumno(id) {
  const { error } = await supabase.from('alumnos').delete().eq('id', id)
  if (error) throw error
}

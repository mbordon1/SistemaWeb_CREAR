import { supabase } from '../lib/supabase'

export async function getAlumnos() {
  const { data: alumnos, error } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido, dni, telefono, email, domicilio, fecha_nacimiento, fecha_alta')
    .order('apellido', { ascending: true })
  if (error) throw error

  // Consulta separada para no depender de FK en Supabase
  const { data: inscripciones } = await supabase
    .from('inscripciones')
    .select('id, alumno_id, estado, grupo_id, grupos(id, nombre, nivel)')
    .eq('estado', 'activa')

  const inscByAlumno = {}
  ;(inscripciones ?? []).forEach((i) => {
    if (!inscByAlumno[i.alumno_id]) inscByAlumno[i.alumno_id] = []
    inscByAlumno[i.alumno_id].push(i)
  })

  return alumnos.map((a) => ({ ...a, inscripciones: inscByAlumno[a.id] ?? [] }))
}

export async function getAlumnoById(id) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
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

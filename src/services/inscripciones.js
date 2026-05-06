import { supabase } from '../lib/supabase'

export async function getInscripciones() {
  const { data, error } = await supabase
    .from('inscripciones')
    .select(`*, alumnos (id, nombre, apellido, dni), grupos (id, nombre, nivel, capacidad_maxima)`)
    .order('fecha', { ascending: false })
  if (error) throw error
  return data
}

async function verificarCupo(grupo_id) {
  const { data: grupo } = await supabase.from('grupos').select('capacidad_maxima').eq('id', grupo_id).single()
  const { count: inscriptosActivos } = await supabase
    .from('inscripciones').select('*', { count: 'exact', head: true })
    .eq('grupo_id', grupo_id).eq('estado', 'activa')
  if (inscriptosActivos >= grupo.capacidad_maxima) {
    throw new Error('El grupo no tiene cupo disponible.')
  }
}

export async function createInscripcion({ alumno_id, grupo_id }) {
  await verificarCupo(grupo_id)
  const fecha = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('inscripciones')
    .insert([{ alumno_id, grupo_id, fecha, estado: 'activa' }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createInscripcionConAlumno({ alumnoData, grupo_id }) {
  await verificarCupo(grupo_id)

  const { data: alumnoExistente } = await supabase
    .from('alumnos').select('id').eq('dni', alumnoData.dni).maybeSingle()

  let alumno_id
  if (alumnoExistente) {
    alumno_id = alumnoExistente.id
  } else {
    const { data: nuevoAlumno, error: errAlumno } = await supabase
      .from('alumnos')
      .insert([{ ...alumnoData, fecha_alta: new Date().toISOString().split('T')[0] }])
      .select()
      .single()
    if (errAlumno) throw errAlumno
    alumno_id = nuevoAlumno.id
  }

  const { data: inscExistente } = await supabase
    .from('inscripciones').select('id').eq('alumno_id', alumno_id).eq('grupo_id', grupo_id).maybeSingle()
  if (inscExistente) throw new Error('El alumno ya está inscripto en este grupo.')

  const fecha = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('inscripciones')
    .insert([{ alumno_id, grupo_id, fecha, estado: 'activa' }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInscripcion(id, cambios) {
  const { data, error } = await supabase.from('inscripciones').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

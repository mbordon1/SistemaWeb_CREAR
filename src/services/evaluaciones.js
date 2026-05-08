import { supabase } from '../lib/supabase'

export async function getCriterios() {
  const { data, error } = await supabase.from('criterios').select('*').order('nombre')
  if (error) throw error
  return data
}

export async function createCriterio(nombre) {
  const { data, error } = await supabase.from('criterios').insert([{ nombre }]).select().single()
  if (error) throw error
  return data
}

export async function getPlantillas() {
  const { data: plantillas, error } = await supabase
    .from('plantillas_evaluacion')
    .select('*')
  if (error) throw error
  if (!plantillas?.length) return []

  const grupoIds = [...new Set(plantillas.map((p) => p.grupo_id).filter(Boolean))]
  const plantillaIds = plantillas.map((p) => p.id)

  const [{ data: grupos }, { data: plantillaCriterios }] = await Promise.all([
    grupoIds.length
      ? supabase.from('grupos').select('id, nombre').in('id', grupoIds)
      : { data: [] },
    supabase.from('plantilla_criterios').select('plantilla_id, criterio_id').in('plantilla_id', plantillaIds),
  ])

  const criterioIds = [...new Set((plantillaCriterios ?? []).map((pc) => pc.criterio_id))]
  const { data: criterios } = criterioIds.length
    ? await supabase.from('criterios').select('id, nombre').in('id', criterioIds)
    : { data: [] }

  const gruposMap = Object.fromEntries((grupos ?? []).map((g) => [g.id, g]))
  const criteriosMap = Object.fromEntries((criterios ?? []).map((c) => [c.id, c]))
  const pcByPlantilla = {}
  ;(plantillaCriterios ?? []).forEach((pc) => {
    if (!pcByPlantilla[pc.plantilla_id]) pcByPlantilla[pc.plantilla_id] = []
    pcByPlantilla[pc.plantilla_id].push({
      criterio_id: pc.criterio_id,
      criterios: criteriosMap[pc.criterio_id] ?? null,
    })
  })

  return plantillas.map((p) => ({
    ...p,
    grupos: gruposMap[p.grupo_id] ?? null,
    plantilla_criterios: pcByPlantilla[p.id] ?? [],
  }))
}

export async function createPlantilla(nombre, grupo_id, criterio_ids) {
  const { data: plantilla, error: errPlantilla } = await supabase
    .from('plantillas_evaluacion').insert([{ nombre, grupo_id }]).select().single()
  if (errPlantilla) throw errPlantilla
  const relaciones = criterio_ids.map(criterio_id => ({ plantilla_id: plantilla.id, criterio_id }))
  const { error: errRel } = await supabase.from('plantilla_criterios').insert(relaciones)
  if (errRel) throw errRel
  return plantilla
}

export async function getEvaluaciones() {
  const { data: evaluaciones, error } = await supabase
    .from('evaluaciones')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throw error
  if (!evaluaciones?.length) return []

  const alumnoIds = [...new Set(evaluaciones.map((e) => e.alumno_id).filter(Boolean))]
  const grupoIds = [...new Set(evaluaciones.map((e) => e.grupo_id).filter(Boolean))]
  const plantillaIds = [...new Set(evaluaciones.map((e) => e.plantilla_id).filter(Boolean))]
  const evaluacionIds = evaluaciones.map((e) => e.id)

  const [{ data: alumnos }, { data: grupos }, { data: plantillas }, { data: detalles }] = await Promise.all([
    alumnoIds.length ? supabase.from('alumnos').select('id, nombre, apellido').in('id', alumnoIds) : { data: [] },
    grupoIds.length ? supabase.from('grupos').select('id, nombre').in('id', grupoIds) : { data: [] },
    plantillaIds.length ? supabase.from('plantillas_evaluacion').select('id, nombre').in('id', plantillaIds) : { data: [] },
    supabase.from('evaluacion_detalle').select('evaluacion_id, criterio_id, nota, observacion').in('evaluacion_id', evaluacionIds),
  ])

  const criterioIds = [...new Set((detalles ?? []).map((d) => d.criterio_id).filter(Boolean))]
  const { data: criterios } = criterioIds.length
    ? await supabase.from('criterios').select('id, nombre').in('id', criterioIds)
    : { data: [] }

  const alumnosMap = Object.fromEntries((alumnos ?? []).map((a) => [a.id, a]))
  const gruposMap = Object.fromEntries((grupos ?? []).map((g) => [g.id, g]))
  const plantillasMap = Object.fromEntries((plantillas ?? []).map((p) => [p.id, p]))
  const criteriosMap = Object.fromEntries((criterios ?? []).map((c) => [c.id, c]))

  const detallesByEval = {}
  ;(detalles ?? []).forEach((d) => {
    if (!detallesByEval[d.evaluacion_id]) detallesByEval[d.evaluacion_id] = []
    detallesByEval[d.evaluacion_id].push({ ...d, criterios: criteriosMap[d.criterio_id] ?? null })
  })

  return evaluaciones.map((e) => ({
    ...e,
    alumnos: alumnosMap[e.alumno_id] ?? null,
    grupos: gruposMap[e.grupo_id] ?? null,
    plantillas_evaluacion: plantillasMap[e.plantilla_id] ?? null,
    evaluacion_detalle: detallesByEval[e.id] ?? [],
  }))
}

export async function createEvaluacion(evaluacion, detalles) {
  const { data: eva, error } = await supabase.from('evaluaciones').insert([evaluacion]).select().single()
  if (error) throw error
  const detallesConId = detalles.map(d => ({ evaluacion_id: eva.id, criterio_id: d.criterio_id, nota: d.nota, observacion: d.observacion }))
  const { error: errDet } = await supabase.from('evaluacion_detalle').insert(detallesConId)
  if (errDet) throw errDet
  return eva
}

import { supabase } from '../lib/supabase'

export async function getCuotasByAlumno(alumno_id) {
  const { data: cuotas, error } = await supabase
    .from('cuotas')
    .select('*')
    .eq('alumno_id', alumno_id)
    .order('fecha_vencimiento', { ascending: false })
  if (error) throw error

  const cuotaIds = (cuotas ?? []).map((c) => c.id)
  const { data: pagos } = cuotaIds.length
    ? await supabase.from('pagos').select('id, cuota_id, monto_pagado, fecha_pago, metodo').in('cuota_id', cuotaIds)
    : { data: [] }
  const pagosMap = {}
  ;(pagos ?? []).forEach((p) => {
    if (!pagosMap[p.cuota_id]) pagosMap[p.cuota_id] = []
    pagosMap[p.cuota_id].push(p)
  })

  return (cuotas ?? []).map((c) => ({ ...c, pagos: pagosMap[c.id] ?? [] }))
}

export async function getCuotasPendientes() {
  const { data: cuotas, error } = await supabase
    .from('cuotas')
    .select('id, alumno_id, mes, monto, estado, fecha_vencimiento')
    .in('estado', ['pendiente', 'vencida'])
    .order('fecha_vencimiento', { ascending: true })
  if (error) throw error
  if (!cuotas?.length) return []

  const alumnoIds = [...new Set(cuotas.map((c) => c.alumno_id))]
  const cuotaIds = cuotas.map((c) => c.id)

  const [{ data: alumnos }, { data: pagos }] = await Promise.all([
    supabase.from('alumnos').select('id, nombre, apellido').in('id', alumnoIds),
    supabase.from('pagos').select('id, cuota_id, monto_pagado, fecha_pago, metodo').in('cuota_id', cuotaIds),
  ])

  const alumnosMap = Object.fromEntries((alumnos ?? []).map((a) => [a.id, a]))
  const pagosMap = {}
  ;(pagos ?? []).forEach((p) => {
    if (!pagosMap[p.cuota_id]) pagosMap[p.cuota_id] = []
    pagosMap[p.cuota_id].push(p)
  })

  return cuotas.map((c) => ({
    ...c,
    alumnos: alumnosMap[c.alumno_id] ?? null,
    pagos: pagosMap[c.id] ?? [],
  }))
}

export async function generarCuotas(alumno_id, mes, monto, fecha_vencimiento) {
  const { data, error } = await supabase
    .from('cuotas')
    .insert([{ alumno_id, mes, monto, estado: 'pendiente', fecha_vencimiento }])
    .select().single()
  if (error) throw error
  return data
}

/**
 * Registra un pago de forma atómica usando la función PostgreSQL `registrar_pago`.
 *
 * Las 3 operaciones (INSERT pagos → UPDATE cuotas → INSERT comprobantes) se ejecutan
 * en una sola transacción de base de datos. Si cualquiera falla, todas se revierten.
 *
 * Requiere que la función `registrar_pago` esté creada en Supabase (ver SQL de migración).
 */
export async function registrarPago(cuota_id, pago) {
  const { data, error } = await supabase.rpc('registrar_pago', {
    p_cuota_id:   cuota_id,
    p_monto:      pago.monto_pagado,
    p_metodo:     pago.metodo,
    p_fecha_pago: pago.fecha_pago,
  })
  if (error) throw new Error(error.message)

  return {
    comprobante: {
      id:     data.comp_id,
      numero: data.numero,
    },
  }
}

/**
 * Devuelve los datos de pago y comprobante asociados a una cuota.
 * Se usa para reimprimir recibos de cuotas ya pagadas.
 */
export async function getReciboByCuota(cuota_id) {
  const { data: pago, error } = await supabase
    .from('pagos')
    .select('id, monto_pagado, fecha_pago, metodo')
    .eq('cuota_id', cuota_id)
    .maybeSingle()
  if (error || !pago) return null

  const { data: comprobante } = await supabase
    .from('comprobantes')
    .select('id, numero')
    .eq('pago_id', pago.id)
    .maybeSingle()

  return { pago, comprobante }
}

export async function getComprobantes() {
  const { data: comprobantes, error } = await supabase
    .from('comprobantes')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throw error
  if (!comprobantes?.length) return []

  const pagoIds = comprobantes.map((c) => c.pago_id)
  const { data: pagos } = await supabase
    .from('pagos')
    .select('id, monto_pagado, metodo, fecha_pago, cuota_id')
    .in('id', pagoIds)

  const cuotaIds = [...new Set((pagos ?? []).map((p) => p.cuota_id).filter(Boolean))]
  const { data: cuotas } = cuotaIds.length
    ? await supabase.from('cuotas').select('id, mes, monto, alumno_id').in('id', cuotaIds)
    : { data: [] }

  const alumnoIds = [...new Set((cuotas ?? []).map((c) => c.alumno_id).filter(Boolean))]
  const { data: alumnos } = alumnoIds.length
    ? await supabase.from('alumnos').select('id, nombre, apellido').in('id', alumnoIds)
    : { data: [] }

  const alumnosMap = Object.fromEntries((alumnos ?? []).map((a) => [a.id, a]))
  const cuotasMap = Object.fromEntries(
    (cuotas ?? []).map((c) => [c.id, { ...c, alumnos: alumnosMap[c.alumno_id] ?? null }])
  )
  const pagosMap = Object.fromEntries(
    (pagos ?? []).map((p) => [p.id, { ...p, cuotas: cuotasMap[p.cuota_id] ?? null }])
  )

  return comprobantes.map((c) => ({ ...c, pagos: pagosMap[c.pago_id] ?? null }))
}

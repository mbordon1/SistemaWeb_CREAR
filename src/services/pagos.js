import { supabase } from '../lib/supabase'

export async function getCuotasByAlumno(alumno_id) {
  const { data, error } = await supabase
    .from('cuotas')
    .select(`*, pagos (id, monto_pagado, fecha_pago, metodo)`)
    .eq('alumno_id', alumno_id)
    .order('fecha_vencimiento', { ascending: false })
  if (error) throw error
  return data
}

export async function getCuotasPendientes() {
  const { data, error } = await supabase
    .from('cuotas')
    .select(`*, alumnos (id, nombre, apellido), pagos (id, monto_pagado, fecha_pago, metodo)`)
    .in('estado', ['pendiente', 'vencida'])
    .order('fecha_vencimiento', { ascending: true })
  if (error) throw error
  return data
}

export async function generarCuotas(alumno_id, mes, monto, fecha_vencimiento) {
  const { data, error } = await supabase
    .from('cuotas')
    .insert([{ alumno_id, mes, monto, estado: 'pendiente', fecha_vencimiento }])
    .select().single()
  if (error) throw error
  return data
}

export async function registrarPago(cuota_id, pago) {
  const { data: pagoData, error } = await supabase
    .from('pagos')
    .insert([{ cuota_id, ...pago }])
    .select().single()
  if (error) throw error

  await supabase.from('cuotas').update({ estado: 'pagada' }).eq('id', cuota_id)

  const { count } = await supabase
    .from('comprobantes')
    .select('*', { count: 'exact', head: true })
  const numero = `REC-${String((count ?? 0) + 1).padStart(4, '0')}`
  const { data: comprobante } = await supabase
    .from('comprobantes')
    .insert([{ pago_id: pagoData.id, numero }])
    .select().single()

  return { ...pagoData, comprobante }
}

export async function getComprobantes() {
  const { data, error } = await supabase
    .from('comprobantes')
    .select(`*, pagos (id, monto_pagado, metodo, fecha_pago, cuotas (mes, monto, alumnos (nombre, apellido)))`)
    .order('fecha', { ascending: false })
  if (error) throw error
  return data
}

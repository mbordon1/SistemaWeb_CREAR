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
  const { data, error } = await supabase.from('pagos').insert([{ cuota_id, ...pago }]).select().single()
  if (error) throw error
  await supabase.from('cuotas').update({ estado: 'pagada' }).eq('id', cuota_id)
  return data
}

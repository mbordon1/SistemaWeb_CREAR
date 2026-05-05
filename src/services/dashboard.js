import { supabase } from '../lib/supabase'

export async function getDashboardStats() {
  const [{ count: totalAlumnos }, { count: totalGrupos }, { data: cuotasPendientes }] = await Promise.all([
    supabase.from('alumnos').select('*', { count: 'exact', head: true }),
    supabase.from('grupos').select('*', { count: 'exact', head: true }),
    supabase.from('cuotas').select('id, mes, monto, alumnos(nombre, apellido)').eq('estado', 'pendiente'),
  ])
  return { totalAlumnos: totalAlumnos ?? 0, totalGrupos: totalGrupos ?? 0, cuotasPendientes: cuotasPendientes ?? [] }
}

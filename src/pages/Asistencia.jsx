import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Save } from 'lucide-react'
import { getGrupos } from '../services/grupos'
import { getAsistenciasByGrupoFecha, registrarAsistencias } from '../services/asistencias'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'

export default function Asistencia() {
  const [grupos, setGrupos] = useState([])
  const [grupoId, setGrupoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [alumnos, setAlumnos] = useState([])
  const [asistencia, setAsistencia] = useState({})
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => { getGrupos().then(setGrupos) }, [])

  useEffect(() => { if (!grupoId) return; cargarAsistencia() }, [grupoId, fecha])

  async function cargarAsistencia() {
    setLoading(true); setGuardado(false)
    try {
      const { data: inscripciones } = await supabase
        .from('inscripciones').select('alumnos(id, nombre, apellido)')
        .eq('grupo_id', grupoId).eq('estado', 'activa')
      const alumnosDelGrupo = inscripciones?.map((i) => i.alumnos) ?? []
      setAlumnos(alumnosDelGrupo)
      const registros = await getAsistenciasByGrupoFecha(grupoId, fecha)
      const mapa = {}
      registros.forEach((r) => { mapa[r.alumno_id] = r.presente })
      alumnosDelGrupo.forEach((a) => { if (mapa[a.id] === undefined) mapa[a.id] = true })
      setAsistencia(mapa)
    } finally { setLoading(false) }
  }

  function toggleAsistencia(alumnoId) {
    setAsistencia((prev) => ({ ...prev, [alumnoId]: !prev[alumnoId] }))
    setGuardado(false)
  }

  async function guardar() {
    setGuardando(true)
    try {
      const registros = alumnos.map((a) => ({ alumno_id: a.id, grupo_id: grupoId, fecha, presente: asistencia[a.id] ?? true }))
      await registrarAsistencias(registros)
      setGuardado(true)
    } catch (err) { alert('Error al guardar: ' + err.message) }
    finally { setGuardando(false) }
  }

  const presentes = Object.values(asistencia).filter(Boolean).length
  const ausentes = alumnos.length - presentes

  return (
    <div className="space-y-5">
      <div className="bg-[#1a1547]/80 rounded-xl border border-purple-800/30 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Grupo" value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
            <option value="">Seleccionar grupo...</option>
            {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre} — {g.nivel}</option>)}
          </Select>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-purple-300/80 uppercase tracking-wide">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-purple-800/40 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-colors" />
          </div>
        </div>
      </div>
      {grupoId && (
        <div className="bg-[#1a1547]/80 rounded-xl border border-purple-800/30">
          <div className="px-5 py-4 border-b border-purple-800/20 flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400 font-medium">{presentes} presentes</span>
              <span className="text-red-400 font-medium">{ausentes} ausentes</span>
            </div>
            {guardado && <span className="text-sm text-emerald-400 font-medium">✓ Guardado</span>}
          </div>
          {loading ? <Spinner className="py-10" /> : alumnos.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-purple-400/50">No hay alumnos con inscripción activa en este grupo</p>
          ) : (
            <ul className="divide-y divide-purple-800/20">
              {alumnos.map((a) => {
                const presente = asistencia[a.id] ?? true
                return (
                  <li key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/3 cursor-pointer transition-colors" onClick={() => toggleAsistencia(a.id)}>
                    <span className="text-sm font-medium text-white">{a.apellido}, {a.nombre}</span>
                    {presente ? <CheckCircle size={22} className="text-emerald-400" /> : <XCircle size={22} className="text-red-400" />}
                  </li>
                )
              })}
            </ul>
          )}
          {alumnos.length > 0 && (
            <div className="px-5 py-4 border-t border-purple-800/20 flex justify-end">
              <Button onClick={guardar} disabled={guardando}><Save size={16} />{guardando ? 'Guardando...' : 'Guardar asistencia'}</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

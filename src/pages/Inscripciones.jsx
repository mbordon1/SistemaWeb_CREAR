import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { getInscripciones, createInscripcion, updateInscripcion } from '../services/inscripciones'
import { getAlumnos } from '../services/alumnos'
import { getGrupos } from '../services/grupos'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const ESTADO_COLOR = { activa: 'green', baja: 'red', espera: 'yellow' }

export default function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState({ alumno_id: '', grupo_id: '' })
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try { const [i, a, g] = await Promise.all([getInscripciones(), getAlumnos(), getGrupos()]); setInscripciones(i); setAlumnos(a); setGrupos(g) }
    finally { setLoading(false) }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errores[name]) setErrores((p) => ({ ...p, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.alumno_id) e2.alumno_id = 'Selecioná un alumno'
    if (!form.grupo_id) e2.grupo_id = 'Selecioná un grupo'
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true); setMensajeError('')
    try {
      await createInscripcion({ alumno_id: form.alumno_id, grupo_id: form.grupo_id, fecha: new Date().toISOString().split('T')[0] })
      await cargar(); setModalAbierto(false); setForm({ alumno_id: '', grupo_id: '' })
    } catch (err) { setMensajeError(err.message) }
    finally { setGuardando(false) }
  }

  async function cambiarEstado(id, estado) {
    try { await updateInscripcion(id, { estado }); await cargar() } catch (err) { alert(err.message) }
  }

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => { setModalAbierto(true); setMensajeError(''); setErrores({}); setForm({ alumno_id: '', grupo_id: '' }) }}>
          <Plus size={16} />Nueva Inscripción
        </Button>
      </div>
      <Table>
        <Thead><tr><Th>Alumno</Th><Th>Grupo</Th><Th>Nivel</Th><Th>Fecha</Th><Th>Estado</Th><Th>Cambiar estado</Th></tr></Thead>
        <Tbody>
          {inscripciones.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-purple-400/50">No hay inscripciones</td></tr>
          ) : inscripciones.map((i) => (
            <tr key={i.id} className="hover:bg-white/3 transition-colors">
              <Td>
                <span className="font-medium text-white">{i.alumnos?.apellido}, {i.alumnos?.nombre}</span>
                <p className="text-xs text-purple-400/60">DNI: {i.alumnos?.dni}</p>
              </Td>
              <Td>{i.grupos?.nombre}</Td>
              <Td>{i.grupos?.nivel}</Td>
              <Td>{i.fecha ? new Date(i.fecha).toLocaleDateString('es-AR') : '—'}</Td>
              <Td><Badge color={ESTADO_COLOR[i.estado] ?? 'gray'}>{i.estado}</Badge></Td>
              <Td>
                <select value={i.estado} onChange={(e) => cambiarEstado(i.id, e.target.value)}
                  className="text-xs bg-[#1a1547] border border-purple-800/40 text-purple-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500">
                  <option value="activa">Activa</option>
                  <option value="baja">Baja</option>
                  <option value="espera">Lista de espera</option>
                </select>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Nueva Inscripción">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mensajeError && <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2 rounded text-sm">{mensajeError}</div>}
          <Select label="Alumno *" name="alumno_id" value={form.alumno_id} onChange={handleChange} error={errores.alumno_id}>
            <option value="">Seleccionar alumno...</option>
            {alumnos.map((a) => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre} — DNI: {a.dni}</option>)}
          </Select>
          <Select label="Grupo *" name="grupo_id" value={form.grupo_id} onChange={handleChange} error={errores.grupo_id}>
            <option value="">Seleccionar grupo...</option>
            {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre} — {g.nivel} (cap. {g.capacidad_maxima})</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Inscribiendo...' : 'Inscribir'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

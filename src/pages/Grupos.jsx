import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getGrupos, createGrupo, updateGrupo, deleteGrupo } from '../services/grupos'
import { getProfesores } from '../services/profesores'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const NIVELES = ['Inicial', 'Intermedio', 'Avanzado']
const FORM_INICIAL = { nombre: '', nivel: '', horario: '', descripcion: '', profesor_id: '', capacidad_maxima: '' }

export default function Grupos() {
  const [grupos, setGrupos] = useState([])
  const [profesores, setProfesores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    try { const [g, p] = await Promise.all([getGrupos(), getProfesores()]); setGrupos(g); setProfesores(p) }
    finally { setLoading(false) }
  }

  function abrirCrear() { setEditando(null); setForm(FORM_INICIAL); setErrores({}); setModalAbierto(true) }

  function abrirEditar(g) {
    setEditando(g)
    setForm({ nombre: g.nombre ?? '', nivel: g.nivel ?? '', horario: g.horario ?? '',
      descripcion: g.descripcion ?? '', profesor_id: g.profesor_id ?? '', capacidad_maxima: g.capacidad_maxima ?? '' })
    setErrores({}); setModalAbierto(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errores[name]) setErrores((p) => ({ ...p, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.nombre.trim()) e2.nombre = 'Obligatorio'
    if (!form.nivel) e2.nivel = 'Seleccioná un nivel'
    if (!form.horario.trim()) e2.horario = 'Obligatorio'
    if (!form.descripcion.trim()) e2.descripcion = 'Obligatorio'
    if (!form.profesor_id) e2.profesor_id = 'Seleccioná un profesor'
    if (!form.capacidad_maxima) e2.capacidad_maxima = 'Obligatorio'
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true)
    try {
      const payload = { nombre: form.nombre.trim(), nivel: form.nivel, horario: form.horario.trim(),
        descripcion: form.descripcion.trim(), profesor_id: form.profesor_id, capacidad_maxima: Number(form.capacidad_maxima) }
      if (editando) { await updateGrupo(editando.id, payload) } else { await createGrupo(payload) }
      await cargarDatos(); setModalAbierto(false)
    } catch (err) { setErrores({ general: err.message }) }
    finally { setGuardando(false) }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este grupo?')) return
    try { await deleteGrupo(id); await cargarDatos() } catch (err) { alert(err.message) }
  }

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-5">
      <div className="flex justify-end"><Button onClick={abrirCrear}><Plus size={16} />Nuevo Grupo</Button></div>
      <Table>
        <Thead>
          <tr><Th>Nombre</Th><Th>Nivel</Th><Th>Horario</Th><Th>Profesor</Th><Th>Capacidad</Th><Th className="text-right">Acciones</Th></tr>
        </Thead>
        <Tbody>
          {grupos.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No hay grupos</td></tr>
          ) : grupos.map((g) => (
            <tr key={g.id} className="hover:bg-gray-50/70 transition-colors">
              <Td>
                <p className="font-medium text-gray-800">{g.nombre}</p>
                {g.descripcion && <p className="text-xs text-gray-400 max-w-xs truncate">{g.descripcion}</p>}
              </Td>
              <Td><Badge color="blue">{g.nivel}</Badge></Td>
              <Td>{g.horario}</Td>
              <Td>{g.profesores ? `${g.profesores.nombre} ${g.profesores.apellido}` : <span className="text-gray-400">Sin asignar</span>}</Td>
              <Td>{g.capacidad_maxima} alumnos</Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => abrirEditar(g)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleEliminar(g.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={editando ? 'Editar Grupo' : 'Nuevo Grupo'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errores.general && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{errores.general}</div>}
          <Input label="Nombre del grupo *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} placeholder="Ej: Tango Intermedio" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Nivel *" name="nivel" value={form.nivel} onChange={handleChange} error={errores.nivel}>
              <option value="">Seleccionar nivel...</option>
              {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <Input label="Capacidad máxima *" name="capacidad_maxima" type="number" min="1" value={form.capacidad_maxima} onChange={handleChange} error={errores.capacidad_maxima} />
          </div>
          <Input label="Horario *" name="horario" value={form.horario} onChange={handleChange} error={errores.horario} placeholder="Ej: Lunes y Miércoles 18:00–19:30" />
          <Input label="Descripción *" name="descripcion" value={form.descripcion} onChange={handleChange} error={errores.descripcion} placeholder="Ej: Clase para principiantes mayores de 12 años" />
          <Select label="Profesor *" name="profesor_id" value={form.profesor_id} onChange={handleChange} error={errores.profesor_id}>
            <option value="">Seleccionar profesor...</option>
            {profesores.map((p) => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear grupo'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

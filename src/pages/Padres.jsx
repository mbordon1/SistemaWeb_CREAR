import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Link } from 'lucide-react'
import { getPadres, createPadre, updatePadre, deletePadre, vincularPadreAlumno } from '../services/padres'
import { getAlumnos } from '../services/alumnos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Spinner from '../components/ui/Spinner'

const FORM_INICIAL = { nombre: '', apellido: '', telefono: '', email: '' }

export default function Padres() {
  const [padres, setPadres] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalVincular, setModalVincular] = useState(false)
  const [editando, setEditando] = useState(null)
  const [padreVincular, setPadreVincular] = useState(null)
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensajeVincular, setMensajeVincular] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try {
      const [p, a] = await Promise.all([getPadres(), getAlumnos()])
      setPadres(p); setAlumnos(a)
    } finally { setLoading(false) }
  }

  function abrirCrear() { setEditando(null); setForm(FORM_INICIAL); setErrores({}); setModalAbierto(true) }

  function abrirEditar(p) {
    setEditando(p)
    setForm({ nombre: p.nombre, apellido: p.apellido, telefono: p.telefono, email: p.email ?? '' })
    setErrores({}); setModalAbierto(true)
  }

  function abrirVincular(p) {
    setPadreVincular(p); setAlumnoSeleccionado(''); setMensajeVincular(''); setModalVincular(true)
  }

  function validar(f) {
    const e = {}
    if (!f.nombre.trim()) e.nombre = 'Obligatorio'
    if (!f.apellido.trim()) e.apellido = 'Obligatorio'
    if (!f.telefono.trim()) e.telefono = 'Obligatorio'
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Email inválido'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    const nuevo = { ...form, [name]: value }
    setForm(nuevo)
    setErrores(validar(nuevo))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validar(form)
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim() || null,
      }
      if (editando) { await updatePadre(editando.id, payload) }
      else { await createPadre(payload) }
      await cargar(); setModalAbierto(false)
    } catch (err) {
      setErrores({ general: 'No se pudo guardar' })
    } finally { setGuardando(false) }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este padre/tutor?')) return
    try { await deletePadre(id); await cargar() }
    catch (err) { alert(err.message) }
  }

  async function handleVincular(e) {
    e.preventDefault()
    if (!alumnoSeleccionado) return
    setGuardando(true)
    try {
      await vincularPadreAlumno(padreVincular.id, alumnoSeleccionado)
      setMensajeVincular('Vinculado exitosamente')
      setAlumnoSeleccionado('')
    } catch (err) {
      setMensajeVincular(err.message.includes('duplicate') ? 'Ya existe ese vínculo' : err.message)
    } finally { setGuardando(false) }
  }

  if (loading) return <Spinner className="mt-20" />

  const hayErrores = Object.entries(errores).some(([k, v]) => k !== 'general' && v)

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={abrirCrear}><Plus size={16} />Nuevo Padre/Tutor</Button>
      </div>
      <Table>
        <Thead>
          <tr><Th>Nombre</Th><Th>Teléfono</Th><Th>Email</Th><Th className="text-right">Acciones</Th></tr>
        </Thead>
        <Tbody>
          {padres.length === 0 ? (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No hay padres/tutores registrados</td></tr>
          ) : padres.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <Td><span className="font-medium">{p.apellido}, {p.nombre}</span></Td>
              <Td>{p.telefono}</Td>
              <Td>{p.email ?? <span className="text-gray-400">—</span>}</Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => abrirVincular(p)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded" title="Vincular con alumno"><Link size={15} /></button>
                  <button onClick={() => abrirEditar(p)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => handleEliminar(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                </div>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={editando ? 'Editar Padre/Tutor' : 'Nuevo Padre/Tutor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errores.general && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{errores.general}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} />
            <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} error={errores.apellido} />
          </div>
          <Input label="Teléfono *" name="telefono" value={form.telefono} onChange={handleChange} error={errores.telefono} placeholder="011-1234-5678" />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errores.email} placeholder="padre@email.com" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando || hayErrores}>{guardando ? 'Guardando...' : editando ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalVincular} onClose={() => setModalVincular(false)} title="Vincular con Alumno">
        <form onSubmit={handleVincular} className="space-y-4">
          {padreVincular && (
            <p className="text-sm text-gray-600">Padre/Tutor: <strong>{padreVincular.apellido}, {padreVincular.nombre}</strong></p>
          )}
          <Select label="Alumno" value={alumnoSeleccionado} onChange={(e) => setAlumnoSeleccionado(e.target.value)}>
            <option value="">Seleccionar alumno...</option>
            {alumnos.map((a) => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre} — DNI: {a.dni}</option>)}
          </Select>
          {mensajeVincular && (
            <p className={`text-sm ${mensajeVincular.includes('exitosamente') ? 'text-green-600' : 'text-red-600'}`}>{mensajeVincular}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalVincular(false)}>Cerrar</Button>
            <Button type="submit" disabled={guardando || !alumnoSeleccionado}>{guardando ? 'Vinculando...' : 'Vincular'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

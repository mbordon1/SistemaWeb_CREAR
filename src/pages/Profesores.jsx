import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getProfesores, createProfesor, updateProfesor, deleteProfesor } from '../services/profesores'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Spinner from '../components/ui/Spinner'

const FORM_INICIAL = { nombre: '', apellido: '', telefono: '', email: '' }

export default function Profesores() {
  const [profesores, setProfesores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try { setProfesores(await getProfesores()) } finally { setLoading(false) }
  }

  function abrirCrear() { setEditando(null); setForm(FORM_INICIAL); setErrores({}); setModalAbierto(true) }

  function abrirEditar(p) {
    setEditando(p)
    setForm({ nombre: p.nombre ?? '', apellido: p.apellido ?? '', telefono: p.telefono ?? '', email: p.email ?? '' })
    setErrores({}); setModalAbierto(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = {}
    if (!form.nombre.trim()) e2.nombre = 'Obligatorio'
    if (!form.apellido.trim()) e2.apellido = 'Obligatorio'
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true)
    try {
      const payload = { ...form, telefono: form.telefono || null, email: form.email || null }
      if (editando) { await updateProfesor(editando.id, payload) } else { await createProfesor(payload) }
      await cargar(); setModalAbierto(false)
    } catch (err) { setErrores({ general: err.message }) }
    finally { setGuardando(false) }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este profesor?')) return
    try { await deleteProfesor(id); await cargar() } catch (err) { alert(err.message) }
  }

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-5">
      <div className="flex justify-end"><Button onClick={abrirCrear}><Plus size={16} />Nuevo Profesor</Button></div>
      <Table>
        <Thead><tr><Th>Nombre</Th><Th>Teléfono</Th><Th>Email</Th><Th className="text-right">Acciones</Th></tr></Thead>
        <Tbody>
          {profesores.length === 0 ? (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No hay profesores registrados</td></tr>
          ) : profesores.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <Td><span className="font-medium">{p.apellido}, {p.nombre}</span></Td>
              <Td>{p.telefono ?? <span className="text-gray-400">—</span>}</Td>
              <Td>{p.email ?? <span className="text-gray-400">—</span>}</Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => abrirEditar(p)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => handleEliminar(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                </div>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={editando ? 'Editar Profesor' : 'Nuevo Profesor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errores.general && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{errores.general}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} />
            <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} error={errores.apellido} />
          </div>
          <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : editando ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getProfesores, createProfesor, updateProfesor, deleteProfesor } from '../services/profesores'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Spinner from '../components/ui/Spinner'

const FORM_INICIAL = {
  nombre: '', apellido: '', dni: '', telefono: '', email: '', fecha_nacimiento: ''
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

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
    try { setProfesores(await getProfesores()) }
    finally { setLoading(false) }
  }

  function abrirCrear() {
    setEditando(null); setForm(FORM_INICIAL); setErrores({}); setModalAbierto(true)
  }

  function abrirEditar(p) {
    setEditando(p)
    setForm({
      nombre: p.nombre ?? '', apellido: p.apellido ?? '', dni: p.dni ?? '',
      telefono: p.telefono ?? '', email: p.email ?? '', fecha_nacimiento: p.fecha_nacimiento ?? ''
    })
    setErrores({}); setModalAbierto(true)
  }

  function validar(f) {
    const e = {}
    if (!f.nombre.trim()) e.nombre = 'Obligatorio'
    if (!f.apellido.trim()) e.apellido = 'Obligatorio'
    if (!f.dni.trim()) e.dni = 'Obligatorio'
    else if (!/^\d{7,8}$/.test(f.dni.trim())) e.dni = 'DNI inválido (7-8 dígitos)'
    if (!f.telefono.trim()) e.telefono = 'Obligatorio'
    else if (!/^[0-9+\-\s()]{6,20}$/.test(f.telefono)) e.telefono = 'Teléfono inválido'
    if (!f.email.trim()) e.email = 'Obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Email inválido'
    if (!f.fecha_nacimiento) e.fecha_nacimiento = 'Obligatorio'
    else {
      const hoy = new Date().toISOString().split('T')[0]
      if (f.fecha_nacimiento > hoy) e.fecha_nacimiento = 'Fecha inválida'
    }
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
        dni: form.dni.trim(),
        telefono: form.telefono.trim(),
        email: form.email.toLowerCase().trim(),
        fecha_nacimiento: form.fecha_nacimiento,
      }
      if (editando) { await updateProfesor(editando.id, payload) }
      else { await createProfesor(payload) }
      await cargar(); setModalAbierto(false)
    } catch (err) {
      setErrores({ general: 'No se pudo guardar el profesor' })
    } finally { setGuardando(false) }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este profesor?')) return
    try { await deleteProfesor(id); await cargar() }
    catch (err) { alert(err.message) }
  }

  if (loading) return <Spinner className="mt-20" />

  const hayErrores = Object.entries(errores).some(([k, v]) => k !== 'general' && v)

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={abrirCrear}><Plus size={16} />Nuevo Profesor</Button>
      </div>
      <Table>
        <Thead>
          <tr>
            <Th>Nombre</Th><Th>DNI</Th><Th>Teléfono</Th><Th>Email</Th><Th>Fecha Nac.</Th><Th className="text-right">Acciones</Th>
          </tr>
        </Thead>
        <Tbody>
          {profesores.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No hay profesores registrados</td></tr>
          ) : profesores.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <Td><span className="font-medium">{p.apellido}, {p.nombre}</span></Td>
              <Td>{p.dni}</Td>
              <Td>{p.telefono}</Td>
              <Td>{p.email}</Td>
              <Td>{formatearFecha(p.fecha_nacimiento)}</Td>
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
          {errores.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{errores.general}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} />
            <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} error={errores.apellido} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="DNI *" name="dni" value={form.dni} onChange={handleChange} error={errores.dni} />
            <Input label="Teléfono *" name="telefono" value={form.telefono} onChange={handleChange} error={errores.telefono} />
          </div>
          <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} error={errores.email} />
          <Input label="Fecha de nacimiento *" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} error={errores.fecha_nacimiento} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando || hayErrores}>
              {guardando ? 'Guardando...' : editando ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

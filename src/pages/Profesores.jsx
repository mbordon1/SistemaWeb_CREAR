import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getProfesores, createProfesor, updateProfesor, deleteProfesor } from '../services/profesores'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Spinner from '../components/ui/Spinner'

const FORM_INICIAL = { 
  nombre: '', 
  apellido: '', 
  telefono: '', 
  email: '',
  dni: '',
  fecha_nacimiento: ''
}

// 👉 Helper para formatear fecha SIN errores de zona horaria
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
    try { 
      setProfesores(await getProfesores()) 
    } finally { 
      setLoading(false) 
    }
  }

  function abrirCrear() { 
    setEditando(null) 
    setForm(FORM_INICIAL) 
    setErrores({}) 
    setModalAbierto(true) 
  }

  function abrirEditar(p) {
    setEditando(p)
    setForm({ 
      nombre: p.nombre ?? '', 
      apellido: p.apellido ?? '', 
      telefono: p.telefono ?? '', 
      email: p.email ?? '',
      dni: p.dni ?? '',
      fecha_nacimiento: p.fecha_nacimiento ?? ''
    })
    setErrores({})
    setModalAbierto(true)
  }

  function validar(form) {
    const errores = {}

    if (!form.nombre.trim()) errores.nombre = 'Obligatorio'
    if (!form.apellido.trim()) errores.apellido = 'Obligatorio'

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errores.email = 'Email inválido'
    }

    if (form.telefono && !/^[0-9+\-\s()]{6,20}$/.test(form.telefono)) {
      errores.telefono = 'Teléfono inválido'
    }

    if (form.dni && !/^\d{7,8}$/.test(form.dni)) {
      errores.dni = 'DNI inválido'
    }

    if (form.fecha_nacimiento) {
      const hoy = new Date().toISOString().split('T')[0]
      if (form.fecha_nacimiento > hoy) {
        errores.fecha_nacimiento = 'Fecha inválida'
      }
    }

    return errores
  }

  function handleChange(e) {
    const { name, value } = e.target
    const nuevoForm = { ...form, [name]: value }
    setForm(nuevoForm)
    setErrores(validar(nuevoForm))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const erroresValidados = validar(form)
    if (Object.keys(erroresValidados).length > 0) {
      setErrores(erroresValidados)
      return
    }

    setGuardando(true)

    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono || null,
        email: form.email?.toLowerCase().trim() || null,
        dni: form.dni || null,
        fecha_nacimiento: form.fecha_nacimiento || null
      }

      if (editando) {
        await updateProfesor(editando.id, payload)
      } else {
        await createProfesor(payload)
      }

      await cargar()
      setModalAbierto(false)

    } catch (err) {
      console.error(err)
      setErrores({ general: 'No se pudo guardar el profesor' })
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este profesor?')) return
    try { 
      await deleteProfesor(id) 
      await cargar() 
    } catch (err) { 
      alert(err.message) 
    }
  }

  if (loading) return <Spinner className="mt-20" />

  const hayErrores = Object.keys(errores).length > 0

  return (
    <div className="space-y-5">

      <div className="flex justify-end">
        <Button onClick={abrirCrear}>
          <Plus size={16} />Nuevo Profesor
        </Button>
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Nombre</Th>
            <Th>DNI</Th>
            <Th>Teléfono</Th>
            <Th>Email</Th>
            <Th>Fecha Nac.</Th>
            <Th className="text-right">Acciones</Th>
          </tr>
        </Thead>

        <Tbody>
          {profesores.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                No hay profesores registrados
              </td>
            </tr>
          ) : profesores.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">

              <Td>{p.apellido}, {p.nombre}</Td>
              <Td>{p.dni ?? <span className="text-gray-400">—</span>}</Td>
              <Td>{p.telefono ?? <span className="text-gray-400">—</span>}</Td>
              <Td>{p.email ?? <span className="text-gray-400">—</span>}</Td>

              <Td>{formatearFecha(p.fecha_nacimiento)}</Td>

              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => abrirEditar(p)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleEliminar(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={15} />
                  </button>
                </div>
              </Td>

            </tr>
          ))}
        </Tbody>
      </Table>

      <Modal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        title={editando ? 'Editar Profesor' : 'Nuevo Profesor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {errores.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {errores.general}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} />
            <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} error={errores.apellido} />
          </div>

          <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} error={errores.telefono} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errores.email} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="DNI" name="dni" value={form.dni} onChange={handleChange} error={errores.dni} />
            <Input label="Fecha de nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} error={errores.fecha_nacimiento} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>

            <Button type="submit" disabled={guardando || hayErrores}>
              {guardando ? 'Guardando...' : editando ? 'Guardar' : 'Crear'}
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  )
}

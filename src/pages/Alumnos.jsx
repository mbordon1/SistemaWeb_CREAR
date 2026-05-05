import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { getAlumnos, createAlumno, updateAlumno, deleteAlumno } from '../services/alumnos'
import { getGrupos } from '../services/grupos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const FORM_INICIAL = {
  nombre: '', apellido: '', dni: '', telefono: '', email: '',
  fecha_nacimiento: '', fecha_alta: new Date().toISOString().split('T')[0],
  domicilio: '', grupo_id: '',
}

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [alumnoEditando, setAlumnoEditando] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const [dataAlumnos, dataGrupos] = await Promise.all([getAlumnos(), getGrupos()])
      setAlumnos(dataAlumnos)
      setGrupos(dataGrupos)
    } catch (err) {
      setError('Error al cargar los datos.')
    } finally {
      setLoading(false)
    }
  }

  function abrirCrear() {
    setAlumnoEditando(null); setForm(FORM_INICIAL); setErrores({}); setModalAbierto(true)
  }

  function abrirEditar(alumno) {
    setAlumnoEditando(alumno)
    setForm({
      nombre: alumno.nombre ?? '', apellido: alumno.apellido ?? '', dni: alumno.dni ?? '',
      telefono: alumno.telefono ?? '', email: alumno.email ?? '',
      fecha_nacimiento: alumno.fecha_nacimiento ?? '', fecha_alta: alumno.fecha_alta ?? '',
      domicilio: alumno.domicilio ?? '', grupo_id: alumno.grupo_id ?? '',
    })
    setErrores({}); setModalAbierto(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
    if (!form.dni.trim()) e.dni = 'El DNI es obligatorio'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true)
    try {
      const payload = {
        ...form,
        grupo_id: form.grupo_id || null, telefono: form.telefono || null,
        email: form.email || null, domicilio: form.domicilio || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
      }
      if (alumnoEditando) { await updateAlumno(alumnoEditando.id, payload) }
      else { await createAlumno(payload) }
      await cargarDatos()
      setModalAbierto(false)
    } catch (err) {
      setErrores({ general: err.message ?? 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Estás seguro de eliminar este alumno?')) return
    try { await deleteAlumno(id); await cargarDatos() }
    catch (err) { alert('No se pudo eliminar: ' + err.message) }
  }

  const alumnosFiltrados = alumnos.filter((a) => {
    const texto = busqueda.toLowerCase()
    return a.nombre?.toLowerCase().includes(texto) || a.apellido?.toLowerCase().includes(texto) || a.dni?.toLowerCase().includes(texto)
  })

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre o DNI..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <Button onClick={abrirCrear}><Plus size={16} />Nuevo Alumno</Button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">{alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''}</p>
        </div>
        <Table>
          <Thead><tr><Th>Nombre</Th><Th>DNI</Th><Th>Teléfono</Th><Th>Email</Th><Th>Grupo</Th><Th className="text-right">Acciones</Th></tr></Thead>
          <Tbody>
            {alumnosFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No se encontraron alumnos</td></tr>
            ) : alumnosFiltrados.map((alumno) => (
              <tr key={alumno.id} className="hover:bg-gray-50 transition-colors">
                <Td>
                  <p className="font-medium text-gray-900">{alumno.apellido}, {alumno.nombre}</p>
                  {alumno.fecha_nacimiento && <p className="text-xs text-gray-400">Nac: {new Date(alumno.fecha_nacimiento).toLocaleDateString('es-AR')}</p>}
                </Td>
                <Td>{alumno.dni}</Td>
                <Td>{alumno.telefono ?? <span className="text-gray-400">—</span>}</Td>
                <Td>{alumno.email ?? <span className="text-gray-400">—</span>}</Td>
                <Td>{alumno.grupos ? <Badge color="indigo">{alumno.grupos.nombre}</Badge> : <Badge color="gray">Sin grupo</Badge>}</Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => abrirEditar(alumno)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Pencil size={15} /></button>
                    <button onClick={() => handleEliminar(alumno.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </div>
      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={alumnoEditando ? 'Editar Alumno' : 'Nuevo Alumno'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errores.general && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{errores.general}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} placeholder="Juan" />
            <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} error={errores.apellido} placeholder="García" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="DNI *" name="dni" value={form.dni} onChange={handleChange} error={errores.dni} placeholder="12345678" />
            <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="011-1234-5678" />
          </div>
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="alumno@email.com" />
          <Input label="Domicilio" name="domicilio" value={form.domicilio} onChange={handleChange} placeholder="Calle 123, Ciudad" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha de nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} />
            <Input label="Fecha de alta" name="fecha_alta" type="date" value={form.fecha_alta} onChange={handleChange} />
          </div>
          <Select label="Grupo asignado" name="grupo_id" value={form.grupo_id} onChange={handleChange}>
            <option value="">Sin grupo asignado</option>
            {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre} — {g.nivel}</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : alumnoEditando ? 'Guardar cambios' : 'Crear alumno'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Search } from 'lucide-react'
import { getAlumnos, updateAlumno, deleteAlumno } from '../services/alumnos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const FORM_INICIAL = {
  nombre: '', apellido: '', dni: '', telefono: '', email: '',
  fecha_nacimiento: '', domicilio: '',
}

const ESTADO_COLOR = { activa: 'green', baja: 'red', espera: 'yellow' }

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([])
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
    try { setAlumnos(await getAlumnos()) }
    catch { setError('Error al cargar los datos.') }
    finally { setLoading(false) }
  }

  function abrirEditar(alumno) {
    setAlumnoEditando(alumno)
    setForm({
      nombre: alumno.nombre ?? '', apellido: alumno.apellido ?? '', dni: alumno.dni ?? '',
      telefono: alumno.telefono ?? '', email: alumno.email ?? '',
      fecha_nacimiento: alumno.fecha_nacimiento ?? '', domicilio: alumno.domicilio ?? '',
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
    if (!form.nombre.trim()) e.nombre = 'Obligatorio'
    if (!form.apellido.trim()) e.apellido = 'Obligatorio'
    if (!form.dni.trim()) e.dni = 'Obligatorio'
    if (!form.telefono.trim()) e.telefono = 'Obligatorio'
    if (!form.email.trim()) e.email = 'Obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.domicilio.trim()) e.domicilio = 'Obligatorio'
    if (!form.fecha_nacimiento) e.fecha_nacimiento = 'Obligatorio'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true)
    try {
      await updateAlumno(alumnoEditando.id, {
        nombre: form.nombre.trim(), apellido: form.apellido.trim(), dni: form.dni.trim(),
        telefono: form.telefono.trim(), email: form.email.trim(),
        domicilio: form.domicilio.trim(), fecha_nacimiento: form.fecha_nacimiento,
      })
      await cargarDatos(); setModalAbierto(false)
    } catch (err) {
      setErrores({ general: err.message ?? 'Error al guardar.' })
    } finally { setGuardando(false) }
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
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/60" />
          <input type="text" placeholder="Buscar por nombre o DNI..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-purple-800/40 rounded-lg text-sm text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-colors" />
        </div>
        <p className="text-xs text-purple-400/50">Los alumnos se dan de alta desde Inscripciones</p>
      </div>

      <div className="bg-[#1a1547]/80 rounded-xl border border-purple-800/30">
        <div className="px-5 py-3 border-b border-purple-800/20">
          <p className="text-sm text-purple-400/60">{alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''}</p>
        </div>
        <Table>
          <Thead><tr><Th>Nombre</Th><Th>DNI</Th><Th>Teléfono</Th><Th>Email</Th><Th>Grupos</Th><Th className="text-right">Acciones</Th></tr></Thead>
          <Tbody>
            {alumnosFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-purple-400/50">No se encontraron alumnos</td></tr>
            ) : alumnosFiltrados.map((alumno) => {
              const gruposActivos = (alumno.inscripciones ?? []).filter((i) => i.estado === 'activa')
              return (
                <tr key={alumno.id} className="hover:bg-white/3 transition-colors">
                  <Td>
                    <p className="font-medium text-white">{alumno.apellido}, {alumno.nombre}</p>
                    {alumno.fecha_nacimiento && <p className="text-xs text-purple-400/60">Nac: {new Date(alumno.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-AR')}</p>}
                  </Td>
                  <Td>{alumno.dni}</Td>
                  <Td>{alumno.telefono}</Td>
                  <Td>{alumno.email}</Td>
                  <Td>
                    {gruposActivos.length === 0
                      ? <Badge color="gray">Sin grupo</Badge>
                      : <div className="flex flex-wrap gap-1">
                          {gruposActivos.map((i) => <Badge key={i.id} color="blue">{i.grupos?.nombre}</Badge>)}
                        </div>
                    }
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => abrirEditar(alumno)} className="p-1.5 text-purple-400 hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleEliminar(alumno.id)} className="p-1.5 text-purple-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </Tbody>
        </Table>
      </div>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Editar Alumno" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errores.general && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded text-sm">{errores.general}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} placeholder="Juan" />
            <Input label="Apellido *" name="apellido" value={form.apellido} onChange={handleChange} error={errores.apellido} placeholder="García" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="DNI *" name="dni" value={form.dni} onChange={handleChange} error={errores.dni} placeholder="12345678" />
            <Input label="Teléfono *" name="telefono" value={form.telefono} onChange={handleChange} error={errores.telefono} placeholder="011-1234-5678" />
          </div>
          <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} error={errores.email} placeholder="alumno@email.com" />
          <Input label="Domicilio *" name="domicilio" value={form.domicilio} onChange={handleChange} error={errores.domicilio} placeholder="Calle 123, Ciudad" />
          <Input label="Fecha de nacimiento *" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} error={errores.fecha_nacimiento} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

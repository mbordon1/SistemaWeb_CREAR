import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { getInscripciones, createInscripcion, createInscripcionConAlumno, updateInscripcion } from '../services/inscripciones'
import { getAlumnos } from '../services/alumnos'
import { getGrupos } from '../services/grupos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const ESTADO_COLOR = { activa: 'green', baja: 'red', espera: 'yellow' }

const FORM_NUEVO = {
  nombre: '', apellido: '', dni: '', telefono: '', email: '',
  fecha_nacimiento: '', domicilio: '',
}

export default function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoNuevoAlumno, setModoNuevoAlumno] = useState(true)
  const [form, setForm] = useState(FORM_NUEVO)
  const [alumnoId, setAlumnoId] = useState('')
  const [gruposSeleccionados, setGruposSeleccionados] = useState([])
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try {
      const [i, a, g] = await Promise.all([
        getInscripciones().catch(() => []),
        getAlumnos().catch(() => []),
        getGrupos().catch(() => []),
      ])
      setInscripciones(i); setAlumnos(a); setGrupos(g)
    } finally { setLoading(false) }
  }

  function abrirModal() {
    setModalAbierto(true)
    setModoNuevoAlumno(true)
    setForm(FORM_NUEVO)
    setAlumnoId('')
    setGruposSeleccionados([])
    setErrores({})
    setMensajeError('')
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errores[name]) setErrores((p) => ({ ...p, [name]: '' }))
  }

  function toggleGrupo(id) {
    setGruposSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
    if (errores.grupos) setErrores((p) => ({ ...p, grupos: '' }))
  }

  function validar() {
    const e = {}
    if (modoNuevoAlumno) {
      if (!form.nombre.trim()) e.nombre = 'Obligatorio'
      if (!form.apellido.trim()) e.apellido = 'Obligatorio'
      if (!form.dni.trim()) e.dni = 'Obligatorio'
      if (!form.telefono.trim()) e.telefono = 'Obligatorio'
      if (!form.email.trim()) e.email = 'Obligatorio'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
      if (!form.domicilio.trim()) e.domicilio = 'Obligatorio'
      if (!form.fecha_nacimiento) e.fecha_nacimiento = 'Obligatorio'
    } else {
      if (!alumnoId) e.alumno_id = 'Seleccioná un alumno'
    }
    if (gruposSeleccionados.length === 0) e.grupos = 'Seleccioná al menos un grupo'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true); setMensajeError('')
    try {
      if (modoNuevoAlumno) {
        await createInscripcionConAlumno({
          alumnoData: {
            nombre: form.nombre.trim(), apellido: form.apellido.trim(), dni: form.dni.trim(),
            telefono: form.telefono.trim(), email: form.email.trim(),
            domicilio: form.domicilio.trim(), fecha_nacimiento: form.fecha_nacimiento,
          },
          grupo_ids: gruposSeleccionados,
        })
      } else {
        for (const grupo_id of gruposSeleccionados) {
          await createInscripcion({ alumno_id: alumnoId, grupo_id })
        }
      }
      await cargar(); setModalAbierto(false)
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
        <Button onClick={abrirModal}><Plus size={16} />Nueva Inscripción</Button>
      </div>

      <Table>
        <Thead><tr><Th>Alumno</Th><Th>Grupo</Th><Th>Nivel</Th><Th>Fecha</Th><Th>Estado</Th><Th>Cambiar estado</Th></tr></Thead>
        <Tbody>
          {inscripciones.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No hay inscripciones</td></tr>
          ) : inscripciones.map((i) => (
            <tr key={i.id} className="hover:bg-gray-50/70 transition-colors">
              <Td>
                <span className="font-medium text-gray-800">{i.alumnos?.apellido}, {i.alumnos?.nombre}</span>
                <p className="text-xs text-gray-400">DNI: {i.alumnos?.dni}</p>
              </Td>
              <Td>{i.grupos?.nombre}</Td>
              <Td>{i.grupos?.nivel}</Td>
              <Td>{i.fecha ? new Date(i.fecha).toLocaleDateString('es-AR') : '—'}</Td>
              <Td><Badge color={ESTADO_COLOR[i.estado] ?? 'gray'}>{i.estado}</Badge></Td>
              <Td>
                <select value={i.estado} onChange={(e) => cambiarEstado(i.id, e.target.value)}
                  className="text-xs bg-white border border-gray-200 text-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="activa">Activa</option>
                  <option value="baja">Baja</option>
                  <option value="espera">Lista de espera</option>
                </select>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Nueva Inscripción" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mensajeError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm">{mensajeError}</div>
          )}

          {/* Toggle nuevo / existente */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-1 gap-1">
            <button type="button"
              onClick={() => { setModoNuevoAlumno(true); setErrores({}) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${modoNuevoAlumno ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              Nuevo alumno
            </button>
            <button type="button"
              onClick={() => { setModoNuevoAlumno(false); setErrores({}) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!modoNuevoAlumno ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              Alumno existente
            </button>
          </div>

          {modoNuevoAlumno ? (
            <>
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
            </>
          ) : (
            <Select label="Alumno *" name="alumno_id" value={alumnoId}
              onChange={(e) => { setAlumnoId(e.target.value); if (errores.alumno_id) setErrores((p) => ({ ...p, alumno_id: '' })) }}
              error={errores.alumno_id}>
              <option value="">Seleccionar alumno...</option>
              {alumnos.map((a) => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre} — DNI: {a.dni}</option>)}
            </Select>
          )}

          {/* Selección múltiple de grupos */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Grupos * <span className="normal-case text-gray-400 font-normal">(podés seleccionar varios)</span>
            </p>
            {grupos.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center bg-gray-50 rounded-xl border border-gray-200">No hay grupos disponibles</p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {grupos.map((g) => {
                  const seleccionado = gruposSeleccionados.includes(g.id)
                  return (
                    <label key={g.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${seleccionado ? 'border-primary bg-primary-light' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={seleccionado} onChange={() => toggleGrupo(g.id)}
                        className="accent-primary w-4 h-4 shrink-0" />
                      <span className={`text-sm font-medium ${seleccionado ? 'text-primary' : 'text-gray-700'}`}>{g.nombre}</span>
                      <span className="text-xs text-gray-400 ml-auto">{g.nivel} · cap. {g.capacidad_maxima}</span>
                    </label>
                  )
                })}
              </div>
            )}
            {errores.grupos && <p className="text-red-500 text-xs mt-1">{errores.grupos}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Inscribiendo...' : gruposSeleccionados.length > 1 ? `Inscribir en ${gruposSeleccionados.length} grupos` : 'Inscribir'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

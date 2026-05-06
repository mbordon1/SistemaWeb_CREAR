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

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Nueva Inscripción" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mensajeError && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2 rounded text-sm">{mensajeError}</div>
          )}

          {/* Toggle nuevo / existente */}
          <div className="flex rounded-lg overflow-hidden border border-purple-800/40">
            <button type="button"
              onClick={() => { setModoNuevoAlumno(true); setErrores({}) }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${modoNuevoAlumno ? 'bg-violet-600 text-white' : 'bg-white/5 text-purple-400 hover:bg-white/10'}`}>
              Nuevo alumno
            </button>
            <button type="button"
              onClick={() => { setModoNuevoAlumno(false); setErrores({}) }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${!modoNuevoAlumno ? 'bg-violet-600 text-white' : 'bg-white/5 text-purple-400 hover:bg-white/10'}`}>
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
            <p className="text-xs font-medium text-purple-300/80 uppercase tracking-wide mb-2">
              Grupos * <span className="normal-case text-purple-400/50 font-normal">(podés seleccionar varios)</span>
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {grupos.map((g) => {
                const seleccionado = gruposSeleccionados.includes(g.id)
                return (
                  <label key={g.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${seleccionado ? 'border-violet-500/60 bg-violet-500/10' : 'border-purple-800/40 bg-white/3 hover:bg-white/5'}`}>
                    <input type="checkbox" checked={seleccionado} onChange={() => toggleGrupo(g.id)}
                      className="accent-violet-500 w-4 h-4 shrink-0" />
                    <span className="text-sm text-white">{g.nombre}</span>
                    <span className="text-xs text-purple-400/60 ml-auto">{g.nivel} · cap. {g.capacidad_maxima}</span>
                  </label>
                )
              })}
            </div>
            {errores.grupos && <p className="text-red-400 text-xs mt-1">{errores.grupos}</p>}
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

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getSueldos, createSueldo, updateSueldo, deleteSueldo } from '../services/sueldos'
import { getProfesores } from '../services/profesores'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Spinner from '../components/ui/Spinner'

const FORM_INICIAL = { profesor_id: '', periodo: '', monto: '', clases_dictadas: '' }
const inputBase = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'

export default function Sueldos() {
  const [sueldos, setSueldos] = useState([])
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
    try { const [s, p] = await Promise.all([getSueldos(), getProfesores()]); setSueldos(s); setProfesores(p) }
    finally { setLoading(false) }
  }

  function abrirCrear() { setEditando(null); setForm(FORM_INICIAL); setErrores({}); setModalAbierto(true) }

  function abrirEditar(s) {
    setEditando(s)
    setForm({ profesor_id: s.profesor_id, periodo: s.periodo, monto: String(s.monto), clases_dictadas: String(s.clases_dictadas) })
    setErrores({}); setModalAbierto(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errores[name]) setErrores((p) => ({ ...p, [name]: '' }))
  }

  function validar() {
    const e = {}
    if (!form.profesor_id) e.profesor_id = 'Seleccioná un profesor'
    if (!form.periodo.trim()) e.periodo = 'Obligatorio'
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresá un monto válido'
    if (!form.clases_dictadas || parseInt(form.clases_dictadas) < 0) e.clases_dictadas = 'Ingresá un valor válido'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length > 0) { setErrores(e2); return }
    setGuardando(true)
    try {
      const payload = { profesor_id: form.profesor_id, periodo: form.periodo.trim(),
        monto: Number(form.monto), clases_dictadas: parseInt(form.clases_dictadas, 10) }
      if (editando) { await updateSueldo(editando.id, payload) } else { await createSueldo(payload) }
      await cargar(); setModalAbierto(false)
    } catch (err) { setErrores({ general: err.message }) }
    finally { setGuardando(false) }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este registro de sueldo?')) return
    try { await deleteSueldo(id); await cargar() } catch (err) { alert(err.message) }
  }

  if (loading) return <Spinner className="mt-20" />
  const total = sueldos.reduce((sum, s) => sum + Number(s.monto), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-xl border border-gray-200 shadow-card px-5 py-3">
          <p className="text-xs text-gray-400">Total pagado (todos los períodos)</p>
          <p className="text-2xl font-bold text-gray-800">${total.toLocaleString('es-AR')}</p>
        </div>
        <Button onClick={abrirCrear}><Plus size={16} />Registrar Sueldo</Button>
      </div>
      <Table>
        <Thead>
          <tr><Th>Profesor</Th><Th>Período</Th><Th>Clases dictadas</Th><Th>Monto</Th><Th className="text-right">Acciones</Th></tr>
        </Thead>
        <Tbody>
          {sueldos.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">No hay sueldos registrados</td></tr>
          ) : sueldos.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
              <Td><span className="font-medium text-gray-800">{s.profesores?.apellido}, {s.profesores?.nombre}</span></Td>
              <Td>{s.periodo}</Td>
              <Td>{s.clases_dictadas} clases</Td>
              <Td className="font-semibold">${Number(s.monto).toLocaleString('es-AR')}</Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => abrirEditar(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleEliminar(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={editando ? 'Editar Sueldo' : 'Registrar Sueldo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errores.general && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{errores.general}</div>}
          <Select label="Profesor *" name="profesor_id" value={form.profesor_id} onChange={handleChange} error={errores.profesor_id}>
            <option value="">Seleccionar...</option>
            {profesores.map((p) => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
          </Select>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Período *</label>
            <input type="month" name="periodo" value={form.periodo} onChange={handleChange}
              className={`${inputBase} ${errores.periodo ? 'border-red-300' : ''}`} />
            {errores.periodo && <p className="text-xs text-red-500">{errores.periodo}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Monto *" name="monto" type="number" min="0" step="0.01" value={form.monto} onChange={handleChange} error={errores.monto} placeholder="0.00" />
            <Input label="Clases dictadas *" name="clases_dictadas" type="number" min="0" value={form.clases_dictadas} onChange={handleChange} error={errores.clases_dictadas} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : editando ? 'Guardar' : 'Registrar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

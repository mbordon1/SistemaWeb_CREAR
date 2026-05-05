import { useEffect, useState } from 'react'
import { Plus, CreditCard } from 'lucide-react'
import { getCuotasPendientes, generarCuotas, registrarPago } from '../services/pagos'
import { getAlumnos } from '../services/alumnos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const ESTADO_COLOR = { pendiente: 'yellow', pagada: 'green', vencida: 'red' }

export default function Pagos() {
  const [cuotas, setCuotas] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCuota, setModalCuota] = useState(false)
  const [modalPago, setModalPago] = useState(false)
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null)
  const [formCuota, setFormCuota] = useState({ alumno_id: '', mes: '', monto: '', fecha_vencimiento: '' })
  const [formPago, setFormPago] = useState({ monto_pagado: '', metodo: 'efectivo', fecha_pago: new Date().toISOString().split('T')[0] })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try { const [c, a] = await Promise.all([getCuotasPendientes(), getAlumnos()]); setCuotas(c); setAlumnos(a) }
    finally { setLoading(false) }
  }

  async function handleCrearCuota(e) {
    e.preventDefault()
    if (!formCuota.alumno_id || !formCuota.mes || !formCuota.monto) { alert('Completá los campos obligatorios'); return }
    setGuardando(true)
    try {
      await generarCuotas(formCuota.alumno_id, formCuota.mes, Number(formCuota.monto), formCuota.fecha_vencimiento || null)
      await cargar(); setModalCuota(false); setFormCuota({ alumno_id: '', mes: '', monto: '', fecha_vencimiento: '' })
    } catch (err) { alert(err.message) } finally { setGuardando(false) }
  }

  async function handleRegistrarPago(e) {
    e.preventDefault()
    if (!formPago.monto_pagado) { alert('Ingresá el monto pagado'); return }
    setGuardando(true)
    try {
      await registrarPago(cuotaSeleccionada.id, { monto_pagado: Number(formPago.monto_pagado), metodo: formPago.metodo, fecha_pago: formPago.fecha_pago })
      await cargar(); setModalPago(false); setCuotaSeleccionada(null)
    } catch (err) { alert(err.message) } finally { setGuardando(false) }
  }

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-5">
      <div className="flex justify-end"><Button onClick={() => setModalCuota(true)}><Plus size={16} />Generar Cuota</Button></div>
      <Table>
        <Thead><tr><Th>Alumno</Th><Th>Mes</Th><Th>Monto</Th><Th>Vencimiento</Th><Th>Estado</Th><Th>Acciones</Th></tr></Thead>
        <Tbody>
          {cuotas.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No hay cuotas pendientes</td></tr>
          ) : cuotas.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <Td><span className="font-medium">{c.alumnos?.apellido}, {c.alumnos?.nombre}</span></Td>
              <Td>{c.mes}</Td>
              <Td className="font-semibold">${c.monto}</Td>
              <Td>{c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-AR') : '—'}</Td>
              <Td><Badge color={ESTADO_COLOR[c.estado] ?? 'gray'}>{c.estado}</Badge></Td>
              <Td>{c.estado !== 'pagada' && (
                <Button size="sm" variant="secondary" onClick={() => { setCuotaSeleccionada(c); setFormPago({ monto_pagado: c.monto, metodo: 'efectivo', fecha_pago: new Date().toISOString().split('T')[0] }); setModalPago(true) }}>
                  <CreditCard size={14} />Registrar pago
                </Button>
              )}</Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={modalCuota} onClose={() => setModalCuota(false)} title="Generar Cuota">
        <form onSubmit={handleCrearCuota} className="space-y-4">
          <Select label="Alumno *" value={formCuota.alumno_id} onChange={(e) => setFormCuota(p => ({ ...p, alumno_id: e.target.value }))}>
            <option value="">Seleccionar...</option>
            {alumnos.map((a) => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
          </Select>
          <Input label="Mes *" value={formCuota.mes} onChange={(e) => setFormCuota(p => ({ ...p, mes: e.target.value }))} placeholder="Ej: 2025-06" />
          <Input label="Monto *" type="number" min="0" value={formCuota.monto} onChange={(e) => setFormCuota(p => ({ ...p, monto: e.target.value }))} />
          <Input label="Fecha de vencimiento" type="date" value={formCuota.fecha_vencimiento} onChange={(e) => setFormCuota(p => ({ ...p, fecha_vencimiento: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalCuota(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Generando...' : 'Generar cuota'}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={modalPago} onClose={() => setModalPago(false)} title="Registrar Pago">
        <form onSubmit={handleRegistrarPago} className="space-y-4">
          {cuotaSeleccionada && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium">{cuotaSeleccionada.alumnos?.nombre} {cuotaSeleccionada.alumnos?.apellido}</p>
              <p className="text-gray-500">Cuota: {cuotaSeleccionada.mes} — ${cuotaSeleccionada.monto}</p>
            </div>
          )}
          <Input label="Monto pagado *" type="number" min="0" value={formPago.monto_pagado} onChange={(e) => setFormPago(p => ({ ...p, monto_pagado: e.target.value }))} />
          <Select label="Método de pago" value={formPago.metodo} onChange={(e) => setFormPago(p => ({ ...p, metodo: e.target.value }))}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otro">Otro</option>
          </Select>
          <Input label="Fecha de pago" type="date" value={formPago.fecha_pago} onChange={(e) => setFormPago(p => ({ ...p, fecha_pago: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalPago(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Confirmar pago'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

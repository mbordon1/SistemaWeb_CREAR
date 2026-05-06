import { useEffect, useState } from 'react'
import { Plus, CreditCard, FileText } from 'lucide-react'
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
  const [modalComprobante, setModalComprobante] = useState(false)
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null)
  const [comprobanteGenerado, setComprobanteGenerado] = useState(null)
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
      await cargar(); setModalCuota(false)
      setFormCuota({ alumno_id: '', mes: '', monto: '', fecha_vencimiento: '' })
    } catch (err) { alert(err.message) }
    finally { setGuardando(false) }
  }

  async function handleRegistrarPago(e) {
    e.preventDefault()
    if (!formPago.monto_pagado) { alert('Ingresá el monto pagado'); return }
    setGuardando(true)
    try {
      const resultado = await registrarPago(cuotaSeleccionada.id, {
        monto_pagado: Number(formPago.monto_pagado),
        metodo: formPago.metodo,
        fecha_pago: formPago.fecha_pago,
      })
      await cargar()
      setModalPago(false)
      setCuotaSeleccionada(null)
      if (resultado.comprobante) {
        setComprobanteGenerado(resultado.comprobante)
        setModalComprobante(true)
      }
    } catch (err) { alert(err.message) }
    finally { setGuardando(false) }
  }

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setModalCuota(true)}><Plus size={16} />Generar Cuota</Button>
      </div>
      <Table>
        <Thead><tr><Th>Alumno</Th><Th>Mes</Th><Th>Monto</Th><Th>Vencimiento</Th><Th>Estado</Th><Th>Acciones</Th></tr></Thead>
        <Tbody>
          {cuotas.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-purple-400/50">No hay cuotas pendientes</td></tr>
          ) : cuotas.map((c) => (
            <tr key={c.id} className="hover:bg-white/3 transition-colors">
              <Td><span className="font-medium text-white">{c.alumnos?.apellido}, {c.alumnos?.nombre}</span></Td>
              <Td>{c.mes}</Td>
              <Td className="font-semibold">${c.monto}</Td>
              <Td>{c.fecha_vencimiento ? new Date(c.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR') : '—'}</Td>
              <Td><Badge color={ESTADO_COLOR[c.estado] ?? 'gray'}>{c.estado}</Badge></Td>
              <Td>
                {c.estado !== 'pagada' && (
                  <Button size="sm" variant="secondary" onClick={() => {
                    setCuotaSeleccionada(c)
                    setFormPago({ monto_pagado: c.monto, metodo: 'efectivo', fecha_pago: new Date().toISOString().split('T')[0] })
                    setModalPago(true)
                  }}>
                    <CreditCard size={14} />Registrar pago
                  </Button>
                )}
              </Td>
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
          <div className="space-y-1">
            <label className="block text-xs font-medium text-purple-300/80 uppercase tracking-wide">Mes *</label>
            <input type="month" value={formCuota.mes}
              onChange={(e) => setFormCuota(p => ({ ...p, mes: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-purple-800/40 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-colors" />
          </div>
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
            <div className="bg-white/5 border border-purple-800/20 rounded-lg p-3 text-sm">
              <p className="font-medium text-white">{cuotaSeleccionada.alumnos?.nombre} {cuotaSeleccionada.alumnos?.apellido}</p>
              <p className="text-purple-400/60">Cuota: {cuotaSeleccionada.mes} — ${cuotaSeleccionada.monto}</p>
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

      <Modal isOpen={modalComprobante} onClose={() => setModalComprobante(false)} title="Comprobante generado">
        {comprobanteGenerado && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="bg-emerald-500/15 rounded-full p-4">
                <FileText size={32} className="text-emerald-400" />
              </div>
            </div>
            <div className="bg-white/5 border border-purple-800/20 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-400/60">Número de comprobante:</span>
                <span className="font-bold text-white text-base">{comprobanteGenerado.numero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400/60">Fecha:</span>
                <span className="text-purple-100">{new Date(comprobanteGenerado.fecha).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
            <p className="text-xs text-center text-purple-500/50">El pago fue registrado y el comprobante generado exitosamente.</p>
            <div className="flex justify-end">
              <Button onClick={() => setModalComprobante(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { CreditCard, FileText, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCuotasDelMes, generarCuotasDelMes, marcarCuotasVencidas } from '../services/cuotas'
import { registrarPago } from '../services/pagos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Table, Thead, Th, Tbody, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const ESTADO_COLOR = { pendiente: 'yellow', pagada: 'green', vencida: 'red' }

function mesLabel(mes) {
  const [y, m] = mes.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

function mesOffset(mes, delta) {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function Pagos() {
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7))
  const [cuotas, setCuotas] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [modalPago, setModalPago] = useState(false)
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null)
  const [formPago, setFormPago] = useState({ monto_pagado: '', metodo: 'efectivo', fecha_pago: '' })
  const [guardando, setGuardando] = useState(false)
  const [modalComprobante, setModalComprobante] = useState(false)
  const [comprobante, setComprobante] = useState(null)

  useEffect(() => {
    // Actualizar estados de cuotas vencidas al montar el módulo
    marcarCuotasVencidas().catch(console.error)
  }, [])

  useEffect(() => {
    cargar()
  }, [mes])

  async function cargar() {
    setLoading(true)
    setResultado(null)
    try {
      setCuotas(await getCuotasDelMes(mes))
    } catch (err) {
      console.error('Error al cargar cuotas:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerar() {
    if (!confirm(`¿Generar cuotas para ${mesLabel(mes)}?\n\nSe crearán solo las cuotas que aún no existen.`)) return
    setGenerando(true)
    try {
      const res = await generarCuotasDelMes(mes)
      setResultado(res)
      await cargar()
    } catch (err) {
      alert('Error al generar cuotas: ' + err.message)
    } finally {
      setGenerando(false)
    }
  }

  function abrirPago(cuota) {
    setCuotaSeleccionada(cuota)
    setFormPago({
      monto_pagado: String(cuota.monto),
      metodo: 'efectivo',
      fecha_pago: new Date().toISOString().split('T')[0],
    })
    setModalPago(true)
  }

  async function handleRegistrarPago(e) {
    e.preventDefault()
    if (!formPago.monto_pagado || Number(formPago.monto_pagado) <= 0) {
      alert('Ingresá un monto válido')
      return
    }
    setGuardando(true)
    try {
      const res = await registrarPago(cuotaSeleccionada.id, {
        monto_pagado: Number(formPago.monto_pagado),
        metodo: formPago.metodo,
        fecha_pago: formPago.fecha_pago,
      })
      setModalPago(false)
      setCuotaSeleccionada(null)
      await cargar()
      if (res.comprobante) {
        setComprobante(res.comprobante)
        setModalComprobante(true)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setGuardando(false)
    }
  }

  // Conteos por estado para las tabs
  const totales = cuotas.reduce(
    (acc, c) => { acc[c.estado] = (acc[c.estado] ?? 0) + 1; acc.todas++; return acc },
    { todas: 0, pendiente: 0, vencida: 0, pagada: 0 }
  )
  const montoRecaudado = cuotas.filter((c) => c.estado === 'pagada').reduce((s, c) => s + Number(c.monto), 0)
  const montoPendiente = cuotas.filter((c) => c.estado !== 'pagada').reduce((s, c) => s + Number(c.monto), 0)

  const TABS = [
    { key: 'todas', label: 'Todas' },
    { key: 'vencida', label: 'Vencidas' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'pagada', label: 'Pagadas' },
  ]

  const cuotasFiltradas = filtro === 'todas' ? cuotas : cuotas.filter((c) => c.estado === filtro)

  return (
    <div className="space-y-5">

      {/* Navegación de mes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMes(mesOffset(mes, -1))}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            onClick={() => setMes(mesOffset(mes, 1))}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <span className="text-sm font-medium text-gray-600 capitalize hidden sm:inline">{mesLabel(mes)}</span>
        </div>
        <Button onClick={handleGenerar} disabled={generando} variant="secondary">
          <RefreshCw size={15} className={generando ? 'animate-spin' : ''} />
          {generando ? 'Generando...' : 'Generar cuotas del mes'}
        </Button>
      </div>

      {/* Aviso resultado de generación */}
      {resultado && (
        <div className={`border rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${resultado.generadas > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>
            {resultado.generadas > 0
              ? `Se generaron ${resultado.generadas} cuota${resultado.generadas !== 1 ? 's' : ''} para ${mesLabel(mes)}.`
              : `No hay cuotas nuevas para generar en ${mesLabel(mes)}.`}
            {resultado.omitidas > 0 && ` (${resultado.omitidas} ya existentes, omitidas)`}
          </span>
        </div>
      )}

      {/* Tarjetas de resumen */}
      {cuotas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total cuotas', value: totales.todas, color: 'text-gray-800', bg: 'bg-white' },
            { label: 'Vencidas', value: totales.vencida, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Pendientes', value: totales.pendiente, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Pagadas', value: totales.pagada, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 px-4 py-3 shadow-card`}>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Panel principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">

        {/* Tabs de filtro */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFiltro(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                filtro === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {totales[tab.key] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  filtro === tab.key ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
                }`}>{totales[tab.key]}</span>
              )}
            </button>
          ))}

          {/* Resumen financiero al final de los tabs */}
          {cuotas.length > 0 && (
            <div className="ml-auto flex items-center gap-4 px-4 text-xs text-gray-400 shrink-0">
              <span>Recaudado: <strong className="text-emerald-600">${montoRecaudado.toLocaleString('es-AR')}</strong></span>
              <span>Pendiente: <strong className="text-amber-600">${montoPendiente.toLocaleString('es-AR')}</strong></span>
            </div>
          )}
        </div>

        {loading ? <Spinner className="py-12" /> : (
          <Table>
            <Thead>
              <tr>
                <Th>Alumno</Th>
                <Th>Monto</Th>
                <Th>Vencimiento</Th>
                <Th>Estado</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </Thead>
            <Tbody>
              {cuotasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                    {cuotas.length === 0
                      ? <>No hay cuotas para <strong className="capitalize">{mesLabel(mes)}</strong>. Hacé clic en <strong>"Generar cuotas del mes"</strong>.</>
                      : 'Sin cuotas con este estado'}
                  </td>
                </tr>
              ) : cuotasFiltradas.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                  <Td>
                    <span className="font-medium text-gray-800">
                      {c.alumnos?.apellido}, {c.alumnos?.nombre}
                    </span>
                  </Td>
                  <Td className="font-semibold text-gray-800">${Number(c.monto).toLocaleString('es-AR')}</Td>
                  <Td className="text-gray-500 tabular-nums">
                    {c.fecha_vencimiento
                      ? new Date(c.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')
                      : '—'}
                  </Td>
                  <Td><Badge color={ESTADO_COLOR[c.estado] ?? 'gray'}>{c.estado}</Badge></Td>
                  <Td className="text-right">
                    {c.estado !== 'pagada' && (
                      <Button size="sm" variant="secondary" onClick={() => abrirPago(c)}>
                        <CreditCard size={14} />Registrar pago
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Modal: Registrar Pago */}
      <Modal isOpen={modalPago} onClose={() => setModalPago(false)} title="Registrar Pago">
        <form onSubmit={handleRegistrarPago} className="space-y-4">
          {cuotaSeleccionada && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
              <p className="font-medium text-gray-800">
                {cuotaSeleccionada.alumnos?.apellido}, {cuotaSeleccionada.alumnos?.nombre}
              </p>
              <p className="text-gray-400 capitalize">
                Cuota {mesLabel(cuotaSeleccionada.mes)} — ${Number(cuotaSeleccionada.monto).toLocaleString('es-AR')}
              </p>
            </div>
          )}
          <Input
            label="Monto pagado *"
            type="number"
            min="0"
            step="0.01"
            value={formPago.monto_pagado}
            onChange={(e) => setFormPago((p) => ({ ...p, monto_pagado: e.target.value }))}
          />
          <Select
            label="Método de pago"
            value={formPago.metodo}
            onChange={(e) => setFormPago((p) => ({ ...p, metodo: e.target.value }))}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="otro">Otro</option>
          </Select>
          <Input
            label="Fecha de pago"
            type="date"
            value={formPago.fecha_pago}
            onChange={(e) => setFormPago((p) => ({ ...p, fecha_pago: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalPago(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Confirmar pago'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Comprobante */}
      <Modal isOpen={modalComprobante} onClose={() => setModalComprobante(false)} title="Pago registrado">
        {comprobante && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="bg-emerald-50 rounded-full p-4">
                <FileText size={32} className="text-emerald-500" />
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">N° de comprobante:</span>
                <span className="font-bold text-gray-800 text-base">{comprobante.numero}</span>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400">El pago fue registrado correctamente.</p>
            <div className="flex justify-end">
              <Button onClick={() => setModalComprobante(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

import { Printer } from 'lucide-react'
import Button from './ui/Button'

const METODO_LABEL = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  tarjeta: 'Tarjeta',
  mercadopago: 'MercadoPago',
  otro: 'Otro',
}

function mesLabel(mes) {
  const [y, m] = mes.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

function fechaLarga(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 14px; color: #111; background: #fff; padding: 40px; }
  .recibo { max-width: 680px; margin: 0 auto; border: 2px solid #1E1147; border-radius: 10px; overflow: hidden; }
  .rh { background: #1E1147; color: #fff; padding: 22px 32px; display: flex; justify-content: space-between; align-items: center; }
  .rh-left h1 { font-size: 22px; font-weight: 900; letter-spacing: 3px; }
  .rh-left p { font-size: 11px; opacity: .6; margin-top: 2px; }
  .rh-right { text-align: right; }
  .rh-right .tipo { font-size: 11px; opacity: .6; text-transform: uppercase; letter-spacing: 1px; }
  .rh-right .num { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
  .rb { padding: 4px 32px 0; }
  .rb-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid #f0f0f0; }
  .rb-row:last-child { border-bottom: none; }
  .rb-row .lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .5px; }
  .rb-row .val { font-weight: 600; color: #111; }
  .rm { margin: 12px 32px; background: #f5f5f5; border-radius: 8px; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e8e8e8; }
  .rm .lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .5px; }
  .rm .val { font-size: 28px; font-weight: 900; color: #1E1147; }
  .rf { display: flex; border-top: 1px solid #eee; margin-top: 8px; }
  .rf-firma { flex: 1; text-align: center; padding: 32px 16px 20px; }
  .rf-firma .linea { border-top: 1px solid #aaa; margin: 0 12px 8px; }
  .rf-firma .texto { font-size: 11px; color: #777; }
  .rf-sello { display: flex; align-items: center; justify-content: center; padding: 16px; }
  .sello { width: 72px; height: 72px; border-radius: 50%; background: #dcfce7; border: 2px solid #22c55e; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #166534; font-size: 12px; text-align: center; line-height: 1.3; }
`

/**
 * datos: { alumno: {nombre, apellido}, mes, monto, metodo, fecha_pago, numero_comprobante }
 */
export default function Recibo({ datos, onClose }) {
  function imprimir() {
    const html = document.getElementById('recibo-print-area').innerHTML
    const w = window.open('', '_blank', 'width=800,height=680')
    w.document.write(`<!DOCTYPE html><html lang="es"><head>
      <meta charset="utf-8">
      <title>Recibo N° ${String(datos.numero_comprobante).padStart(4, '0')} — Academia CREAR</title>
      <style>${PRINT_STYLES}</style>
    </head><body>${html}</body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 300)
  }

  const numero = String(datos.numero_comprobante).padStart(4, '0')

  return (
    <div className="space-y-4">

      {/* Vista previa del recibo */}
      <div id="recibo-print-area">
        <div className="recibo border-2 border-[#1E1147] rounded-xl overflow-hidden">

          {/* Encabezado */}
          <div className="rh bg-[#1E1147] text-white px-8 py-5 flex justify-between items-center">
            <div className="rh-left">
              <h2 className="text-xl font-black tracking-[3px]">CREAR</h2>
              <p className="text-[11px] text-white/60 mt-0.5">Academia de Danzas</p>
            </div>
            <div className="rh-right text-right">
              <p className="tipo text-[11px] text-white/60 uppercase tracking-wider">Recibo de Pago</p>
              <p className="num text-xl font-black tracking-widest">N° {numero}</p>
            </div>
          </div>

          {/* Filas de datos */}
          <div className="rb px-8 pt-1 divide-y divide-gray-100">
            <div className="rb-row flex justify-between items-center py-3">
              <span className="lbl text-[11px] text-gray-400 uppercase tracking-wide">Alumno/a</span>
              <span className="val font-semibold text-gray-800">{datos.alumno?.apellido}, {datos.alumno?.nombre}</span>
            </div>
            <div className="rb-row flex justify-between items-center py-3">
              <span className="lbl text-[11px] text-gray-400 uppercase tracking-wide">Concepto</span>
              <span className="val font-semibold text-gray-800 capitalize">Cuota {mesLabel(datos.mes)}</span>
            </div>
            <div className="rb-row flex justify-between items-center py-3">
              <span className="lbl text-[11px] text-gray-400 uppercase tracking-wide">Método de pago</span>
              <span className="val font-semibold text-gray-800">{METODO_LABEL[datos.metodo] ?? datos.metodo}</span>
            </div>
            <div className="rb-row flex justify-between items-center py-3">
              <span className="lbl text-[11px] text-gray-400 uppercase tracking-wide">Fecha de pago</span>
              <span className="val font-semibold text-gray-800">
                {datos.fecha_pago ? fechaLarga(datos.fecha_pago) : '—'}
              </span>
            </div>
          </div>

          {/* Monto */}
          <div className="rm mx-8 my-4 bg-gray-50 rounded-xl px-6 py-4 flex justify-between items-center border border-gray-100">
            <span className="lbl text-[11px] text-gray-400 uppercase tracking-wide font-medium">Total abonado</span>
            <span className="val text-3xl font-black text-[#1E1147]">
              ${Number(datos.monto).toLocaleString('es-AR')}
            </span>
          </div>

          {/* Firmas */}
          <div className="rf flex border-t border-gray-100 mt-2">
            <div className="rf-firma flex-1 text-center pt-10 pb-5 px-4">
              <div className="linea border-t border-gray-300 mb-2" />
              <p className="texto text-[11px] text-gray-400">Firma Academia</p>
            </div>
            <div className="rf-sello flex items-center justify-center p-4">
              <div className="sello w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 font-black text-[11px] text-center leading-snug">
                PAGO<br />OK
              </div>
            </div>
            <div className="rf-firma flex-1 text-center pt-10 pb-5 px-4">
              <div className="linea border-t border-gray-300 mb-2" />
              <p className="texto text-[11px] text-gray-400">Firma Alumno/a</p>
            </div>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-gray-400">Podés guardar como PDF desde el diálogo de impresión.</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={imprimir}><Printer size={15} />Imprimir / PDF</Button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { getCriterios, createCriterio, getPlantillas, createPlantilla, getEvaluaciones, createEvaluacion } from '../services/evaluaciones'
import { getAlumnos } from '../services/alumnos'
import { getGrupos } from '../services/grupos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

const TABS = ['Evaluaciones', 'Plantillas', 'Criterios']

export default function Evaluaciones() {
  const [tab, setTab] = useState('Evaluaciones')
  const [criterios, setCriterios] = useState([])
  const [plantillas, setPlantillas] = useState([])
  const [evaluaciones, setEvaluaciones] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCriterio, setModalCriterio] = useState(false)
  const [modalPlantilla, setModalPlantilla] = useState(false)
  const [modalEvaluacion, setModalEvaluacion] = useState(false)
  const [evaluacionExpandida, setEvaluacionExpandida] = useState(null)
  const [nombreCriterio, setNombreCriterio] = useState('')
  const [formPlantilla, setFormPlantilla] = useState({ nombre: '', grupo_id: '', criterios: [] })
  const [formEva, setFormEva] = useState({ alumno_id: '', grupo_id: '', plantilla_id: '', fecha: new Date().toISOString().split('T')[0], tipo: 'parcial', observacion_general: '', recomendacion_general: '' })
  const [notasPorCriterio, setNotasPorCriterio] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try {
      const [c, p, e, a, g] = await Promise.all([getCriterios(), getPlantillas(), getEvaluaciones(), getAlumnos(), getGrupos()])
      setCriterios(c); setPlantillas(p); setEvaluaciones(e); setAlumnos(a); setGrupos(g)
    } finally { setLoading(false) }
  }

  async function handleCrearCriterio(e) {
    e.preventDefault()
    if (!nombreCriterio.trim()) return
    setGuardando(true)
    try { await createCriterio(nombreCriterio); setNombreCriterio(''); await cargar(); setModalCriterio(false) }
    catch (err) { alert(err.message) } finally { setGuardando(false) }
  }

  function toggleCriterioPlantilla(id) {
    setFormPlantilla((prev) => ({
      ...prev,
      criterios: prev.criterios.includes(id) ? prev.criterios.filter((c) => c !== id) : [...prev.criterios, id],
    }))
  }

  async function handleCrearPlantilla(e) {
    e.preventDefault()
    if (!formPlantilla.nombre || formPlantilla.criterios.length === 0) { alert('Completá el nombre y seleccioná al menos un criterio'); return }
    setGuardando(true)
    try {
      await createPlantilla(formPlantilla.nombre, formPlantilla.grupo_id || null, formPlantilla.criterios)
      await cargar(); setModalPlantilla(false); setFormPlantilla({ nombre: '', grupo_id: '', criterios: [] })
    } catch (err) { alert(err.message) } finally { setGuardando(false) }
  }

  const plantillaActual = plantillas.find((p) => p.id === formEva.plantilla_id)
  const criteriosPlantilla = plantillaActual?.plantilla_criterios?.map((pc) => pc.criterios) ?? []

  async function handleCrearEvaluacion(e) {
    e.preventDefault()
    if (!formEva.alumno_id || !formEva.plantilla_id) { alert('Seleccioná alumno y plantilla'); return }
    setGuardando(true)
    try {
      const detalles = criteriosPlantilla.map((c) => ({ criterio_id: c.id, nota: Number(notasPorCriterio[c.id]?.nota ?? 0), observacion: notasPorCriterio[c.id]?.observacion ?? '' }))
      await createEvaluacion({ alumno_id: formEva.alumno_id, grupo_id: formEva.grupo_id || null, plantilla_id: formEva.plantilla_id, fecha: formEva.fecha, tipo: formEva.tipo, observacion_general: formEva.observacion_general, recomendacion_general: formEva.recomendacion_general }, detalles)
      await cargar(); setModalEvaluacion(false)
      setFormEva({ alumno_id: '', grupo_id: '', plantilla_id: '', fecha: new Date().toISOString().split('T')[0], tipo: 'parcial', observacion_general: '', recomendacion_general: '' })
      setNotasPorCriterio({})
    } catch (err) { alert(err.message) } finally { setGuardando(false) }
  }

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Evaluaciones' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => { setModalEvaluacion(true); setNotasPorCriterio({}) }}><Plus size={16} />Nueva Evaluación</Button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {evaluaciones.length === 0 ? <p className="px-5 py-8 text-center text-sm text-gray-400">No hay evaluaciones registradas</p>
              : evaluaciones.map((eva) => (
                <div key={eva.id}>
                  <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => setEvaluacionExpandida(evaluacionExpandida === eva.id ? null : eva.id)}>
                    <div>
                      <p className="font-medium text-gray-800">{eva.alumnos?.apellido}, {eva.alumnos?.nombre}</p>
                      <p className="text-xs text-gray-500">{eva.grupos?.nombre} · {eva.plantillas_evaluacion?.nombre} · {new Date(eva.fecha).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge color="blue">{eva.tipo}</Badge>
                      {evaluacionExpandida === eva.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>
                  {evaluacionExpandida === eva.id && (
                    <div className="px-5 pb-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {eva.evaluacion_detalle?.map((d) => (
                          <div key={d.criterio_id} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase">{d.criterios?.nombre}</p>
                            <p className="text-xl font-bold text-indigo-600">{d.nota}<span className="text-sm text-gray-400">/10</span></p>
                            {d.observacion && <p className="text-xs text-gray-600 mt-1">{d.observacion}</p>}
                          </div>
                        ))}
                      </div>
                      {eva.observacion_general && <p className="text-sm text-gray-700"><strong>Observación:</strong> {eva.observacion_general}</p>}
                      {eva.recomendacion_general && <p className="text-sm text-gray-700"><strong>Recomendación:</strong> {eva.recomendacion_general}</p>}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === 'Plantillas' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setModalPlantilla(true)}><Plus size={16} />Nueva Plantilla</Button></div>
          <div className="grid gap-4">
            {plantillas.length === 0 ? <p className="text-center text-sm text-gray-400 py-8">No hay plantillas creadas</p>
              : plantillas.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-1">{p.nombre}</h3>
                  {p.grupos && <p className="text-xs text-gray-500 mb-3">Grupo: {p.grupos.nombre}</p>}
                  <div className="flex flex-wrap gap-2">
                    {p.plantilla_criterios?.map((pc) => <Badge key={pc.criterio_id} color="indigo">{pc.criterios?.nombre}</Badge>)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === 'Criterios' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setModalCriterio(true)}><Plus size={16} />Nuevo Criterio</Button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {criterios.length === 0 ? <p className="px-5 py-8 text-center text-sm text-gray-400">No hay criterios creados</p>
              : criterios.map((c) => <div key={c.id} className="px-5 py-3 text-sm text-gray-700">{c.nombre}</div>)}
          </div>
        </div>
      )}

      <Modal isOpen={modalCriterio} onClose={() => setModalCriterio(false)} title="Nuevo Criterio">
        <form onSubmit={handleCrearCriterio} className="space-y-4">
          <Input label="Nombre del criterio *" value={nombreCriterio} onChange={(e) => setNombreCriterio(e.target.value)} placeholder="Ej: Coordinación, Ritmo, Expresión corporal" />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalCriterio(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Crear criterio'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalPlantilla} onClose={() => setModalPlantilla(false)} title="Nueva Plantilla" size="lg">
        <form onSubmit={handleCrearPlantilla} className="space-y-4">
          <Input label="Nombre de la plantilla *" value={formPlantilla.nombre} onChange={(e) => setFormPlantilla(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Evaluación semestral tango" />
          <Select label="Grupo (opcional)" value={formPlantilla.grupo_id} onChange={(e) => setFormPlantilla(p => ({ ...p, grupo_id: e.target.value }))}>
            <option value="">Sin grupo específico</option>
            {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
          </Select>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Criterios a incluir *</p>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {criterios.length === 0 ? <p className="text-sm text-gray-400">Primero creá criterios en la pestaña "Criterios"</p>
                : criterios.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" checked={formPlantilla.criterios.includes(c.id)} onChange={() => toggleCriterioPlantilla(c.id)} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm text-gray-700">{c.nombre}</span>
                  </label>
                ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalPlantilla(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Crear plantilla'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalEvaluacion} onClose={() => setModalEvaluacion(false)} title="Nueva Evaluación" size="xl">
        <form onSubmit={handleCrearEvaluacion} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Alumno *" value={formEva.alumno_id} onChange={(e) => setFormEva(p => ({ ...p, alumno_id: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {alumnos.map((a) => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
            </Select>
            <Select label="Plantilla *" value={formEva.plantilla_id} onChange={(e) => { setFormEva(p => ({ ...p, plantilla_id: e.target.value })); setNotasPorCriterio({}) }}>
              <option value="">Seleccionar...</option>
              {plantillas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha" type="date" value={formEva.fecha} onChange={(e) => setFormEva(p => ({ ...p, fecha: e.target.value }))} />
            <Select label="Tipo" value={formEva.tipo} onChange={(e) => setFormEva(p => ({ ...p, tipo: e.target.value }))}>
              <option value="parcial">Parcial</option>
              <option value="final">Final</option>
              <option value="diagnóstica">Diagnóstica</option>
            </Select>
          </div>
          {criteriosPlantilla.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Notas por criterio (0–10)</p>
              <div className="space-y-3">
                {criteriosPlantilla.map((c) => (
                  <div key={c.id} className="grid grid-cols-3 gap-3 items-center bg-gray-50 rounded-lg p-3">
                    <span className="text-sm font-medium text-gray-700">{c.nombre}</span>
                    <input type="number" min="0" max="10" step="0.5" placeholder="Nota"
                      value={notasPorCriterio[c.id]?.nota ?? ''}
                      onChange={(e) => setNotasPorCriterio(prev => ({ ...prev, [c.id]: { ...prev[c.id], nota: e.target.value } }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="text" placeholder="Observación (opcional)"
                      value={notasPorCriterio[c.id]?.observacion ?? ''}
                      onChange={(e) => setNotasPorCriterio(prev => ({ ...prev, [c.id]: { ...prev[c.id], observacion: e.target.value } }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación general</label>
            <textarea value={formEva.observacion_general} onChange={(e) => setFormEva(p => ({ ...p, observacion_general: e.target.value }))} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Observación general sobre el alumno..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recomendación</label>
            <textarea value={formEva.recomendacion_general} onChange={(e) => setFormEva(p => ({ ...p, recomendacion_general: e.target.value }))} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Recomendaciones para el alumno..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalEvaluacion(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar evaluación'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

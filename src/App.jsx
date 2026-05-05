import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Alumnos from './pages/Alumnos'
import Grupos from './pages/Grupos'
import Profesores from './pages/Profesores'
import Inscripciones from './pages/Inscripciones'
import Asistencia from './pages/Asistencia'
import Pagos from './pages/Pagos'
import Evaluaciones from './pages/Evaluaciones'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alumnos" element={<Alumnos />} />
          <Route path="grupos" element={<Grupos />} />
          <Route path="profesores" element={<Profesores />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="asistencia" element={<Asistencia />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

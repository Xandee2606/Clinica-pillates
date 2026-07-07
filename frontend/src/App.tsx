import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminLayout } from './components/admin/AdminLayout'

// Páginas públicas
const Home = lazy(() => import('./pages/Home'))
const Agendamento = lazy(() => import('./pages/Agendamento'))
const Confirmacao = lazy(() => import('./pages/Confirmacao'))
const Login = lazy(() => import('./pages/Login'))

// Páginas admin (carregadas sob demanda — mantêm o Recharts fora do bundle público)
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Clientes = lazy(() => import('./pages/admin/Clientes'))
const Agendamentos = lazy(() => import('./pages/admin/Agendamentos'))
const Financeiro = lazy(() => import('./pages/admin/Financeiro'))
const Configuracoes = lazy(() => import('./pages/admin/Configuracoes'))

function CarregandoTela() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <p className="font-body text-sage-500">Carregando...</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<CarregandoTela />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/confirmacao" element={<Confirmacao />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="agendamentos" element={<Agendamentos />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

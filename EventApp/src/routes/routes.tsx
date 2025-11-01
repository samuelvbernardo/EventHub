import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { PrivateRoute } from "./PrivateRoute"

// Lazy-loaded pages (code-splitting por rota)
const LoginPage = lazy(() => import("../pages/LoginPage"))
const DashboardPage = lazy(() => import("../pages/DashboardPage"))
const EventosPage = lazy(() => import("../pages/EventosPage"))
const InscricoesPage = lazy(() => import("../pages/InscricoesPage"))
const OrganizadorRegisterPage = lazy(() => import("../pages/OrganizadorRegisterPage"))
const RegisterPage = lazy(() => import("../pages/RegisterPage"))
const NotificacoesPage = lazy(() => import("../pages/NotificacoesPage"))

export const AppRoutes = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
    <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/organizadores/cadastrar" element={<OrganizadorRegisterPage />} />
    <Route
      path="/notificacoes"
      element={
        <PrivateRoute>
          <NotificacoesPage />
        </PrivateRoute>
      }
    />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/eventos"
        element={
          <PrivateRoute>
            <EventosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/inscricoes"
        element={
          <PrivateRoute>
            <InscricoesPage />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  )
}

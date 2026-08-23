import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const token = localStorage.getItem('access_token')
  const location = useLocation()

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

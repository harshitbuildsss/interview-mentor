import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')

  if (!token || !user || !userId) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
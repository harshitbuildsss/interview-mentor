import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const getStoredUser = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('healthos_token')

  const userId = localStorage.getItem('userId')
  const name = localStorage.getItem('name')

  if (token && userId) {
    return {
      token,
      userId: parseInt(userId, 10),
      name,
    }
  }

  return null
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser)

  const login = (token, userId, name) => {
    localStorage.setItem('token', token)
    localStorage.setItem('healthos_token', token)
    localStorage.setItem('userId', String(userId))

    if (name) {
      localStorage.setItem('name', name)
    } else {
      localStorage.removeItem('name')
    }

    setUser({
      token,
      userId: parseInt(userId, 10),
      name: name || null,
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('healthos_token')
    localStorage.removeItem('userId')
    localStorage.removeItem('name')

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
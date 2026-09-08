import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token')
    const savedUserId = localStorage.getItem('userId')
    const savedName = localStorage.getItem('name')
    if (savedToken && savedUserId) {
      return { token: savedToken, userId: parseInt(savedUserId), name: savedName }
    }
    return null
  })

  const login = (token, userId, name) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    if (name) localStorage.setItem('name', name)
    setUser({ token, userId, name })
  }

  const logout = () => {
    localStorage.removeItem('token')
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
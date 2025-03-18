import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [userLogado, setUserLogado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setUserLogado(!token)
  }, [])

  const login = (token) => {
    localStorage.setItem('token', token)
    setUserLogado(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUserLogado(false)
  }

  return (
    <AuthContext.Provider value={{ userLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
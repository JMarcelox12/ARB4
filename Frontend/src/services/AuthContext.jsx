import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [userLogado, setUserLogado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('Token no localStorage:', token) // Verifica se o token está correto
    setUserLogado(!!token && token !== 'null') // Garante que userLogado seja booleano correto
  }, [])

  const login = (token) => {
    console.log('Logando com token:', token) // Debug do login
    localStorage.setItem('token', token)
    setUserLogado(true)
  }

  const logout = () => {
    console.log('Deslogando...') // Debug do logout
    localStorage.removeItem('token')
    setUserLogado(false)
  }
  
  return (
    <AuthContext.Provider value={{ userLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

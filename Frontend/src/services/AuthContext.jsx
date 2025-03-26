import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [userLogado, setUserLogado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setUserLogado(!!token && token !== 'null') // Garante que userLogado seja booleano correto
  }, [])

  const login = (token) => {
    console.log('Logando com token:', token) // Debug do 
    setUserLogado(true)
  }

  const logout = () => {
    console.log('Deslogando...')
    localStorage.removeItem('authToken')
    setUserLogado(false)
  }
  
  return (
    <AuthContext.Provider value={{ userLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

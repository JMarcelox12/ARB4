import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
//import "./index.css";
import Home from './index.jsx'
import Login from './auth/login.jsx'
import Registro from './auth/registro.jsx'
import Deposito from './pay/deposito.jsx'
import Saque from "./pay/saque.jsx"
import { AuthProvider } from '../services/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route Component={Login} path="/login"></Route>
          <Route Component={Registro} path="/register"></Route>
          <Route Component={Home} path="/"></Route>
          <Route Component={Deposito} path="/deposito"></Route>
          <Route Component={Saque} path="/saque"></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)

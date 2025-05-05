import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
//import "./index.css";
import Home from './index.jsx'
import Login from './auth/login.jsx'
import Registro from './auth/registro.jsx'
import Deposito from './pay/deposito.jsx'
import Saque from "./pay/saque.jsx"
import CadastroFormiga from './ants/cadastro.jsx'
import AntList from './ants/listagem.jsx'
import AntEdit from './ants/editar.jsx'
import CadastroSala from './rooms/cadastro.jsx'
import RoomList from './rooms/listagem.jsx'
import perfilUser from './user/index.jsx'
import BetList from './bets/listagem.jsx'
import BetEdit from './bets/editar.jsx'
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
          <Route Component={CadastroFormiga} path="/cadastroFormiga"></Route>
          <Route Component={AntList} path="/formigas"></Route>          
          <Route Component={AntEdit} path="/editarFormiga"></Route>
          <Route Component={CadastroSala} path="/criarSala"></Route>
          <Route Component={RoomList} path="/salas"></Route>
          <Route Component={perfilUser} path="/perfil"></Route>
          <Route Component={BetList} path="/apostas"></Route>
          <Route Component={BetEdit} path="/editarApostas"></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)

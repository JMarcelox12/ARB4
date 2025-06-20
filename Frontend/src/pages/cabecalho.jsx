import '../styles/global.css'
import { Link, useNavigate } from 'react-router'
import { AuthContext, } from '../services/AuthContext.jsx'
import { useContext, useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";
import api from '../services/api'

export function HeaderDeslogado() {

  return (
    <header>
      <nav className="navbar d-flex justify-content-between bg-transparent">
        <div className="container-fluid col-md-4">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-start text-white esquerda canvas"
            tabindex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header align-self-center" id="MenuLateral">
              <button type="button" className="btn" data-bs-dismiss="offcanvas">
                <img src="../public/imagens/FVFC.png" className="imgLogoCanvas"/>
              </button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item align-self-center right">
                  <Link to="/login" className="btnVerdeCanvas" type="button">
                     ENTRAR
                  </Link>
                  <Link to="/register" className="btnCanvas" type="button">
                      REGISTRAR
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/formigas">
                    Formigas
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/salas">
                    Salas
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="col-md-5 offset-md-3 align-self-center left">
        <a href="/">
          <img src="../public/imagens/FPFV.png" alt="some text" className="img" />
        </a>
      </div>

      <div className="col-md-5 align-self-end right">
        <Link to="/login" className="btn btn-outline-dark me-2" type="button">
          ENTRAR
        </Link>
        <Link to="/register" className="btn btn-dark" type="button">
          REGISTRAR
        </Link>
      </div>
    </header>
  )
}

export function HeaderLogado() {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [saldo, setSaldo] = useState(0)

  const irParaSaque = () => {
    navigate("/saque")
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const userId = decoded.userId
        buscarSaldo(userId)
      } catch (err) {
        console.error("Erro ao decodificar:", err)
      }
    } else {
      console.warn("Token não encontrado no localStorage")
    }
  }, [])

  const buscarSaldo = async (userId) => {
    try {
      const response = await api.get(`app/user/${userId}`)
      const saldoAtual = response.data.saldo
      setSaldo(saldoAtual)
    } catch (error) {
      console.error("Erro ao buscar saldo:", error)
    }
  }

  return (
    <header>
     <nav className="navbar d-flex justify-content-between bg-transparent">
     <div className="container-fluid col-md-4">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-start text-bg-dark esquerda canvas-color"
            tabindex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
             <div className="offcanvas-header align-self-center" id="MenuLateral">
              <button type="button" className="btn" data-bs-dismiss="offcanvas">
                <img src="../public/imagens/FVFC.png" className="imgLogoCanvas"/>
              </button>
            </div>
            <hr/>
            <div className="offcanvas-body">
              <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                  <a className="nav-link text-white" href="/perfil" aria-current="page">
                    Perfil (vazio)
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/apostas">
                    Minhas Apostas
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/salas">
                    Salas
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/formigas">
                    Formigas
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/deposito">
                    Depósito
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/saque">
                    Saque
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/cadastroFormiga">
                    Cadastrar Formiga (tirar)
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/editarFormiga">
                    Editar Formiga (tirar)
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/criarSala">
                    Criar Sala (tirar)
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/editarAposta">
                    Editar Apostas (tirar)
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/editarSala">
                    Editar Salas (tirar)
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/transacoes">
                    Transações
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/">
                    Vazio
                  </a>
                </li>
                <hr/>
                <li className="nav-item align-self-center right py-5">
                  <Link onClick={logout} className="btnCanvas" type="button">
                    Deslogar
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="col-md-5 offset-md-3 align-self-center left">
        <a href="/">
          <img src="../public/imagens/FPFV.png" alt="some text" className="img" />
        </a>
      </div>

      <div className="col-md-5 align-self-end right">
          <div className="text-white fw-bold">
            R$ {Number(saldo).toFixed(2).replace('.', ',')}
          </div>
      <div className="dropdown me-2">
        <button className="btn dropdown-toggle bg-transparent" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul className="dropdown-menu">
          <li><button className="dropdown-item" type="button">Perfil</button></li>
          <li><button className="dropdown-item" type="button" onClick={irParaSaque}>Sacar</button></li>
          <li><button className="dropdown-item" type="button" onClick={logout}>Deslogar</button></li>
        </ul>
      </div>
        <Link to="/deposito" className="btn btn-dark" type="button">
          DEPÓSITO
        </Link>
      </div>
    </header>
  )
}

export function Header() {
    return (
      <header>
        <div className="col align-self-center left">
          <a href="/">
            <img
              src="../../public/imagens/FPFV.png"
              alt="some text"
              className="img"
            />
          </a>
        </div>
      </header>
    )
}

export function HeaderList() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">Navbar</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Action</a></li>
                <li><a className="dropdown-item" href="#">Another action</a></li>
                <li><hr className="dropdown-divider"/></li>
                <li><a className="dropdown-item" href="#">Something else here</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" aria-disabled="true">Disabled</a>
            </li>
          </ul>
        <form className="d-flex" role="search">
          <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
          <button className="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </div>
  </nav>
  )
}
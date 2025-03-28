import '../styles/home.css'
import { Link } from 'react-router'
import { AuthContext, } from '../services/AuthContext.jsx'
import { useContext, useState } from 'react'

export default function Home() {
  const { userLogado } = useContext(AuthContext)  

  return (
      <div className="bg-dark text-white" style={{ height: "120dvh", margin: "0%"}}>
        

        {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

        <div className="my-container bg-transparent">
          <div className="row align-items-center py-4">
            <div className="col-auto me-auto">
              <p className="fs-2 fw-bold">Populares</p>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-dark fs-2 fw-bold bg-sucess">
                <p className="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div className="row align-items-center py-4">
            <div className="col-auto me-auto">
              <p className="fs-2 fw-bold">Destaques</p>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-dark fs-2 fw-bold">
                <p className="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div className="row align-items-center py-4">
            <div className="col-auto me-auto">
              <p className="fs-2 fw-bold">Formigas coloridas</p>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btnlogin-dark fs-2 fw-bold">
                <p className="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div className="row align-items-center py-4">
            <div className="col-auto me-auto">
              <p className="fs-2 fw-bold">Formigas patriotas</p>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-dark fs-2 fw-bold">
                <p className="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div className="row align-items-center py-4">
            <div className="col-auto me-auto">
              <p className="fs-2 fw-bold">Ao vivo</p>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-dark fs-2 fw-bold">
                <p className="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
        </div>
      </div>
  )
}

function HeaderDeslogado() {

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
                  <a className="nav-link text-white" href="#">
                    Formigas
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="#">
                    Salas
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="#">
                    Quem somos
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

function HeaderLogado() {
  const { logout } = useContext(AuthContext)

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
                <li className="nav-item align-self-center right">
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
      <div className="dropdown me-2">
        <button className="btn dropdown-toggle bg-transparent" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul className="dropdown-menu">
          <li><button className="dropdown-item" type="button">Perfil</button></li>
          <li><button className="dropdown-item" type="button" href="/sacar" >Sacar</button></li>
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

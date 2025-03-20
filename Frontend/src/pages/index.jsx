import '../styles/home.css'
import { Link } from 'react-router'
import { AuthContext, } from '../services/AuthContext.jsx'
import { useContext, useState } from 'react'

export default function Home() {
  const { userLogado } = useContext(AuthContext)

  return (
      <div class="bg-dark text-white" style={{ height: "120dvh", margin: "0%"}}>
        

        {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

        <div class="my-container bg-transparent">
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-2 fw-bold">Populares</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-2 fw-bold bg-sucess">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-2 fw-bold">Destaques</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-2 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-2 fw-bold">Formigas coloridas</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btnlogin-dark fs-2 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-2 fw-bold">Formigas patriotas</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-2 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-2 fw-bold">Ao vivo</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-2 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
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
      <nav class="navbar d-flex justify-content-between bg-transparent">
        <div class="container-fluid col-md-4">
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div
            class="offcanvas offcanvas-start text-white esquerda canvas"
            tabindex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div class="offcanvas-header align-self-center" id="MenuLateral">
              <button type="button" class="btn" data-bs-dismiss="offcanvas">
                <img src="../public/imagens/FVFC.png" class="imgLogoCanvas"/>
              </button> 
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li class="nav-item align-self-center right">
                  <Link to="/login" class="btnVerdeCanvas" type="button">
                     ENTRAR
                  </Link>
                  <Link to="/register" class="btnCanvas" type="button">
                      REGISTRAR
                  </Link>
                </li>
                <li class="nav-item">
                  <a class="nav-link text-white" href="#">
                    Formigas
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link text-white" href="#">
                    Salas
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link text-white" href="#">
                    Quem somos
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div class="col-md-5 offset-md-3 align-self-center left">
        <a href="/">
          <img src="../public/imagens/FPFV.png" alt="some text" class="img" />
        </a>
      </div>

      <div class="col-md-5 align-self-end right">
        <Link to="/login" class="btn btn-outline-dark me-2" type="button">
          ENTRAR
        </Link>
        <Link to="/register" class="btn btn-dark" type="button">
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
     <nav class="navbar d-flex justify-content-between bg-transparent">
     <div class="container-fluid col-md-4">
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div
            class="offcanvas offcanvas-start bg-dark text-white esquerda"
            tabindex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div class="offcanvas-header" id="MenuLateral">
              <h5 class="offcanvas-title title-white" id="offcanvasNavbarLabel">
                Teste
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li class="nav-item">
                  <Link onClick={logout} class="btnCanvas" type="button">
                    Deslogar
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div class="col-md-5 offset-md-3 align-self-center left">
        <a href="/">
          <img src="../public/imagens/FPFV.png" alt="some text" class="img" />
        </a>
      </div>

      <div class="col-md-5 align-self-end right">
      <div class="dropdown me-2">
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" type="button">Action</button></li>
          <li><button class="dropdown-item" type="button">Another action</button></li>
          <li><button class="dropdown-item" type="button">Something else here</button></li>
        </ul>
      </div>
        <Link to="/register" class="btn btn-dark" type="button">
          DEPÓSITO
        </Link>
      </div>
    </header>
  )
}

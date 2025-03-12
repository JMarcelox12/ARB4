import '../styles/home.css'
import Login from './auth/login.jsx';
import Registro from './auth/registro.jsx';
import { Link } from 'react-router';

export default function Home() {


  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
      ></link>
      <link rel="stylesheet" href="../styles/home.css" />
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Home</title>
      </head>
      <body class="bg-dark text-white">
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossorigin="anonymous"
        ></script>

        <header>
          <nav class="navbar d-flex justify-content-between bg-transparent">
            <div class="container-fluid">
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
                class="offcanvas offcanvas-start bg-dark text-white"
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
                      <a class="nav-link active text-white" aria-current="page" href="#">
                        teste
                      </a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link text-white" href="#">
                        teste
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>

          <div class="col-10 align-self-center left">
            <img src="../../public/imagens/FPFV.png" alt="some text" class="img" />
          </div>

          <div class="col align-self-end right">
            <Link to="/login" class="btn btn-outline-dark me-2" type="button">
              ENTRAR
            </Link>
            <Link to="/register" class="btn btn-dark" type="button">REGISTRAR</Link>
          </div>
        </header>

        <div class="my-container bg-transparent">
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-1 fw-bold">Populares</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-1 fw-bold bg-sucess">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-1 fw-bold">Destaques</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-1 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-1 fw-bold">Formigas coloridas</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-1 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-1 fw-bold">Formigas patriotas</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-1 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
          <div class="row align-items-center py-4">
            <div class="col-auto me-auto">
              <p class="fs-1 fw-bold">Ao vivo</p>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-dark fs-1 fw-bold">
                <p class="textVerde">Mostrar tudo</p>
              </button>
            </div>
          </div>
          <ul id="lista-salas"></ul>
        </div>
      </body>
    </>
  )
}

import '../styles/global.css'
import { AuthContext } from "../services/AuthContext.jsx";
import { useContext } from 'react'
import { HeaderDeslogado, HeaderLogado } from './cabecalho.jsx';

export default function Home() {
  const { userLogado } = useContext(AuthContext)

  return (
      <div className="bg-dark text-white xx-container" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
        

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

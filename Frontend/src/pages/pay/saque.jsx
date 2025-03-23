import '../../styles/home.css'
import { useRef } from "react"
import { useNavigate } from 'react-router'
import api from "../../services/api"

export default function Saque() {
  const navigate = useNavigate()
  const valueRef = useRef()
  const passwordRef = useRef()

  return (
    <div className="bg-dark text-white" style={{ height: "100vh" }}>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossOrigin="anonymous"
      ></script>

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

      <div className="input flex-column align-items-center rounded">
        <form>
          <p className="fw-bold fs-3 left">Faça o login em sua conta.</p>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="floatingInput"
              placeholder="name@example.com"
              ref={valueRef}
              required
            />
            <label htmlFor="floatingInput">Email</label>
          </div>
          <div className="form-floating">
            <input
              type="password"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="floatingPassword"
              placeholder="Password"
              ref={passwordRef}
              required
            />
            <label htmlFor="floatingPassword">Senha</label>
          </div>
          <button type="submit" className="btn btn-success btnVerde" onClick={() => (handleSignIn)}>
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  )
}

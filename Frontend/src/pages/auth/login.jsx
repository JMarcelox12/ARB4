import '../../styles/global.css'
import { useRef } from "react"
import { useNavigate } from 'react-router'
import api from "../../services/api"
import { Header } from '../cabecalho'

export default function Login() {
  const navigate = useNavigate()
  const emailRef = useRef()
  const passwordRef = useRef()

  async function handleSignIn(e) {
    e.preventDefault()
    
    try {
      const response = await api.post("/app/user/login", {
        email: emailRef.current.value,
        password: passwordRef.current.value,
      })
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        console.log(localStorage.getItem("authToken"));
        navigate("/")
        window.location.reload();
      } else {
        alert("Erro ao realizar login, tente novamente.");
      }

    } catch (err) {
      console.error("Erro ao tentar fazer login:", err);
      alert("Senha ou email incorretos");
    }
  }

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>

      <Header/>

      <div className="input flex-column align-items-center rounded">
        <form onSubmit={handleSignIn}>
          <p className="fw-bold fs-3 left">Faça o login em sua conta.</p>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="email"
              placeholder="name@example.com"
              ref={emailRef}
              required
            />
            <label htmlFor="floatingInput">Email</label>
          </div>
          <div className="form-floating">
            <input
              type="password"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="password"
              placeholder="Password"
              ref={passwordRef}
              required
            />
            <label htmlFor="floatingPassword">Senha</label>
          </div>
          <button type="submit" className="btn btn-success btnVerde" onClick={() => (handleSignIn)}>
            ENTRAR
          </button>
          <p>
            <a
              href="#"
              className="left link-light link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
            >
              Esqueceu a senha?

            </a>
          </p>
          <div className="row-column">
            <p className="left">
              Não tem uma conta?
              <a
                href="/register"
                className="left link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover ms-1 textVerde"
              >
                Registre-se
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

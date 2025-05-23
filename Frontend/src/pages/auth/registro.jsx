import api from '../../services/api'
import { useRef } from 'react'
import { useNavigate } from "react-router-dom"
import { Header } from "../cabecalho.jsx"

export default function Registro() {
  const navigate = useNavigate()
  const nameRef = useRef()
  const ageRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const response = await api.post("/app/user/register", {
        name: nameRef.current.value,
        age: parseInt(ageRef.current.value, 10),
        email: emailRef.current.value,
        password: passwordRef.current.value,
      })

      localStorage.setItem('authToken', response.data.token);
      console.log(localStorage.getItem("authToken"));
      alert("Usuário cadastrado com sucesso!")
      navigate("/")
      window.location.reload();
    } catch (err) {
      console.log(err)
       return alert("Erro ao cadastrar usuário")
    }
  }

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>

      <Header/>
      
      <div className="input  flex-column align-items-center rounded">
        <form onSubmit={handleSubmit}>
          <p className="fw-bold fs-3 left">Faça seu registro.</p>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="name"
              placeholder="Text"
              ref={nameRef}
              required
            />
            <label htmlFor="floatingInput">Nome</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="age"
              placeholder="Text"
              ref={ageRef}
              required
            />
            <label htmlFor="floatingInput">Idade</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="email"
              placeholder="name@example.com"
              ref={emailRef}
              required
            />
            <label>Email</label>
          </div>
          <div className="form-floating mb-3">
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

          <button type="submit" className="btn btn-success btnVerde">
            REGISTRAR-SE
          </button>

          <div className="row-column">
            <p className="left">
              Já tem uma conta?
              <a
                href="/login"
                className="left link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover ms-1 textVerde"
              >
                Fazer o login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 
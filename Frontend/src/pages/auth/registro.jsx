import api from '../../services/api'
import { useState } from 'react'

export default function Registro() {
  const handleSubmit = (e) => {
    e.preventDefault()
    const { name, age, email, password, confirPassword } = e.target
    var userCreate = {
      name: name.value,
      age: age.value,
      email: email.value,
      password: password.value,
      confirPassword: confirPassword.value,
    }

    if (password.value === confirPassword.value) {
      api
        .post('/register', userCreate)
        .then((res) => {
          alert('Usuário criado com sucesso!')
        })
        .catch((err) => {
          alert('Erro ao registrar usuário!')
          alert(err?.response?.data?.message ?? err.message)
        })
    } else {
      alert('Erro, senhas não coincidem!')
    }
  }

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
      ></link>
      <link rel="stylesheet" href="../../styles/home.css" />
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/FPFV.svg" />
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
          <div class="col align-self-center left">
            <a href="/">
              <img
                src="../../public/imagens/FPFV.png"
                alt="some text"
                class="img"
              />
            </a>
          </div>
        </header>

        <div class="input  flex-column align-items-center rounded">
          <form onSubmit={handleSubmit}>
            <p class="fw-bold fs-3 left">Faça seu registro.</p>
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control bg-transparent border-success rounded py-2 text-white"
                id="nameInput"
                placeholder="Text"
                name="name"
                required
              />
              <label for="floatingInput">Nome</label>
            </div>
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control bg-transparent border-success rounded py-2 text-white"
                id="ageInput"
                placeholder="Text"
                name="age"
                required
              />
              <label for="floatingInput">Idade</label>
            </div>
            <div class="form-floating mb-3">
              <input
                type="email"
                class="form-control bg-transparent border-success rounded py-2 text-white"
                id="emailInput"
                placeholder="name@example.com"
                name="email"
                required
              />
              <label for="floatingInput">Email</label>
            </div>
            <div class="form-floating mb-3">
              <input
                type="password"
                class="form-control bg-transparent border-success rounded py-2 text-white"
                id="passwordInput"
                placeholder="Password"
                name="password"
                required
              />
              <label for="floatingPassword">Senha</label>
            </div>
            <div class="form-floating">
              <input
                type="password"
                class="form-control bg-transparent border-success rounded py-2 text-white"
                id="confirmInput"
                placeholder="Password"
                name="confirmPassword"
                required
              />
              <label for="floatingInput">Confirmar senha</label>
            </div>
            <button type="submit" class="btn btn-success btnVerde">
              REGISTRAR-SE
            </button>

            <div class="row-column">
              <p class="left">
                Já tem uma conta?
                <a
                  href="/login"
                  class="left link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover ms-1 textVerde"
                >
                  Fazer o login
                </a>
              </p>
            </div>
          </form>
        </div>
      </body>
    </>
  )
}

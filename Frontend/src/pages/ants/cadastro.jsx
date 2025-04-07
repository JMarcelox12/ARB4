import api from '../../services/api'
import { useRef, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Header } from '../cabecalho'

export default function CadastroFormiga() {
  const navigate = useNavigate()
  const nameRef = useRef("")
  const [imagem, setImagem] = useState(null)

  const handleImageChange = (e) => {
    setImagem(e.target.files[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
        await api.post("/app/ant/createAnt", {
          image: imagem,
          name: nameRef.current.value,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        alert("Formiga registrada com sucesso!")
        window.location.reload()
      } catch (err) {
        alert("Erro ao cadastrar formiga")
        console.error(err)
      }
    }
  
  return (
    <div className="bg-dark text-white" style={{ height: "100vh" }}>
      <Header/>

      <div className="input  flex-column align-items-center rounded">

        <form onSubmit={handleSubmit}  encType="multipart/form-data">
          <p className="fw-bold fs-3 left">Registrar Formiga</p>

          <div className="form-floating mb-3">
            <input 
                type="file" 
                name="imagem" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="form-control bg-transparent border-success rounded py-2 text-white"/>
          </div>

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

          <button type="submit" className="btn btn-success btnVerde">
            REGISTRAR
          </button>

        </form>
      </div>
    </div>
  )
}
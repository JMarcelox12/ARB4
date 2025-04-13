import api from '../../services/api'
import { useRef, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Header } from '../cabecalho'

export default function CadastroSala() {
  const navigate = useNavigate()
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagem, setImagem] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImagem(file)

    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    console.log("1")

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    if (imagem) formData.append("image", imagem)

    try {
      console.log("2")
        const response = await api.post("/app/room/", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        console.log("3")
        console.log(response.data)
        alert("Sala criada com sucesso!")
        window.location.reload()
      } catch (err) {
        alert("Erro ao criar sala!")
        console.error(err)
      }
    }
  
  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <Header/>

      <div className="input  flex-column align-items-center rounded">

        <form onSubmit={handleSubmit}  encType="multipart/form-data">
          <p className="fw-bold fs-3 left">Registrar Formiga</p>

    <div className="mb-3 text-center">
      {preview && (
        <img
        src={preview}
        alt="Pré-visualização"
        style={{ maxHeight: '200px', borderRadius: '10px' }}
      />
      )}
    </div>

          <div className="form-floating mb-3">
            <input 
                type="file" 
                name="image" 
                accept="image/*" 
                onChange={handleImageChange}
                className="form-control bg-transparent border-success rounded py-2 text-white"/>
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="floatingInput">Nome</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <label htmlFor="floatingInput">Descrição</label>
          </div>

          <button type="submit" className="btn btn-success btnVerde">
            CRIAR
          </button>

        </form>
      </div>
    </div>
  )
}
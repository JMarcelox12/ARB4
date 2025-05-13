import React, { useEffect, useState, useRef } from 'react'
import { AntCardEdit } from '../../components/formigas/card.jsx'
import '../../styles/global.css'
import api from "../../services/api.js"
import { Header } from '../cabecalho.jsx'

const AntEdit = () => {
  const [ants, setAnts] = useState([])
  const [selectedAnt, setSelectedAnt] = useState(null)
  const [name, setName] = useState('Nome')
  const [imagem, setImagem] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    async function fetchAnts() {
      const response = await api.get("/app/ant/list")
      setAnts(response.data)
    }
    fetchAnts()
  }, [])

const handleImageChange = (e) => {
  const file = e.target.files[0]
  setImagem(file)
  
  if (file) {
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
  }
}

const handleChange = (e) => {
  setName(e.target.value)
}

// Função do delete
async function btnDelete(e) {
  e.preventDefault()

  if (!selectedAnt) {
    alert("Selecione uma formiga para excluir.")
    return
  }

  try {
    const id = parseInt(selectedAnt.id)

    await api.delete(`/app/ant/delete/${id}`)
    alert("Formiga excluída com sucesso!")
    window.location.reload()
  } catch (err) {
    alert("Erro ao excluir formiga")    
    console.error(err)
  }
}

function handleCardClick(ant) {
  setSelectedAnt(ant)
  setName(ant.name)
}

// Função de editar
async function handleSubmit(e) {
  e.preventDefault()

  if (!selectedAnt) {
    alert("Selecione uma formiga para editar.")
    return
  }

  const formData = new FormData()
  formData.append("name", name)
  if (imagem) formData.append("image", imagem)

  console.log("Nome enviado: ", name)

  try {
    const id = parseInt(selectedAnt.id)

    await api.post(`/app/ant/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    alert("Formiga editada com sucesso!")
    window.location.reload()
  } catch (err) {
    alert("Erro ao editar formiga")
    console.error(err)
  }
}

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <Header/>

    <div className="input  flex-column align-items-center rounded">

      <form encType="multipart/form-data">
          <p className="fw-bold fs-3 left">Editar Formiga</p>

      <div className="mb-3 text-center">
        {preview ? (
          <img src={preview} alt="Pré-visualização" style={{ maxHeight: '200px', borderRadius: '10px' }} />
        ) : selectedAnt?.image && (
          <img
          src={`http://localhost:1200/${selectedAnt.image}`}
          alt="Imagem atual"
          style={{ maxHeight: '200px', borderRadius: '10px' }}
          />
        )}
      </div>

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
              id="value"
              value={name}
              className="form-control bg-transparent border-success rounded py-2 text-white"
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-grid gap-2">
            <button type="button" className="btnEdit" onClick={handleSubmit}>
                EDITAR
            </button>

            <button type="button" className="btnDelete" onClick={btnDelete}>
                EXCLUIR
            </button>
          </div>
          
        </form>
    </div>

    <div className="lst-container">
      <h1 className="lst-title">Formigas Cadastradas</h1>
      <div className="lst-grid">
      {ants.length > 0 ? (
        ants.map((ant) => (
          <AntCardEdit
            key={ant.id}
            name={ant.name}
            odd={ant.odd}
            image={ant.image}
            onClick={() => handleCardClick(ant)}
          />
        ))
      ) : (
        <h5>Nenhuma formiga encontrada.</h5>
      )}
      </div>
    </div>
    </div>
  )
}

export default AntEdit
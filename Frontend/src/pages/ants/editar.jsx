import React, { useEffect, useState, useRef } from 'react'
import { AntCardEdit } from '../../components/formigas/antCard.jsx'
import '../../styles/lstAnt.css'
import api from "../../services/api.js"
import { Header } from '../cabecalho.jsx'

const AntEdit = () => {
  const [ants, setAnts] = useState([])
  const [selectedAnt, setSelectedAnt] = useState(null)
  const nameRef = useRef(null)
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
  
async function btnDelete(e) {
  e.preventDefault()

  if (!selectedAnt) {
    alert("Selecione uma formiga para excluir.")
    return
  }

  try {
    await api.post(`/app/ant/delete/${selectedAnt.id}`)
    alert("Formiga excluída com sucesso!")
    window.location.reload()
  } catch (err) {
    alert("Erro ao excluir formiga")
    console.error(err)
  }
}

function handleCardClick(ant) {
  setSelectedAnt(ant)
  nameRef.current.value = ant.name
}

async function handleSubmit(e) {
  e.preventDefault()

  if (!selectedAnt) {
    alert("Selecione uma formiga para editar.")
    return
  }

  const formData = new FormData()
  formData.append("name", nameRef.current.value)
  if (imagem) {
    formData.append("image", imagem)
  }

  try {
    await api.post(`/app/ant/update/${selectedAnt.id}`, formData, {
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
    <div className="bg-dark text-white">
      <Header/>

    <div className="input  flex-column align-items-center rounded">

      <form encType="multipart/form-data">
          <p className="fw-bold fs-3 left">Editar Formiga</p>

      <div className="mb-3 text-center">
        {preview ? (
          <img src={preview} alt="Pré-visualização" style={{ maxHeight: '200px', borderRadius: '10px' }} />
        ) : selectedAnt?.image && (
          <img
          src={`http://localhost:1200/${selectedAnt.image.replace(/^uploads\//, '')}`}
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
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="name"
              placeholder="Text"
              ref={nameRef}
              required
            />
            <label htmlFor="floatingInput">Nome</label>
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btnEdit" onClick={handleSubmit}>
                EDITAR
            </button>

            <button type="submit" className="btnDelete" onClick={btnDelete}>
                EXCLUIR
            </button>
          </div>
          
        </form>
    </div>

    <div className="ant-container">
      <h1 className="title">Formigas Cadastradas</h1>
      <div className="ant-grid">
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
import React, { useEffect, useState } from 'react'
import { AntCard } from '../../components/formigas/antCard.jsx'
import '../../styles/lstAnt.css'
import api from "../../services/api.js"
import { Header } from '../cabecalho.jsx'

const AntEdit = () => {
  const [ants, setAnts] = useState([])
  const nameRef = useState("")
  const [imagem, setImagem] = useState(null)

  useEffect(() => {
    async function fetchAnts() {
      try {
        const response = await api.get("/app/ant/list")
        setAnts(response.data)
      } catch (err) {
        console.error("Erro ao buscar formigas:", err)
      }
    }
  
    fetchAnts()
  }, [])
  
const handleImageChange = (e) => {
  setImagem(e.target.files[0])
}
  
const btnDelete = (id) => {
  //
}

async function handleSubmit(e) {
  e.preventDefault()

  try {
    await api.post("/app/ant/update/${id}", {
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
    <div className="bg-dark text-white">
      <Header/>

    <div className="input  flex-column align-items-center rounded">

      <form encType="multipart/form-data">
          <p className="fw-bold fs-3 left">Editar Formiga</p>

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
            <button type="submit" className="btnEdit">
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
          <AntCard
            key={ant.id}
            name={ant.name}
            odd={ant.odd}
            image={ant.image}
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
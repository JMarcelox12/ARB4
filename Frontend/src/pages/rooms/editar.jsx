import React, { useEffect, useState, useRef } from 'react'
import { RoomCardEdit } from '../../components/salas/card.jsx'
import '../../styles/global.css'
import api from "../../services/api.js"
import { Header } from '../cabecalho.jsx'

const RoomEdit = () => {
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const nameRef = useRef("")
  const descriptionRef = useRef("")
  const [imagem, setImagem] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get("/app/room/rooms")
        setRooms(response.data)
      } catch (err) {
        console.error("Erro ao buscar salas: ", err)
      }
    }

    fetchRooms()
  }, [])

  
async function btnDelete(e) {
  e.preventDefault()

  if (!selectedRoom) {
    alert("Selecione uma sala para excluir.")
    return
  }

  try {
    await api.post(`/app/room/delete/${selectedRoom.id}`)
    alert("Sala excluída com sucesso!")
    window.location.reload()
  } catch (err) {
    alert("Erro ao excluir sala")
    console.error(err)
  }
}

function handleCardClick(room) {
  setSelectedRoom(room)
  nameRef.current.value = room.name
  descriptionRef.current.value = room.description
}

async function btnEdit(e) {
  e.preventDefault()

  if (!selectedRoom) {
    alert("Selecione uma sala para editar.")
    return
  }

  const formData = new FormData()
  formData.append("name", nameRef.current.value)
  if (imagem) {
    formData.append("image", imagem)
  }

  try {
    await api.post(`/app/room/update/${selectedRoom.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    alert("Sala editada com sucesso!")
    window.location.reload()
  } catch (err) {
    alert("Erro ao editar sala")
    console.error(err)
  }
}

async function IniciarSala(e){
  e.preventDefault()

  if (!selectedRoom) {
    alert("Selecione uma sala para iniciar.")
    return
  }

  try{
    await api.post(`/app/room/play/${selectedRoom.id}`);

    alert("Sala iniciada com sucesso!")
    window.location.reload()
  }catch(error){
    alert("Erro ao iniciar sala!")
    console.error("Mensagem de error: ", error)
  }
}

async function FinalizarSala(e){
  e.preventDefault()

  if (!selectedRoom) {
    alert("Selecione uma sala para finalizar.")
    return
  }

  try{
    await api.post(`/app/room/finish/${selectedRoom.id}`)

    alert("Sala finalizada com sucesso!")
    window.location.reload()
  }catch(error){
    alert("Erro ao finalizar sala!")
    console.error("Mensagem de error: ", error)
  }
}

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <Header/>

    <div className="input  flex-column align-items-center rounded">

      <form encType="multipart/form-data">
          <p className="fw-bold fs-3 left">Editar Sala</p>

      <div className="mb-3 text-center">
        {preview ? (
          <img src={preview} alt="Pré-visualização" style={{ maxHeight: '200px', borderRadius: '10px' }} />
        ) : selectedRoom?.image && (
          <img
          src={`http://localhost:1200/${selectedRoom.image.replace(/^uploads\//, '')}`}
          alt="Imagem atual"
          style={{ maxHeight: '200px', borderRadius: '10px' }}
          />
        )}
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

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="description"
              placeholder="Descrição"
              ref={descriptionRef}
              required
            />
            <label htmlFor="floatingInput">Descrição</label>
          </div>

          <div className="row">
            <div className="col-6">
              <button type="submit" className="btnEdit mb-2" onClick={btnEdit}>
                EDITAR
            </button>

            <button type="submit" className="btnDelete" onClick={btnDelete}>
                EXCLUIR
            </button>
            </div>

            <div className='col-6'>
              <button type="submit" className="btnIniciar mb-2" onClick={IniciarSala}>
                INICIAR SALA
            </button>

            <button type="submit" className="btnFinalizar" onClick={FinalizarSala}>
                FINALIZAR SALA
            </button>
            </div>
          </div>
          
        </form>
    </div>

    <div className="lst-container">
      <h1 className="lst-title">Salas Cadastradas</h1>
      <div className="lst-grid">
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <RoomCardEdit
            key={room.id}
            name={room.name}
            description={room.description}
            image={room.image}
            onClick={() => handleCardClick(room)}
          />
        ))
      ) : (
        <h5>Nenhuma sala encontrada.</h5>
      )}
      </div>
    </div>
    </div>
  )
}

export default RoomEdit
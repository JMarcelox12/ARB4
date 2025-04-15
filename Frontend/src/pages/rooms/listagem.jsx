import React, { useEffect, useState } from 'react'
import { RoomCardListUser } from '../../components/salas/card.jsx'
import '../../styles/lst.css'
import api from "../../services/api.js"
import { HeaderLogado } from '../cabecalho.jsx'

const RoomList = () => {
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get("/app/room/list")
        setRooms(response.data)
      } catch (err) {
        console.error("Erro ao buscar salas:", err)
      }
    }
  
    fetchRooms()
  }, [])

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <HeaderLogado/>
    <div className="room-container">
      <h1 className="title">Salas Disponíveis</h1>
      <div className="room-grid">
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <RoomCardListUser
            key={room.id}
            name={room.name}
            description={room.description}
            image={room.image}
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

export default RoomList
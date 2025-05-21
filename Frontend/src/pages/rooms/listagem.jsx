import React, { useEffect, useState } from 'react'
import { RoomCardListUser } from '../../components/salas/card.jsx'
import '../../styles/global.css'
import api from "../../services/api.js"
import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext } from 'react'
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';

const RoomList = () => {
  const [rooms, setRooms] = useState([])
  const { userLogado } = useContext(AuthContext)

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get("/app/room/rooms")
        setRooms(response.data)
      } catch (err) {
        console.error("Erro ao buscar salas:", err)
      }
    }
  
    fetchRooms()
  }, [])

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}
    <div className="input flex-column align-items-center rounded">
      <h1 className="lst-title">Salas Disponíveis</h1>
      <div className="lst-grid">
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
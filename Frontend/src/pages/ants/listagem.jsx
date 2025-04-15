import React, { useEffect, useState } from 'react'
import { AntCardListUser } from '../../components/formigas/card.jsx'
import '../../styles/lst.css'
import api from "../../services/api.js"
import { HeaderLogado } from '../cabecalho.jsx'

const AntList = () => {
  const [ants, setAnts] = useState([])

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

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <HeaderLogado/>
    <div className="ant-container">
      <h1 className="title">Formigas Cadastradas</h1>
      <div className="ant-grid">
      {ants.length > 0 ? (
        ants.map((ant) => (
          <AntCardListUser
            key={ant.id}
            name={ant.name}
            odd={ant.odd}
            image={ant.image}
            win={ant.win}
            game={ant.game}
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

export default AntList
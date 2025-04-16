import React, { useEffect, useState } from 'react'
import { AntCardListUser } from '../../components/formigas/card.jsx'
import '../../styles/lst.css'
import api from "../../services/api.js"
import { HeaderLogado } from '../cabecalho.jsx'

const BetList = () => {
  const [bets, setBets] = useState([])

  useEffect(() => {
    async function fetchBets() {
      try {
        const response = await api.get("/app/bet/list")
        setBets(response.data)
      } catch (err) {
        console.error("Erro ao buscar apostas:", err)
      }
    }
  
    fetchAnts()
  }, [])

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <HeaderLogado/>
    <div className="ant-container">
      <h1 className="title">Apostas Cadastradas</h1>
      <div className="ant-grid">
      {bets.length > 0 ? (
        bets.map((bet) => (
          <AntCardListUser
            key={bet.id}
            name={bet.name}
            odd={bet.odd}
            image={bet.image}
            win={bet.win}
            game={bet.game}
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

export default BetList
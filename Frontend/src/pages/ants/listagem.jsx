import React, { useEffect, useState } from 'react'
import { AntCardListUser } from '../../components/formigas/card.jsx'
import '../../styles/global.css'
import api from "../../services/api.js"
import { AuthContext } from '../../services/AuthContext.jsx'
import { useContext } from 'react'
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';

const AntList = () => {
  const [ants, setAnts] = useState([])
  const { userLogado } = useContext(AuthContext)


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
       {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}
    <div className="lst-container">
      <h1 className="lst-title">Formigas Cadastradas</h1>
      <div className="lst-grid">
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
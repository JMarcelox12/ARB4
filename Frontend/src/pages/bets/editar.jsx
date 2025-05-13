import React, { useEffect, useState, useRef } from 'react'
import { BetCardEdit } from '../../components/apostas/card.jsx'
import '../../styles/global.css'
import api from "../../services/api.js"
import { Header } from '../cabecalho.jsx'

const BetEdit = () => {
  const [bets, setBets] = useState([])
  const [selectedBet, setSelectedBet] = useState(null)
  const [ value, setValue ] = useState("10,00")
  const [ ganho, setGanho ] = useState("vazio")

  useEffect(() => {
    async function fetchBets() {
      const response = await api.get("/app/bet/list")
      setBets(response.data)
    }
    fetchBets()
  }, [])
  
async function btnDelete(e) {
  e.preventDefault()

  if (!selectedBet) {
    alert("Selecione uma aposta para excluir.")
    return
  }

  try {
    await api.post(`/app/bet/delete/${selectedBet.id}`)
    alert("Sala excluída com sucesso!")
    window.location.reload()
  } catch (err) {
    alert("Erro ao excluir aposta")
    console.error(err)
  }
}

function handleCardClick(bet) {
  setSelectedRoom(bet)
  amountRef.current.value = bet.name
}

async function handleSubmit(e) {
  e.preventDefault()

  if (!selectedBet) {
    alert("Selecione uma aposta para editar.")
    return
  }

  const formData = new FormData()
  formData.append("name", amountRef.current.value)
  if (imagem) {
    formData.append("image", imagem)
  }

  try {
    await api.post(`/app/bet/update/${selectedBet.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    alert("Aposta editada com sucesso!")
    window.location.reload()
  } catch (err) {
    alert("Erro ao editar aposta")
    console.error(err)
  }
}

const handleChange = (e) => {
    setValue(formatMoney(e.target.value));
};

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <Header/>

    <div className="input  flex-column align-items-center rounded">

      <form encType="multipart/form-data">
          <p className="fw-bold fs-3 left">Editar Aposta</p>

      <div className="mb-3 text-center">
      </div>

      <div className="form-floating mb-3">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-white title">R$</span>
            <input
              type="text" step="1" min="20"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              style={{paddingLeft: "3.75rem"}}
              id="value"
              placeholder="0,00"
              value={value}
              onChange={handleChange}
              required
            >
            </input>
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-transparent border-success rounded py-2 text-white"
              id="ganho"
              placeholder="Text"
              value={ganho}
              onChange={handleChange}
              disabled
            />
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

    <div className="lst-container">
      <h1 className="lst-title">Apostas Cadastradas</h1>
      <div className="lst-grid">
      {bets.length > 0 ? (
        ants.map((bet) => (
          <BetCardEdit
            key={bet.id}
            status={bet.status}
            createdAt={bet.createdAt}
            amount={bet.amount}
            ant={bet.ant}
            onClick={() => handleCardClick(bet)}
          />
        ))
      ) : (
        <h5>Nenhuma aposta encontrada.</h5>
      )}
      </div>
    </div>
    </div>
  )
}

export default BetEdit
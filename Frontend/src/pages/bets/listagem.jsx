import React, { useEffect, useState } from 'react'
import { BetCardList } from '../../components/apostas/card.jsx'
import '../../styles/lst.css'
import { jwtDecode } from "jwt-decode";
import api from "../../services/api.js"
import { HeaderLogado } from '../cabecalho.jsx'

const BetList = () => {
  const [bets, setBets] = useState([])

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      return null;
    }
  };

  useEffect(() => {
    async function fetchBets() {
      try {
        const id = getUserIdFromToken();
      if (!id) {
        alert("Erro: usuário não autenticado.");
        return;
      }

        const response = await api.get(`/app/bet/user/${id}`)
        setBets(response.data)
      } catch (err) {
        console.error("Erro ao buscar apostas:", err)
      }
    }
  
    fetchBets()
  }, [])

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <HeaderLogado/>
    <div className="ant-container">
      <h1 className="title">Apostas Cadastradas</h1>
      <div className="ant-grid">
      {bets.length > 0 ? (
        bets.map((bet) => (
          <BetCardList
            status={bet.status}
            createdAt={bet.createdAt}
            amount={bet.amount}
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

export default BetList
import React, { useEffect, useState } from 'react';
import { BetCardList } from '../../components/apostas/card.jsx';
import '../../styles/global.css';
import { jwtDecode } from "jwt-decode";
import api from "../../services/api.js";
import { HeaderLogado } from '../cabecalho.jsx';

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

const BetList = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBets() {
      try {
        const id = getUserIdFromToken();
        if (!id) {
          setError("Erro: usuário não autenticado.");
          setLoading(false);
          return;
        }

        const response = await api.get(`/app/bet/user/${id}`);

        setBets(response.data.bets || []); 
        
      } catch (err) {
        console.error("Erro ao buscar apostas:", err);
        setError("Não foi possível carregar as apostas.");
      } finally {
        setLoading(false);
      }
    }
  
    fetchBets();
  }, []);

  const renderContent = () => {
    if (loading) return <h5>Carregando suas apostas...</h5>;
    if (error) return <h5>{error}</h5>;

    if (bets.length > 0) {
      return [...bets].reverse().map((bet) => (
        <BetCardList
          key={bet.id}
          status={bet.status}
          createdAt={bet.createdAt}
          amount={bet.amount}
          ant={bet.ant}
        />
      ));
    }
    
    return <h5>Nenhuma aposta encontrada.</h5>;
  }

  return (
    <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
      <HeaderLogado/>
      <div className="lst-container">
        <h1 className="lst-title">Minhas Apostas</h1>
        <div className="lst-grid">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default BetList;
import "../../styles/global.css"
import { useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";
import api from "../../services/api.js"
import { TransactionCardList } from "../../components/transacoes/card.jsx";
import { HeaderLogado } from "../cabecalho.jsx"


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

const TransactionList = () => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTransactions() {
        try {
            const id = getUserIdFromToken();

        if (!id) {
            setError("Usuário não autenticado. Faça o login para ver suas transações.");
            setLoading(false);
            return;
        }

            const response = await api.get(`/app/user/transactions/${id}`)
            setTransactions(response.data)
        } catch (err) {
            console.error("Erro ao buscar apostas:", err)
        } finally {
            setLoading(false);
        }
        }
    
        fetchTransactions()
    }, [])

    const renderContent = () => {
        if (loading) {
            return <h5>Carregando transações...</h5>;
        }

        if (error) {
            return <h5>{error}</h5>;
        }

        if (transactions.length === 0) {
            return <h5>Nenhuma transação encontrada.</h5>;
        }

        return (
            [...transactions].reverse().map((transacao) => (
                <TransactionCardList
                    key={transacao.id}
                    createdAt={transacao.createdAt}
                    amount={transacao.amount}
                    type={transacao.type}
                />
            ))
        );
    };

    return (
        <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
            <HeaderLogado />
            <div className="lst-container">
                <h1 className="lst-title">Minhas Transações</h1>
                <div className="lst-grid">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default TransactionList
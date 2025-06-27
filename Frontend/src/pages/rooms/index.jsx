import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext, useEffect, useState, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';
import "../../styles/rooms/room.css";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
import { campea, vice, ultimo, penultimo } from "../../services/oddCalc.js";
import AntRaceChart from "../../components/salas/AntRaceChart.jsx";
import RankingPodium from "../../components/salas/RankingPodium.jsx";
import ModalAposta from "../../components/salas/modal.jsx";
import { io } from "socket.io-client";

// Função helper para o token, pode ficar fora do componente
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

const Room = () => {
  const { userLogado } = useContext(AuthContext);
  const { id: roomId } = useParams();
  const userId = getUserIdFromToken();

  // Estados da Sala
  const [formigasSala, setFormigasSala] = useState([]);
  const [status, setStatus] = useState('carregando');
  const [tempoRestante, setTempoRestante] = useState(0);
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoanding] = useState(true);

  // Estados da Corrida
  const [antPositions, setAntPositions] = useState({});
  const [winnerId, setWinnerId] = useState(null); // Renomeado para consistência
  const [finalOrder, setFinalOrder] = useState([]);

  // <<-- ALTERAÇÃO PRINCIPAL: Gerenciamento do Socket -->>
  // Usamos useRef para manter a mesma instância do socket durante todo o ciclo de vida do componente.
  const socketRef = useRef(null);

  // Efeito para carregar dados iniciais da sala via API (HTTP)
  useEffect(() => {
    async function carregarDadosIniciaisSala() {
      try {
        const antsResponse = await api.get(`app/room/ants/${roomId}`);
        setFormigasSala(antsResponse.data);
      } catch (erro) {
        console.error("Erro ao carregar dados iniciais da sala:", erro);
        setStatus('erro');
      }
    }
    carregarDadosIniciaisSala();
  }, [roomId]);

  // Efeito para gerenciar TODA a comunicação com o Socket.IO
  useEffect(() => {
    // Só executa se tivermos o ID da sala.
    if (!roomId) return;

    // Conecta ao servidor Socket.IO.
    // A instância é armazenada em socketRef.current para persistir.
    socketRef.current = io('http://localhost:1200', { // Altere para a sua URL de produção se necessário
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current; // Criamos uma variável local para facilitar o uso

    // Lida com a conexão
    socket.on('connect', () => {
      console.log(`[Socket] Conectado! ID: ${socket.id}. Entrando na sala: ${roomId}`);
      socket.emit('join_room', roomId);
    });

    // Listener para o estado da sala
    socket.on('room_state_update', (data) => {
      setTempoRestante(data.tempoRestante);
      setStatus(data.status);

      // Quando a fase volta para 'APOSTANDO', reseta o pódio e as posições
      if (data.status === 'APOSTANDO' || data.status === 'PAUSE') {
        const initialPositions = {};
        formigasSala.forEach(ant => {
          initialPositions[ant.id] = 0;
        });
        setAntPositions(initialPositions);
        setWinnerId(null);
        setFinalOrder([]);
      }
    });

    // Listener para a atualização das posições durante a corrida
    socket.on('race_update', (data) => {
      const newPositions = data.ants.reduce((acc, ant) => {
        acc[ant.id] = ant.position;
        return acc;
      }, {});
      setAntPositions(prev => ({...prev, ...newPositions}));
    });

    // Listener para o final da corrida (exibição do pódio)
    socket.on('race_finished', (data) => {
      console.log('[Socket] Corrida finalizada:', data);
      setWinnerId(data.winnerId);
      setFinalOrder(data.finishedAntsOrder);
      // Força a posição final para 100% para quem terminou
      const finalPositions = {};
        formigasSala.forEach(f => {
          if(data.finishedAntsOrder.includes(f.id)){
            finalPositions[f.id] = 100
          }
        });
      setAntPositions(prev => ({...prev, ...finalPositions}));
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Desconectado do servidor.');
    });

    // Função de limpeza: executada quando o componente é desmontado
    return () => {
      console.log('[Socket] Desmontando componente. Desconectando...');
      socket.emit('leave_room', roomId);
      socket.disconnect();
    };
  }, [roomId, formigasSala]); // Depende de roomId para reconectar se a sala mudar, e formigasSala para resetar posições.

  // O componente AntRaceChart só renderiza quando já temos as formigas e o estado não é de pódio.
  const deveMostrarCorrida = status !== 'ENCERRADA' && status !== 'carregando';
  const deveMostrarPodium = status === 'ENCERRADA' && finalOrder.length > 0;

  if (status === 'carregando' || userLogado === null) {
    return (
      <div className="bg-dark text-white d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <h2>Carregando dados da sala...</h2>
      </div>
    );
  }
  
  // Função helper para exibir o nome do vencedor. Movida para dentro do escopo.
  const getWinnerName = (id) => {
    if (!id) return '';
    const winnerAnt = formigasSala.find(f => f.id === id);
    return winnerAnt ? winnerAnt.name : `Formiga #${id}`;
  };

  return (
    <div className="bg-dark text-white">
      {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

      <div className={`row conteudo-area ${modal ? "com-lateral" : ""}`} style={{ margin: "6%", transition: "all 0.3s ease" }}>
        <div className="container-room">
          <div className="row">
            <div className="col">
              <div className={`cronometro-area status-${status}`}>
                <div className="status-label title">{status.toUpperCase()}</div>
                <div className={`tempo`}>
                  {String(Math.floor(tempoRestante / 60)).padStart(2, '0')}:
                  {String(tempoRestante % 60).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`info-sala cronometro-area status-${status}`}>
                <div className="titulo">SALA #{roomId}</div>
                <p className="status-label title"><strong>Formigas na corrida: {formigasSala.length}</strong></p>
                {winnerId && <p className="status-label title"><strong>Último Vencedor: </strong>{getWinnerName(winnerId)}</p>}
              </div>
            </div>
          </div>

          {deveMostrarPodium && (
            <RankingPodium finalOrder={finalOrder} ants={formigasSala} />
          )}

          {deveMostrarCorrida && (
            <AntRaceChart
              socket={socketRef.current} // <<-- AQUI PASSAMOS O SOCKET PARA O FILHO
              ants={formigasSala}
              antPositions={antPositions}
              winnerId={winnerId}
            />
          )}

          {/* Resto do seu JSX (tabela, botão de aposta, modal) */}
          <div>
            <table className="table table-success table-striped">
              {/* Conteúdo da tabela ... */}
               <thead>
                  <tr className="table-dark">
                    <th scope="col">#</th>
                    <th scope="col">IMAGEM</th>
                    <th scope="col">NOME</th>
                    <th scope="col">1ª</th>
                    <th scope="col">2ª</th>
                    <th scope="col">7ª</th>
                    <th scope="col">8ª</th>
                  </tr>
                </thead>
                <tbody>
                  {formigasSala.map((formiga, index) => (
                    <tr
                      key={formiga.id}
                    >
                    <th scope="row" className="titulo">{index + 1}</th>
                    <td className="titulo">{formiga.name}</td>
                    <td><p className="titulo">{formiga.name}</p></td>
                    <td><p className="titulo">
                      {campea(formiga.odd)}</p></td>
                    <td><p className="titulo">
                      {vice(formiga.odd)}</p></td>
                    <td><p className="titulo">
                      {penultimo(formiga.odd)}</p></td>
                    <td><p className="titulo">
                      {ultimo(formiga.odd)}</p></td>
                  </tr>
                  ))}
                </tbody>
            </table>
          </div>
          {status === 'APOSTANDO' && (
            <button type="submit" className="btnVerde" style={{ borderRadius: "10px" }} onClick={() => setModal(true)}>
              CLIQUE PARA APOSTAR
            </button>
          )}
        </div>
      </div>
      {modal && userLogado && (
        <ModalAposta
          visible={modal}
          onClose={() => setModal(false)}
          formigasSala={formigasSala}
          roomId={roomId}
          userId={userId}
        />
      )}
    </div>
  );
};

export default Room;
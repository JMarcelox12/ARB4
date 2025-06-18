import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext, useEffect, useState, useRef } from 'react'; // Adicionei useRef
import { jwtDecode } from "jwt-decode";
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';
import "../../styles/room.css";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
import { campea, vice, ultimo, penultimo } from "../../services/oddCalc.js";
import AntRaceChart from "../../components/salas/AntRaceChart.jsx";
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
  const { id: roomId } = useParams(); // Renomear para clareza
  const userId = getUserIdFromToken();

  // Estados da Sala
  const [formigasSala, setFormigasSala] = useState([]);
  const [status, setStatus] = useState('carregando'); // Inicia como carregando
  const [tempoRestante, setTempoRestante] = useState(0);
  const [modal, setModal] = useState(false);

  // Estados da Corrida
  const [antPositions, setAntPositions] = useState({}); // Agora será um objeto { antId: position }
  const [winner, setWinner] = useState(null);
  const [finalOrder, setFinalOrder] = useState([]);
  
  // --- CORREÇÃO PRINCIPAL: GERENCIAMENTO ÚNICO DO SOCKET ---
  // Usamos useRef para manter a mesma instância do socket durante todo o ciclo de vida do componente
  const socketRef = useRef(null);

  // Efeito para carregar dados iniciais via API (HTTP)
  useEffect(() => {
    async function carregarDadosIniciaisSala() {
      try {
        const [statusResponse, formigasResponse] = await Promise.all([
          api.get(`/app/room/status/${roomId}`),
          api.get(`/app/room/ants/${roomId}`)
        ]);
        setStatus(statusResponse.data.status);
        setFormigasSala(formigasResponse.data);
      } catch (erro) {
        console.error("Erro ao carregar dados iniciais da sala:", erro);
        setStatus('erro');
      }
    }
    carregarDadosIniciaisSala();
  }, [roomId]);

  // Efeito para gerenciar TODA a comunicação com o Socket.IO
  useEffect(() => {
    // 1. Conecta ao servidor
    // Acessamos o servidor pelo endereço no .env ou hardcoded
    socketRef.current = io('http://localhost:1200', {
      reconnectionAttempts: 5, // Tenta reconectar 5 vezes
    });

    const socket = socketRef.current;

    // 2. Avisa o backend que entramos na sala
    socket.on('connect', () => {
      console.log(`Frontend: Conectado! ID: ${socket.id}. Entrando na sala: ${roomId}`);
      socket.emit('join_room', roomId);
    });
    
    // 3. Define todos os listeners
    socket.on('room_state_update', (data) => {
    setTempoRestante(data.tempoRestante);
    setStatus(data.status);

    if (data.status === 'apostando' || data.status === 'pausando') {
      // Cria um objeto com todas as formigas na posição 0
      const initialPositions = {};
      formigasSala.forEach(ant => {
        initialPositions[ant.id] = 0;
      });
      setAntPositions(initialPositions); // <-- AGORA INICIALIZA EM 0%
      
      setWinner(null);
      setFinalOrder([]);
    }
    });

    socket.on('race_update', (data) => {
      //console.log('RACE_UPDATE:', data.ants);
      // Transforma o array de formigas em um objeto para fácil acesso
      const newPositions = {};
      data.ants.forEach(ant => {
        newPositions[ant.id] = ant.position;
      });
      setAntPositions(newPositions);
    });

    socket.on('race_finished', (data) => {
      console.log('Frontend: CORRIDA TERMINOU!', data);
      setWinner(data.winnerId);
      setFinalOrder(data.finishedAntsOrder);
      // Opcional: forçar as posições finais para 100% para os vencedores
      const finalPositions = {};
      formigasSala.forEach(f => {
        finalPositions[f.id] = data.finishedAntsOrder.includes(f.id) ? 100 : antPositions[f.id] || 0;
      });
      setAntPositions(finalPositions);
    });

    socket.on('disconnect', () => {
      console.log('Frontend: Desconectado do servidor Socket.IO.');
    });

    // 4. Limpeza ao sair do componente
    return () => {
      console.log('Frontend: Desmontando componente. Desconectando socket.');
      socket.emit('leave_room', roomId);
      socket.disconnect();
    };
  }, [roomId]); // Este efeito depende apenas do roomId

  const show = () => setModal(!modal);
  
  if (status === 'carregando' || userLogado === null) {
    return (
      <div className="bg-dark text-white d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <h2>Carregando dados da sala...</h2>
      </div>
    );
  }
  
  // O resto do seu JSX continua aqui, com algumas pequenas mudanças
  // ...
  return (
    <div className="bg-dark text-white" >
      {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

      <div className={`row conteudo-area ${modal ? "com-lateral" : ""}`} style={{ margin: "6%", transition: "all 0.3s ease" }}>
        <div className="container-room">
          {/* ... seu código para cronômetro e info ... */}
          <div className="row">
              <div className="col" >
                <div className={`cronometro-area status-${status}`}>
                  <div className="status-label title">Status: {status.toUpperCase()}</div>
                  <div className={`tempo`}>
                    {String(Math.floor(tempoRestante / 60)).padStart(2, '0')}:
                    {String(tempoRestante % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>

              <div className="col">
                <div className={`info-sala cronometro-area status-${status}`}>
                  <div className="titulo">SALA #{roomId}</div>
                  <p className="status-label title"><strong>Status:</strong> {status}</p>
                  <p className="status-label title"><strong>Tempo restante:</strong> {tempoRestante}s</p>
                  <p className="status-label title"><strong>Formigas na corrida: {formigasSala.length}</strong></p>
                   {/* Exibir o vencedor aqui se houver */}
                  {winner && <p className="status-label title"><strong>Vencedor:</strong> Formiga {winner}</p>}
                </div>
              </div>
            </div>

            <AntRaceChart
              ants={formigasSala}
              antPositions={antPositions}
              winnerId={winner}
            />

          {/* ... resto do seu código da tabela e modal ... */}
          <div>
              <table className="table table-success table-striped">
                <thead>
                  <tr className="table-dark">
                    <th scope="col">#</th>
                    <th scope="col">IMAGEM</th>
                    <th scope="col">NOME</th>
                    <th scope="col">CAMPEÃ</th>
                    <th scope="col">VICE</th>
                    <th scope="col">PENÚLTIMA</th>
                    <th scope="col">ÚLTIMA</th>
                  </tr>
                </thead>
                <tbody>
                  {formigasSala.map((formiga, index) => (
                    <tr
                      key={formiga.id}
                    >
                    <th scope="row" className="titulo">{index + 1}</th>
                    <td className="titulo">{formiga.name}</td>
                    <td className="titulo">{formiga.name}</td>
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
            <button type="submit" className="btnVerde" style={{borderRadius: "10px"}} onClick={show}>
              CLIQUE PARA APOSTAR
            </button>
        </div>
      </div>
      {modal && userLogado && (
          <ModalAposta
            visible={modal}
            onClose={show}
            formigasSala={formigasSala}
            roomId={roomId}
            userId={userId}
          />
        )};
    </div>
  );
};

function ModalAposta({ visible, onClose, formigasSala, roomId, userId }) {
  const [formigaSelecionada, setFormigaSelecionada] = useState("");
  const [posicaoSelecionada, setPosicaoSelecionada] = useState("");
  const [value, setValue] = useState("0,00");
  const [odd, setOdd] = useState("0,00");
  const { userLogado } = useContext(AuthContext)

  useEffect(() => {
  const formiga = formigasSala.find(f => f.id == formigaSelecionada);

  if (formiga && posicaoSelecionada) {
    const oddOriginal = formiga.odd;
    let novaOdd = "0.00";

    switch (posicaoSelecionada.toLowerCase()) {
      case "campeão":
        novaOdd = campea(oddOriginal);
        break;
      case "vice":
        novaOdd = vice(oddOriginal);
        break;
      case "penúltima":
        novaOdd = penultimo(oddOriginal);
        break;
      case "última":
        novaOdd = ultimo(oddOriginal);
        break;
      default:
        novaOdd = "0.00";
    }

    setOdd(novaOdd);
  }
}, [formigaSelecionada, posicaoSelecionada, formigasSala]);

  const handleChangeFormiga = (e) => {
    setFormigaSelecionada(e.target.value);
    console.log(formigaSelecionada)
  };

  const handleChangePosicao = (e) => {
    setPosicaoSelecionada(e.target.value);
  };

  const formatMoney = (val) => {
    val = val.replace(/\D/g, "");
    if (!val) return "0,00";
    val = (parseFloat(val) / 100).toFixed(2);
    return val.replace(".", ",");
  };

  const handleChangeValue = (e) => {
    setValue(formatMoney(e.target.value));
  };

  async function handleApostar (e) {
    e.preventDefault()

    if (userLogado === false) {
    alert("Você precisa estar logado para apostar.");
    return;
    }

    const formData = new FormData()
    formData.append("userId", userId);
    formData.append("antId", formigaSelecionada);
    formData.append("roomId", roomId)
    formData.append("value", value.replace(",", "."));
    formData.append("betType", posicaoSelecionada.toUpperCase())

    try {
      const response = await api.post("/app/bet/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log(response.data)
      alert("Aposta criada com sucesso!")
      onClose();
    } catch (err) {
      alert("Erro ao criar sala!")
      console.error(err)
    }
  };

  if (!visible) return null;

  const returne = (a,b) =>{
    const money = parseFloat(a.replace(",", ".")) || 0;
    const odd = parseFloat(b.replace(",",".")) || 0;
    let result = money * odd;
    return result.toFixed(2).replace(".", ",");
  }

  const verificarType = () => {
    //fazer um verificador de fazes
  }

  return (
    <div className="painel-lateral bg-dark text-white p-4">
      <h1>Fazer Aposta</h1>

      <label htmlFor="formigaSelect" className="form-label">Informe o valor de aposta:</label>
      <input
        type="text" step="1" min="20"
        className="form-control bg-transparent border-success rounded py-2 text-white"
        id="value"
        placeholder="0,00"
        value={value}
        onChange={handleChangeValue}
        required
      />

      <label htmlFor="formigaSelect" className="form-label mt-2">Escolha a formiga:</label>
      <select className="form-select mb-4" id="formigaSelect" value={formigaSelecionada} onChange={handleChangeFormiga}>
        <option>-- Selecione uma formiga --</option>
        {formigasSala.map((formiga) => (
          <option key={formiga.id} value={formiga.id}>{formiga.name}</option>
        ))}
      </select>

      <label htmlFor="posicaoSelect" className="form-label">Escolha a posição:</label>
      <select className="form-select mb-4" id="posicaoSelect" value={posicaoSelecionada} onChange={handleChangePosicao}>
        <option>-- Selecione uma posição --</option>
        <option>Campeão</option>
        <option>Vice</option>
        <option>Penúltima</option>
        <option>Última</option>
      </select>

      <div className="row">
        <div className="col">
          <label htmlFor="formigaSelect" className="form-label">APOSTADO</label>
          <input
            type="text" step="1" min="20"
            className="form-control bg-transparent border-success rounded text-white odd"
            id="valuePreview"
            placeholder="0,00"
            value={value}
            onChange={handleChangeValue}
            disabled
          />
        </div>

        <div className="col">
          <label htmlFor="formigaSelect" className="form-label">ODD</label>
          <input
            type="text" step="1" min="20"
            className="form-control bg-transparent border-success rounded text-white odd"
            id="oddValue"
            placeholder="0,00"
            value={odd}
            onChange={handleChangeValue}
            disabled
          />
        </div>
      </div>

      <label htmlFor="formigaSelect" className="form-label">RETORNO</label>
      <input
        type="text" step="1" min="20"
        className="form-control bg-transparent border-success rounded text-white odd"
        id="returnValue"
        placeholder="0,00"
        value={returne(value, odd)}
        onChange={handleChangeValue}
        disabled
      />

      <div className="d-flex justify-content-end gap-2 row">
        <button className="btnDelete" onClick={onClose}>Cancelar</button>
        <button className="btnVerde" onClick={handleApostar}
         disabled={!formigaSelecionada || !posicaoSelecionada || parseFloat(value.replace(",", ".")) < 2}
        >Apostar</button>
      </div>

    </div>
  );
}


export default Room
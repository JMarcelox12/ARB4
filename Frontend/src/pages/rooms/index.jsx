import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext } from 'react'
import { jwtDecode } from "jwt-decode";
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';
import { useEffect, useState } from "react";
import "../../styles/room.css"
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
import { campea, vice, ultimo, penultimo} from "../../services/oddCalc.js";
import AntRace from "../../components/salas/AntRace.jsx";
import AntRaceChart from "../../components/salas/AntRaceChart.jsx";

const Room = () => {
  const { userLogado } = useContext(AuthContext)
  const [ formigasSala, setFormigasSala ] = useState([])
  const [ status, setStatus] = useState('')
  const [ tempoRestante, setTempoRestante ] = useState(30);
  const { id } = useParams();
  const [ modal, setModal ] = useState(false)

  if (userLogado === null) {
    return (
      <div className="bg-dark text-white d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <h2>Carregando dados do usuário...</h2>
      </div>
    );
  }

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

  const userId = getUserIdFromToken();

   useEffect(() => {
    async function carregarStatus() {
      try {
        const response = await api.get(`/app/room/status/${id}`);
        setStatus(response.data.status); // Ex: "apostando", "correndo", "encerrada"
      } catch (erro) {
        console.error("Erro ao carregar status da sala:", erro);
      }
    }

    carregarStatus();
  
    async function carregarFormigas() {
      try {
        const response = await api.get(`/app/room/ants/${id}`);
        setFormigasSala(response.data);
      } catch (erro) {
        console.error("Erro ao carregar formigas:", erro);
      }
    }

    carregarFormigas();

  }, [id]);

  useEffect(() => {
    let segundos = 0;

    switch (status) {
      case "pausando":
        segundos = 30;
        break;
      case "apostando":
        segundos = 60;
        break;
      case "correndo":
        segundos = 15;
        break;
      default:
        segundos = 0;
    }

    setTempoRestante(segundos);

    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const show = () => {
    setModal(!modal)
  }

    return(
      <div className="bg-dark text-white" >
        {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

        <div className={`row conteudo-area ${modal ? "com-lateral" : ""}`} style={{ margin: "6%", transition: "all 0.3s ease" }}>
          <div className="container-room">

            <div className="row">
              <div className="col" >
                <div className={`cronometro-area status-${status}`}>
                  <div className="status-label title">Status: {status.toUpperCase()}</div>
                  <div className={`tempo status-${status}`}>
                    {String(Math.floor(tempoRestante / 60)).padStart(2, '0')}:
                    {String(tempoRestante % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>

              <div className="col">
                <div className={`info-sala cronometro-area status-${status}`}>
                  <div className="titulo">SALA #{id}</div>
                  <p className="status-label title"><strong>Status:</strong> {status}</p>
                  <p className="status-label title"><strong>Tempo restante:</strong> {tempoRestante}s</p>
                  <p className="status-label title"><strong>Formigas na corrida: {formigasSala.length}</strong></p>
                </div>
              </div>
            </div>

            <div>
              <AntRaceChart/>
            </div>

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
            roomId={id}
            userId={userId}
          />
        )};
      </div>
    );
}

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
import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext } from 'react'
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';
import { useEffect, useState } from "react";
import "../../styles/room.css"
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
import { campea, vice, ultimo, penultimo} from "../../services/oddCalc.js"

const Room = () => {
  const { userLogado } = useContext(AuthContext)
  const [ formigasSala, setFormigasSala ] = useState([])
  const [ status, setStatus] = useState('')
  const { id } = useParams();
  const [ modal, setModal ] = useState(false)

   useEffect(() => {
    async function carregarStatus() {
      try {
        const response = await api.get(`/app/room/status/${id}`);
        setStatusSala(response.data.status); // Ex: "apostando", "correndo", "encerrada"
      } catch (erro) {
        console.error("Erro ao carregar status da sala:", erro);
      }
    }

    carregarStatus();
  
    async function carregarFormigas() {
      try {
        const response = await api.get(`/app/room/${id}/formigas`);
        console.log(response.data)
        setFormigasSala(response.data);
      } catch (erro) {
        console.error("Erro ao carregar formigas:", erro);
      }
    }

    carregarFormigas();

  }, [id]);

  const show = () => {
    setModal(!modal)
  }

    return(
      <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
        {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

        <div className={`row conteudo-area ${modal ? "com-lateral" : ""}`} style={{ margin: "6%", transition: "all 0.3s ease" }}>
          <div>
            <h1>Aqui fica o crônometro da corrida.</h1>
          </div>

          <div>
            <h1>Aqui fica o gráfico da corrida.</h1>
          </div>

          <div className="info-room">
            <h1>Aqui ficam as informações da sala.</h1>
          </div>

          <div>
            <table className="table">
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
                <tr key={formiga.id}>
                  <th scope="row">{index + 1}</th>
                  <td>
                    <img src={formiga.image} alt={formiga.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  </td>
                  <td>{formiga.name}</td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover linha">
                    {campea(formiga.odd)}</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover linha">
                    {vice(formiga.odd)}</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover linha">
                    {penultimo(formiga.odd)}</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover linha">
                    {ultimo(formiga.odd)}</a></td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="submit" className="btn btn-success btnVerde" onClick={show}>
            CLIQUE PARA APOSTAR
          </button>
        </div>
        <ModalAposta
          visible={modal}
          onClose={show}
          formigasSala={formigasSala}
        />
      </div>
    );
}

function ModalAposta({ visible, onClose, formigasSala }) {
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

    const formData = new FormData()
    formData.append("userId", userLogado.id);
    formData.append("antId", formigaSelecionada);
    formData.append("value", value.replace(",", "."));

    try {
      const response = await api.post("/app/bet/bet", formData, {
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
    const money = parseFloat(a);
    const odd = parseFloat(b);
    let result = money * odd;
    return result.toFixed(2);
  }

  const verificarType = () => {
    //fazer um verificador de fazes
  }

  return (
    <div className="painel-lateral bg-dark text-white p-4">
      <h1>Fazer Aposta</h1>

      <label htmlFor="formigaSelect" className="form-label mt-3">Informe o valor de aposta:</label>
      <input
        type="text" step="1" min="20"
        className="form-control bg-transparent border-success rounded py-2 text-white"
        id="value"
        placeholder="0,00"
        value={value}
        onChange={handleChangeValue}
        required
      />

      <label htmlFor="formigaSelect" className="form-label mt-3">Escolha a formiga:</label>
      <select className="form-select mb-4" id="formigaSelect" value={formigaSelecionada} onChange={handleChangeFormiga}>
        <option>-- Selecione uma formiga --</option>
        {formigasSala.map((formiga) => (
          <option key={formiga.id} value={formiga.id}>{formiga.name}</option>
        ))}
      </select>

      <label htmlFor="posicaoSelect" className="form-label mt-3">Escolha a posição:</label>
      <select className="form-select mb-4" id="posicaoSelect" value={posicaoSelecionada} onChange={handleChangePosicao}>
        <option>-- Selecione uma posição --</option>
        <option>Campeão</option>
        <option>Vice</option>
        <option>Penúltima</option>
        <option>Última</option>
      </select>

      <div className="row">
        <div className="col">
          <label htmlFor="formigaSelect" className="form-label mt-3">APOSTADO</label>
          <input
            type="text" step="1" min="20"
            className="form-control bg-transparent border-success rounded py-2 text-white odd"
            id="valuePreview"
            placeholder="0,00"
            value={value}
            onChange={handleChangeValue}
            disabled
          />
        </div>

        <div className="col">
          <label htmlFor="formigaSelect" className="form-label mt-3">ODD</label>
          <input
            type="text" step="1" min="20"
            className="form-control bg-transparent border-success rounded py-2 text-white odd"
            id="oddValue"
            placeholder="0,00"
            value={odd}
            onChange={handleChangeValue}
            disabled
          />
        </div>
      </div>

      <label htmlFor="formigaSelect" className="form-label mt-3">RETORNO</label>
      <input
        type="text" step="1" min="20"
        className="form-control bg-transparent border-success rounded py-2 text-white odd"
        id="returnValue"
        placeholder="0,00"
        value={returne(value, odd)}
        onChange={handleChangeValue}
        disabled
      />

      <div className="d-flex justify-content-end gap-2 row">
        <button className="btn btnDelete" onClick={onClose}>Cancelar</button>
        <button className="btn btnVerde" onClick={handleApostar}
         disabled={!formigaSelecionada || !posicaoSelecionada || parseFloat(value.replace(",", ".")) < 2}
        >Apostar</button>
      </div>

    </div>
  );
}


export default Room
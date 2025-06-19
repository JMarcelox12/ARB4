import "../../styles/rooms/room.css";
import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext, useState, useEffect } from "react";
import { campea, vice, ultimo, penultimo } from "../../services/oddCalc.js";

export default function ModalAposta({ visible, onClose, formigasSala, roomId, userId }) {
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
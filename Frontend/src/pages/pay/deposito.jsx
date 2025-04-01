import '../../styles/home.css';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";

export default function Deposito() {
  const navigate = useNavigate();
  const [value, setValue] = useState("10,00");
  
  const formatMoney = (val) => {
    val = val.replace(/\D/g, "");
    if (!val) return "0,00";
    val = (parseFloat(val) / 100).toFixed(2);
    return val.replace(".", ",");
  };

  const handleChange = (e) => {
    setValue(formatMoney(e.target.value));
  };

  const handlePresetValue = (preset) => {
    setValue(formatMoney(String(preset * 100)));
  };

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

  async function fazerDeposito(e) {
    e.preventDefault();
    try {
      let numericValue = value.replace(/\./g, "").replace(",", ".");
      numericValue = parseFloat(numericValue);

      if (isNaN(numericValue)) {
        alert("Erro: valor inválido!");
        return;
      }

      const id = getUserIdFromToken();
      if (!id) {
        alert("Erro: usuário não autenticado.");
        return;
      }

      if (numericValue >= 10 && numericValue <= 3000) {
        const response = await api.post("/app/user/deposit", {
          id,
          saldo: numericValue,
        });

        if (response.data?.saldo) {
          alert("Depósito realizado com sucesso!");
          window.location.reload();
        } else {
          alert("Erro ao realizar depósito, tente novamente.");
        }
      } else {
        alert("Valor inválido! O valor precisa estar entre R$ 10,00 e R$ 3.000,00");
      }
    } catch (err) {
      console.error("Erro ao processar o depósito:", err.message);
    }
  }



  return (
    <div className="bg-dark text-white" style={{ height: "100vh" }}>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossOrigin="anonymous"
      ></script>

      <header>
        <div className="col align-self-center left">
          <a href="/">
            <img
              src="../../public/imagens/FPFV.png"
              alt="some text"
              className="img"
            />
          </a>
        </div>
      </header>

      <div className="input flex-column align-items-center rounded">
        <form>
          <p className="fw-bold fs-3 left">Informe ou selecione um valor.</p>
          <div className="form-floating mb-3">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-white title">R$</span>
            <input
              type="text" step="1" min="20"
              className="form-control bg-transparent border-success rounded py-2 ps-5 text-white"
              id="value"
              placeholder="0,00"
              value={value}
              onChange={handleChange}
              required
            >
            </input>
          </div>

          <div className="row">
            <div className='col'>
                <button type='button' className="btnVerdePay" onClick={() => handlePresetValue(50)}>R$ 50</button>
            </div>
            <div className='col'>
                <button type='button' className="btnVerdePay" onClick={() => handlePresetValue(100)}>R$ 100</button>
            </div>
            <div className='col'>
                <button type='button' className="btnVerdePay" onClick={() => handlePresetValue(200)}>R$ 200</button>
            </div> 
            <div className='col'>
                <button type='button' className="btnVerdePay" onClick={() => handlePresetValue(1000)}>R$ 1000</button>
            </div> 
            <div className='space-betwen'>
              <a className='title'>MIN 10</a>
              <a className='title'>MAX 3000</a>
            </div>
          </div>
        
          <button type="submit" className="btn btn-success btnVerde" onClick={fazerDeposito}>
            FINALIZAR
          </button>
        </form>
      </div>
    </div>
  )
}

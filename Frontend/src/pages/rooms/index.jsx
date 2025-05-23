import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext } from 'react'
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';
import { useEffect, useState } from "react";
import "../../styles/room.css"
import { useParams } from "react-router-dom";
import api from "../../services/api.js";

const Room = () => {
  const { userLogado } = useContext(AuthContext)
  const [ formigasSala, setFormigasSala ] = useState([])
  const { id } = useParams();
  const [ modal, setModal ] = useState(false)

   useEffect(() => {
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


  const vice = (a) => {
  const j = parseFloat(a)
  let result = 0;

  if (j == 1.1) {
    result = j * 1.4
    return parseFloat(result).toFixed(2)
  } else if (j == 4.94) {
    result = j * 0.7
    return parseFloat(result).toFixed(2)
  } else if (j >= 3.02){
    result = j * 0.7
    return parseFloat(result).toFixed(2)
  } else if (j < 3.02){
    result = j * 0.8
    return parseFloat(result).toFixed(2)
  } else {
    return 3.02
  }
  }

  const penultimo = (a) => {
    const j = parseFloat(a)
    let result = 0;

    if (j == 1.1) {
    result = 4.94
    return parseFloat(result).toFixed(2)
  } else if (j == 4.94) {
    result = 1.1
    return parseFloat(result).toFixed(2)
  } else if (j >= 3.02) {
    result = j * Math.pow(0.85, 5)
    return parseFloat(result).toFixed(2)
  } else if (j < 3.02) {
    result = j * Math.pow(1.15, 5)
    return parseFloat(result).toFixed(2)
  }
  }

  const ultimo = (a) => {
    const j = parseFloat(a)
    let result = 0;

  if (j == 1.1) {
    result = 4.94
    return parseFloat(result).toFixed(2)
  } else if (j == 4.94) {
    result = 1.1
    return parseFloat(result).toFixed(2)
  } else if (j >= 3.02) {
    result = j * Math.pow(0.85, 6)
    return parseFloat(result).toFixed(2)
  } else if (j < 3.02) {
    result = j * Math.pow(1.15, 6)
    return parseFloat(result).toFixed(2)
  }
  }
  

  const verificarType = () => {
    //fazer um verificador de fazes
  }

  const betar = () => {
    //fazer
    /*const response = await prisma.bet.create(`/app/bet/`){
      //fazer
    }*/
  }

  const show = () => {
    //fazer um modal
  }

    return(
      <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
        {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

        <div className="row" style={{margin: "6%"}}>
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
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
                    {formiga.odd}</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
                    {vice(formiga.odd)}</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
                    {penultimo(formiga.odd)}</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
                    {ultimo(formiga.odd)}</a></td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}

export default Room
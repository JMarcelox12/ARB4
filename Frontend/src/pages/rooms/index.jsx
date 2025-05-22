import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext } from 'react'
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';
import { useEffect } from "react";
import "../../styles/room.css"

const Room = () => {
  const { userLogado } = useContext(AuthContext)

  const verificarType = () => {
    //fazer
  }

  const betar = () => {
    //fazer
    /*const response = await prisma.bet.create(`/app/room/`){
      //fazer
    }*/
  }

    return(
      <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
        {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

        <div className="row" style={{margin: "6%"}}>
          <div>
            <h1>Aqui fica o gráfico da corrida.</h1>
          </div>
          <div>
            <h1>Aqui ficam as informações da sala.</h1>
            <div className="info-room"></div>
          </div>
            <h1>Aqui ficam as formigas.</h1>
            <table class="table">
              <thead>
                <tr className="table-dark">
                  <th scope="col">IMAGEM</th>
                  <th scope="col">NOME</th>
                  <th scope="col">CAMPEÃ</th>
                  <th scope="col">VICE</th>
                  <th scope="col">PENÚLTIMA</th>
                  <th scope="col">ÚLTIMA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1</th>
                  <td>Name</td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Otto</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Otto</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Otto</a></td>
                  <td><a className="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Otto</a></td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
    );
}

export default Room
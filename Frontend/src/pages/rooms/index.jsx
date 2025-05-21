import { AuthContext } from "../../services/AuthContext.jsx";
import { useContext } from 'react'
import { HeaderDeslogado, HeaderLogado } from '../cabecalho.jsx';

const Room = () => {
  const { userLogado } = useContext(AuthContext)

    return(
      <div className="bg-dark text-white" style={{ height: "100%", margin: "0%", minHeight: "150dvh" }}>
        {userLogado ? <HeaderLogado /> : <HeaderDeslogado />}

        <div className="row" style={{margin: "6%"}}>
          <div className="col">
            //
          </div>
          <div className="col">
            //
          </div>
          <div className="col end">
            //
          </div>
        </div>
      </div>
    );
}

export default Room
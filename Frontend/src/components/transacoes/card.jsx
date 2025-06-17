export const TransactionCardList = ({ createdAt, type, amount }) => {

  const formatarData = (dataISO) => {
    const dataObj = new Date(dataISO)

    if (isNaN(dataObj.getTime())) {
    console.error("Data de entrada inválida!");
    return {
      dataFormatada: null,
      horaFormatada: null,
    };
    }

     const opcoes = {
    timeZone: 'America/Sao_Paulo',
  };

  const dataFormatada = dataObj.toLocaleDateString('pt-BR', opcoes);

  const horaFormatada = dataObj.toLocaleTimeString('pt-BR', opcoes);

  return { dataFormatada, horaFormatada };
}

const { dataFormatada, horaFormatada } = formatarData(createdAt);

const verificarType = (tipo) => {
    if(tipo === "DEPOSIT"){
        return "DEPÓSITO";
    }else if(tipo === "WITHDRAW"){
        return "SAQUE";
    }else{
        return "DESCONHECIDO"
    }
}

  return (
    <>
    <div 
      className="card text-white bg-secondary m-2"
      style={{ width: '18rem', cursor: "pointer", border: "2px solid #02ad21" }}>
      <div className="card-body">
        <p className="card-text">Data de criação: <strong>{dataFormatada}</strong></p>
        <p className="card-text">Horário: <strong>{horaFormatada}</strong></p>
        <p className="card-text">Valor: <strong>{amount}</strong></p>
        <p className="card-text">Tipo: <strong>{verificarType(type)}</strong></p>
      </div>
    </div>
  </>
  )
}
const modalStyles = {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1050,
    },
  
    modal: {
      backgroundColor: '#2c2c2c',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '30px',
      borderRadius: '8px',
      border: '2px solid #02ad21',
      color: 'white',
      width: '90%',
      maxWidth: '500px',
      textAlign: 'left',
      margin: "0 auto",
      zIndex: 1060,
    },
  
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '15px',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: 'white',
      cursor: 'pointer',
    },
  }
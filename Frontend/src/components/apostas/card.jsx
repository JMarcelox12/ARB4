import React from 'react'
import { useState } from 'react'

export const BetCardList = ({ createdAt, status, amount }) => {
  const [showModal, setShowModal] = useState(false)

  const mudaModal = () => {
    setShowModal(!showModal)
  }

  return (
    <>
    <div 
      className="card text-white bg-secondary m-2"
      style={{ width: '18rem', cursor: "pointer", border: "2px solid #02ad21" }}
      onClick={mudaModal}>
      <div className="card-body">
        <p className="card-text">Probabilidade: <strong>{status}</strong></p>
      </div>
    </div>

  {showModal && (
    <div className="custom-backdrop d-block" style={modalStyles.backdrop} onClick={mudaModal}>
      <div className='custom-modal' style={modalStyles.modal}>
        <div className='card-body'>
        <h3 className="mt-2 card-text">Partidas disputadas: <strong>{amount}</strong></h3>
        <h3 className="mt-2 card-text">Partidas vencidas: <strong>{status}</strong></h3>
        <h3 className="mt-2 card-text">Probabilidade: <strong>{createdAt}</strong></h3>
        </div>
      </div>
    </div>
  )}
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
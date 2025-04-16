import React from 'react'
import { useState } from 'react'

export const RoomCardListUser = ({ name, image, description}) => {
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
      <img 
        src={`http://localhost:1200/${image?.replace(/^uploads\//, '')}`} 
        className="card-img-top" 
        alt={`Imagem da sala ${name}`} 
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
      </div>
    </div>

  {showModal && (
    <div className="custom-backdrop d-block" style={modalStyles.backdrop} onClick={mudaModal}>
      <div className='custom-modal' style={modalStyles.modal}>
        <img
          src={`http://localhost:1200/${image?.replace(/^uploads\//, '')}`}
          alt={`Imagem da formiga ${name}`}
          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '10px' }}
        />
        <div className='card-body'>
        <h1 className="card-title mt-3"><strong>{name}</strong></h1>
        <h3 className="mt-2 card-text">Descrição: <strong>{description}</strong></h3>
        </div>
      </div>
    </div>
  )}
  </>
  )
}

export const RoomCardEdit = ({ name, description, image, onClick }) => {
  return (
    <div 
      className="card text-white bg-secondary border-success m-2" 
      style={{ width: '18rem', cursor: 'pointer' }}
      onClick={onClick}
    >
      <img 
        src={`http://localhost:1200/${image?.replace(/^uploads\//, '')}`} 
        className="card-img-top" 
        alt={`Imagem da sala ${name}`} 
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        <p className="card-text">Descrição: <strong>{description}</strong></p>
      </div>
    </div>
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
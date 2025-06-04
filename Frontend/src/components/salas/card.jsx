import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const RoomCardListUser = ({ id, name, image, description}) => {
  const navigate = useNavigate()

  const irParaSala = () => {
     console.log(id)
    navigate(`/sala/${id}`)
  }

  return (
    <>
    <div 
      className="card text-white bg-secondary m-2"
      style={{ width: '18rem', cursor: "pointer", border: "2px solid #02ad21" }}
      onClick={irParaSala}>
      <img 
        src={`http://localhost:1200/${image?.replace(/^uploads\//, '')}`} 
        className="card-img-top" 
        alt={`Imagem da sala ${name}`} 
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        <h5 className="card-title">Descrição: <strong>{description}</strong></h5>
      </div>
    </div>
  </>
  )
}

export const RoomCardEdit = ({ id, name, description, image, onClick }) => {
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
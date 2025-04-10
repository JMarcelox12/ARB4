import React from 'react'
import './antCard.css'

export const AntCard = ({ name, odd, image }) => {
  return (
    <div className="ant-card">
      <img src={`http://localhost:3000/${image}`} alt={name} className="ant-image" />
      <div className="ant-info">
        <h3>{name}</h3>
        <p><strong>Odd:</strong> {odd}</p>
      </div>
    </div>
  )
}

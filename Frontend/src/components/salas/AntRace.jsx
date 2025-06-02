import { useEffect, useRef, useState } from 'react'
import { Modal } from './modal.jsx'
import { motion } from 'framer-motion'
import useSound from 'use-sound'
import corridaSound from '../../../public/sounds/corridaSound.mp3'
import vitoriaSound from '../../../public/sounds/vitoriaSound.mp3'
import derrotaSound from '../../../public/sounds/derrotaSound.mp3'
import api from "../../services/api.js"
export default function AntRace({ roomId, userId }) {
  const [ants, setAnts] = useState([])
  const [positions, setPositions] = useState([])
  const [result, setResult] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [userBet, setUserBet] = useState(null)
  const [winnerAnt, setWinnerAnt] = useState(null)
  const [win, setWin] = useState(false)
  const [playCorrida] = useSound(corridaSound)
  const [playVitoria] = useSound(vitoriaSound)
  const [playDerrota] = useSound(derrotaSound)

  const SalaId = parseInt(roomId)
  const UserId = parseInt(userId)

  const raceContainerRef = useRef(null)

  useEffect(() => {
    async function fetchRoomData() {
      const { data: room } = await api.get(`/app/room/sala/${SalaId}`)
      setResult(room.result)
      setWinnerAnt(room.winnerId)

      const { data: antsData } = await api.get(`/app/room/ants/${SalaId}`)
      setAnts(antsData)
      setPositions(new Array(antsData.length).fill(0))

      const { data: bets } = await api.get(`/app/bet/bets/${SalaId}`)
      const lastBet = bets.filter(bet => bet.roomId === SalaId).pop()
      setUserBet(lastBet)
    }

    fetchRoomData()
  }, [])

  useEffect(() => {
    if (ants.length === 0 || result.length === 0 || !userBet) return
    let interval
    playCorrida()

    const finishRace = () => {
      clearInterval(interval)
      setPositions(result.map((_, i) => (i + 1) * 100))
      const won = userBet?.status === 'WON'
      setWin(won)
      setTimeout(() => {
        setShowModal(true)
        if (won) {
          playVitoria()
        } else {
          playDerrota()
        }
      }, 1500)
    }

    let count = 0
    interval = setInterval(() => {
      setPositions(prev => prev.map(p => p + Math.random() * 10))
      count++
      if (count >= 50) finishRace()
    }, 100)

    return () => clearInterval(interval)
  }, [ants, result, userBet])

  const winner = ants.find(a => a.id === winnerAnt)

  return (
    <div className="w-full p-4">
      <div ref={raceContainerRef} className="relative h-64 w-full border rounded-xl bg-gray-100 overflow-hidden">
        {ants.map((ant, i) => (
          <motion.img
            key={ant.id}
            src={ant.image}
            alt={ant.name}
            className="absolute h-12"
            style={{ top: i * 50 + 10 }}
            animate={{ x: positions[i] }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold mb-2">
            {win ? 'Parabéns! Você ganhou!' : 'Que pena! Você perdeu.'}
          </h2>
          {userBet && (
            <div>
              <p>
                Sua aposta: <strong>{userBet.type}</strong> na formiga <strong>{userBet.ant.name}</strong>
              </p>
              <p>
                Resultado: <strong>{win ? `+R$${userBet.potentialWin.toFixed(2)}` : '-R$' + userBet.amount.toFixed(2)}</strong>
              </p>
              <p>Formiga vencedora: <strong>{winner?.name}</strong></p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
} 

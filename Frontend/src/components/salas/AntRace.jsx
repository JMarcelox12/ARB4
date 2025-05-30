import { useEffect, useRef, useState } from 'react'
import { Modal, Button } from './modal.jsx'
import { motion } from 'framer-motion'
import useSound from 'use-sound'
import corridaSound from '@/assets/sounds/corrida.mp3'
import vitoriaSound from '@/assets/sounds/vitoria.mp3'
import derrotaSound from '@/assets/sounds/derrota.mp3'
import axios from 'axios'

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

  const raceContainerRef = useRef(null)

  useEffect(() => {
    async function fetchRoomData() {
      const { data: room } = await axios.get(`/api/rooms/${roomId}`)
      setResult(room.resultado)
      setWinnerAnt(room.winnerId)

      const { data: antsData } = await axios.get(`/api/rooms/${roomId}/ants`)
      setAnts(antsData)
      setPositions(new Array(antsData.length).fill(0))

      const { data: bets } = await axios.get(`/api/users/${userId}/bets`)
      const lastBet = bets.filter(bet => bet.roomId === roomId).pop()
      setUserBet(lastBet)
    }

    fetchRoomData()
  }, [roomId, userId])

  useEffect(() => {
    if (ants.length === 0) return
    let interval
    playCorrida()

    const finishRace = () => {
      clearInterval(interval)
      setPositions(result.map((_, i) => (i + 1) * 100))
      const won = userBet?.status === 'WON'
      setWin(won)
      setTimeout(() => {
        setShowModal(true)
        won ? playVitoria() : playDerrota()
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
            </div>
          )}
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Jogar Novamente
          </Button>
        </div>
      </Modal>
    </div>
  )
} 

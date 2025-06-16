import express from 'express'
import cors from 'cors'
import route from './src/routes/index.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import * as roomManager from './src/services/roomManager.js'

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  socket.on('join_room', (roomId) => {
    socket.join(roomId)
    console.log(`${socket.id} joined room ${roomId}`)
    // Opcional: Envie o estado atual da sala para o cliente que acabou de entrar
    if (roomManager.activeRooms[roomId]) {
      socket.emit('room_state_update', {
        status: roomManager.activeRooms[roomId].status,
        tempoRestante: roomManager.activeRooms[roomId].tempoRestante, // Se você tiver isso no roomManager.activeRooms
        winnerId: roomManager.activeRooms[roomId].winnerId,
      })
      // Se a corrida já estiver rolando, envie as posições atuais
      if (
        roomManager.activeRooms[roomId].status === 'correndo' &&
        roomManager.activeRooms[roomId].antPositions
      ) {
        const antsForFrontend = Object.keys(
          roomManager.activeRooms[roomId].antPositions
        ).map((antId) => ({
          id: antId,
          position:
            (roomManager.activeRooms[roomId].antPositions[antId] /
              roomManager.raceLength) *
            100, // Ou passe roomManager.raceLength para o roomManager
        }))
        socket.emit('race_update', {
          roomId: roomId,
          ants: antsForFrontend,
        })
      }
    }
  })

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId)
    console.log(`${socket.id} left room ${roomId}`)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static('uploads'))
app.use('/app', route)

app.get('/', async (req, res) => {
  res.send('ARB funcionando!')
})

export { app, httpServer, io }

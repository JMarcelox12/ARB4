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
      const currentRoomState = roomManager.activeRooms[roomId];
      // ... (envia room_state_update) ...

      if (currentRoomState.status === 'correndo' && currentRoomState.antPositions) {
        console.log('Backend (join_room): activeRooms[roomId].antPositions ao tentar enviar:', currentRoomState.antPositions); // <--- ADICIONE ESTE LOG
        console.log('Backend (join_room): raceLength ao tentar enviar:', currentRoomState.raceLength); // <--- E ESTE LOG

        const raceLength = currentRoomState.raceLength;

        if (raceLength && currentRoomState.antPositions) { // Verifique se antPositions não é null/undefined também
          const antsForFrontend = Object.keys(currentRoomState.antPositions).map(antId => ({
            id: antId,
            position: (currentRoomState.antPositions[antId] / raceLength) * 100
          }));
          console.log('Backend (join_room): Dados de formigas antes de emitir race_update inicial:', antsForFrontend); // <--- ADICIONE ESTE LOG
          socket.emit('race_update', {
            roomId: roomId,
            ants: antsForFrontend
          });
        } else {
          console.warn(`[Socket.IO] raceLength ou antPositions não definidos para a sala ${roomId} ao enviar race_update inicial.`);
        }
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

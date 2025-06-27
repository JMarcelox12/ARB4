import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import route from './src/routes/index.js'
import { initializeSocket } from './src/services/roomManager.js';

// Importa a FUNÇÃO que cria as rotas, não o router diretamente
import createApiRoutes from './src/routes/index.js'
import * as roomManager from './src/services/roomManager.js'

// --- Configuração inicial ---
const app = express()
const httpServer = createServer(app)

// --- Configuração do Socket.IO ---
// Exportamos 'io' para que, se necessário, possamos usá-lo em scripts ou testes,
// mas a aplicação principal funcionará por injeção de dependência.
export const io = new Server(httpServer, {
  cors: {
    origin: '*', // Em produção, restrinja para o seu domínio do frontend
  },
})


// --- Configuração do Express ---
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Para servir arquivos estáticos da pasta 'uploads'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/app', route)

// Rota raiz de verificação
app.get('/', async (req, res) => {
  res.send('ARB funcionando!')
})

initializeSocket(io);

// --- Lógica do Socket.IO ---
io.on('connection', (socket) => {
  console.log(`🔌 Cliente Conectado: ${socket.id}`)

  // Lógica para um cliente entrar em uma sala
  socket.on('join_room', (roomId) => {
    const roomIdentifier = String(roomId) // Garante que o nome da sala é uma string
    socket.join(roomIdentifier)
    console.log(
      `[Socket.IO] Cliente ${socket.id} entrou na sala: ${roomIdentifier}`
    )

    // Opcional: Enviar o estado atual da sala para o cliente que acabou de entrar
    const currentRoomState = roomManager.activeRooms[roomIdentifier]
    if (currentRoomState) {
      // Envia o estado atual (status, tempo restante)
      // (A lógica de tempo restante está em roomManager, então talvez seja melhor emitir de lá,
      // mas isso funciona para um 'snapshot' inicial)

      // Se a corrida estiver acontecendo, envie a posição atual das formigas
      if (
        currentRoomState.status === 'correndo' &&
        currentRoomState.antPositions
      ) {
        const raceLength = 1000 // Assumindo um valor fixo, ou pegue de uma constante
        const antsForFrontend = Object.keys(currentRoomState.antPositions).map(
          (antId) => ({
            id: antId,
            position: (
              (currentRoomState.antPositions[antId] / raceLength) *
              100
            ).toFixed(0),
          })
        )

        socket.emit('race_update', {
          roomId: roomIdentifier,
          ants: antsForFrontend,
        })
      }
    }
  })

  // Lógica para um cliente sair de uma sala
  socket.on('leave_room', (roomId) => {
    const roomIdentifier = String(roomId)
    socket.leave(roomIdentifier)
    console.log(
      `[Socket.IO] Cliente ${socket.id} saiu da sala: ${roomIdentifier}`
    )
  })

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente Desconectado: ${socket.id}`)
  })
})

export { app, httpServer }

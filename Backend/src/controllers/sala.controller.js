import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path, { format } from 'path'
import fs from 'fs'
import * as roomManager from '../services/roomManager.js'
import { start } from 'repl'

const prisma = new PrismaClient()

const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Define onde as imagens serão salvas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // cria uma pasta chamada 'uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

export const upload = multer({ storage })

// Função para sortear formigas
const getShuffledAnts = async () => {
  const ants = await prisma.ant.findMany()
  if (ants.length < 8)
    throw new Error('Não há formigas suficientes cadastradas!')
  return ants.sort(() => Math.random() - 0.5).slice(0, 8)
}

// Função que lista o status da sala
export const getRoomStatus = async (req, res) => {
  const roomId = parseInt(req.params.id)

  if (!roomManager.activeRooms[roomId]) {
    // Verifique se a sala existe no roomManager.activeRooms
    console.log(`Iniciando ciclo da sala ${roomId} via getRoomStatus.`)
    await roomManager.startRoomCycle(roomId)
  }

  try {
    const currentRoomState = roomManager.activeRooms[roomId]

    if (!currentRoomState) {
      return res
        .status(404)
        .json({ error: 'Sala não encontrada ou não iniciada no gerenciador.' })
    }

    const salaDB = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        bets: true,
        rooms: { include: { ant: true } },
      },
    })

    if (!salaDB)
      return res
        .status(404)
        .json({ error: 'Sala não encontrada no banco de dados.' })

    res.json({
      status: currentRoomState.status,
      tempoRestante: currentRoomState.tempoRestante,
      winnerId: currentRoomState.winnerId,

      ants: salaDB.rooms.map((f) => ({
        id: f.ant.id,
        name: f.ant.name,
        image: f.ant.image,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar status da sala:', error)
    res.status(500).json({ error: 'Erro interno ao buscar status da sala.' })
  }
}

// Cria uma nova sala e seleciona as formigas
export const createRoom = async (req, res) => {
  const imagePath = req.file ? req.file.path : null
  const name = req.body.name
  const description = req.body.description

  // Validação básica para os campos necessários
  if (!imagePath) {
    return res.status(400).send('Imagem da formiga é obrigatória')
  }
  if (!name || !description) {
    return res.status(400).json({ error: 'Nome e descrição são obrigatórios' })
  }

  try {
    const inicio = new Date()
    const shuffledAnts = await getShuffledAnts()

    const newRoom = await prisma.room.create({
      data: {
        image: imagePath,
        name: name,
        description: description,
        status: 'PAUSE',
        inicioFase: inicio,
        rooms: {
          create: shuffledAnts.map((ant) => ({
            ant: { connect: { id: ant.id } },
          })),
        },
      },
      include: { rooms: true },
    })

    await roomManager.startRoomCycle(newRoom.id)
    return res.status(200).json(newRoom)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

// Função que lista uma sala em específico
export const getRoom = async (req, res) => {
  const roomId = parseInt(req.params.id)

  if (!roomId) {
    return res.status(400).json({ error: 'ID da sala inválido!' })
  }

  try {
    // Aguarda a atualização da sala antes de buscar os dados
    await getRoomUpdate(roomId)

    const room = await prisma.room.findMany({
      where: { id: roomId },
      include: {
        bets: true,
        rooms: {
          include: {
            ant: true,
          },
        },
      },
    })

    if (room.length === 0) {
      return res.status(400).json({ error: 'Sala não encontrada!' })
    }

    return res.status(200).json(room)
  } catch (err) {
    console.error('Erro ao obter sala:', err)
    return res.status(500).json({ error: 'Erro ao encontrar sala!' })
  }
}

// Lista todas as salas
export const getRooms = async (req, res) => {
  try {
    const room = await prisma.room.findMany({
      include: { rooms: { include: { ant: true } } },
    })
    return res.status(200).json(room)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar salas' })
  }
}

// Lista as formigas de uma sala específica
export const listAnts = async (req, res) => {
  const salaId = parseInt(req.params.id)

  try {
    const roomAnts = await prisma.roomAnt.findMany({
      where: { roomId: salaId },
      include: { ant: true },
    })

    const ants = roomAnts.map((ra) => ra.ant)

    res.json(ants)
  } catch (error) {
    console.error('Erro ao buscar formigas:', error)
    res.status(500).json({ erro: 'Erro ao buscar formigas da sala.' })
  }
}

// Edita a sala pelo id
export const updateRoom = async (req, res) => {
  const id = parseInt(req.params.id)
  const name = req.body.name
  const description = req.body.description

  if (!name || !description)
    return res.status(400).json({ error: 'Nome e descrição são obrigatórios' })

  try {
    const updatedRoom = await prisma.room.update({
      where: { id: id },
      data: { name, description },
    })
    res.json({ message: 'Sala atualizada!', room: updatedRoom })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar sala' })
  }
}

// Deleta a sala pelo id
export const deleteRoom = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    await prisma.room.delete({ where: { id: id } })
    res.json({ message: 'Sala deletada com sucesso!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao deletar sala' })
  }
}

// Função para iniciar as salas
export const playRoom = async (req, res) => {
  const id = parseInt(req.params.id)

  console.log(`Controller: Rota playRoom atingida para a sala: ${id}`)

  try {
    const sala = await prisma.room.findUnique({ where: { id: id } })
    if (!sala) return res.status(404).json({ error: 'Sala não encontrada' })

    // Atualiza para o estado inicial
    await prisma.room.update({
      where: { id: id },
      data: {
        status: 'PAUSE',
        inicioFase: new Date(),
        winnerId: null,
      },
    })

    // Inicia o temporizador da sala
    await roomManager.startRoomCycle(id, 'PAUSE')
    console.log(
      `Controller: roomManager.startRoomCycle chamado com sucesso para a sala: ${id}`
    )

    res.json({ message: 'Corrida iniciada com sucesso!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao iniciar corrida na sala' })
  }
}

// Função para encerar as salas
export const endRoom = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    await prisma.room.update({
      where: { id },
      data: { status: 'ENCERRADA' },
    })

    if (roomManager.activeRooms[id] && roomManager.activeRooms[id].interval) {
      clearInterval(roomManager.activeRooms[id].interval)
      delete roomManager.activeRooms[id] // Limpa a sala do gerenciador em memória
    }
    if (roomTimers[id]) {
      clearInterval(roomTimers[id].interval)
      delete roomTimers[id]
    }

    res.json({ message: 'Sala encerrada com sucesso!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao encerrar a sala' })
  }
}

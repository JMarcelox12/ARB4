import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path, { format } from 'path'
import fs from 'fs'

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

const fases = {
  PAUSE: { duracao: 30000, proxima: 'BETTING' },
  BETTING: { duracao: 60000, proxima: 'RACING' },
  RACING: { duracao: 15000, proxima: 'PAUSE' },
}

const intervalosDasSalas = new Map()

// Função que define o resultado da sala
export async function resultsRoom(salaId) {
  const id = parseInt(salaId)
  if (!id) throw new Error('Erro ao encontrar sala!')

  const ants = await prisma.roomAnt.findMany({
    where: { roomId: id },
    include: { ant: true },
  })

  if (ants.length < 4) {
    throw new Error('Sala não possui formigas suficientes para sorteio!')
  }
  const shuffled = ants.sort(() => Math.random() - 0.5)

  return shuffled
}

// Função que inicia o temporizador da sala
export async function iniciarTemporizadorSala(roomId) {
  const room = parseInt(roomId)
  if (intervalosDasSalas.has(room)) return

  let sala = await prisma.room.findUnique({
    where: { id: room },
  })
  if (!sala) return

  setInterval(async () => {
    const agora = new Date()
    const faseAtual = fases[sala.status]
    const fimFase = new Date(sala.inicioFase.getTime() + faseAtual.duracao)

    if (agora >= fimFase) {
      let winnerId = sala.winnerId
      if (sala.status === 'BETTING') {
        // Sorteia a formiga vencedora
        const formigas = sala.formigas
        const sorteada = formigas[Math.floor(Math.random() * formigas.length)]
        winnerId = sorteada?.antId ?? null
      }

      sala = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: faseAtual.proxima,
          inicioFase: new Date(),
          winnerId: sala.status === 'BETTING' ? winnerId : null,
        },
      })

      console.log(`[Sala ${sala.id}] Nova fase: ${faseAtual.proxima}`)
    }
  }, 1000)
}

// Função que encerra o temporizador
export function encerrarTemporizadorSala(roomId) {
  const intervalo = intervalosDasSalas.get(roomId)
  if (intervalo) {
    clearInterval(intervalo)
    intervalosDasSalas.delete(roomId)
  }
}

// Função que lista o status da sala
export const getRoomStatus = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const sala = await prisma.room.findUnique({
      where: { id: id },
      include: { bets: true, rooms: { include: { ant: true } } },
    })
    if (!sala) return res.status(404).json({ error: 'Sala não encontrada' })

    const tempos = { PAUSE: 30, BETTING: 60, RACING: 15 }
    const tempoInicio = new Date(sala.inicioFase).getTime()
    const duracao = tempos[sala.status] * 1000
    const restante = Math.max(0, (tempoInicio + duracao - Date.now()) / 1000)

    res.json({
      status: sala.status,
      tempoRestante: Math.floor(restante),
      winnerId: sala.winnerId,
      ants: sala.rooms.map((f) => ({
        id: f.ant.id,
        nome: f.ant.name,
        image: f.ant.image,
      })),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar status da sala' })
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

    const room = await prisma.room.create({
      data: {
        image: imagePath,
        name: name,
        description: description,
        inicioFase: inicio,
        rooms: {
          create: shuffledAnts.map((ant) => ({
            ant: { connect: { id: ant.id } },
          })),
        },
      },
      include: { rooms: true },
    })

    iniciarTemporizadorSala(room.id)
    return res.status(200).json({ message: 'Sala criada com sucesso!', room })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

// complemento da função abaixo
const getRoomUpdate = async (id) => {
  try {
    const roomId = parseInt(id)
    const result = await resultsRoom(roomId)

    if (!result || result.length < 8) {
      throw new Error('Resultado incompleto')
    }

    const [winner, vice, terceiro, quarto, quinto, sexto, penultimo, ultimo] =
      result
    //console.log(result)

    await prisma.room.update({
      where: { id: roomId },
      data: {
        winnerId: parseInt(winner.ant.id),
        vice: parseInt(vice.ant.id),
        terceiro: parseInt(terceiro.ant.id),
        quarto: parseInt(quarto.ant.id),
        quinto: parseInt(quinto.ant.id),
        sexto: parseInt(sexto.ant.id),
        penultimo: parseInt(penultimo.ant.id),
        ultimo: parseInt(ultimo.ant.id),
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar a sala:', error)
    throw error
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
    iniciarTemporizadorSala(id)

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
    encerrarTemporizadorSala(id)
    res.json({ message: 'Sala encerrada com sucesso!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao encerrar a sala' })
  }
}

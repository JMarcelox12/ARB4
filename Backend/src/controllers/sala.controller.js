import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Função para sortear formigas
const getShuffledAnts = async () => {
  const ants = await prisma.ant.findMany()
  if (ants.length < 8) {
    throw new Error('Não há formigas suficientes cadastradas!')
  }
  return ants.sort(() => Math.random() - 0.5).slice(0, 8)
}

// Cria uma nova sala e seleciona as formigas
export const createRoom = async (req, res) => {
  const { name, description } = req.body

  // Validação básica para os campos necessários
  if (!name || !description) {
    return res.status(400).json({ error: 'Nome e descrição são obrigatórios' })
  }

  try {
    const shuffledAnts = await getShuffledAnts()

    const room = await prisma.room.create({
      data: {
        name,
        description,
        formigas: {
          create: shuffledAnts.map((ant) => ({
            ant: { connect: { id: ant.id } },
          })),
        },
      },
      include: { formigas: true },
    })

    res.status(201).json({ message: 'Sala criada com sucesso!', room })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

// Lista todas as salas
export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: { formigas: { include: { ant: true } } },
    })
    res.status(200).json(rooms)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao listar salas' })
  }
}

// Edita a sala pelo id
export const updateRoom = async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body

  if (!name || !description) {
    return res.status(400).json({ error: 'Nome e descrição são obrigatórios' })
  }

  try {
    const updatedRoom = await prisma.room.update({
      where: { id },
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
  const { id } = req.params

  try {
    await prisma.room.delete({
      where: { id },
    })
    res.json({ message: 'Sala deletada com sucesso!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao deletar sala' })
  }
}

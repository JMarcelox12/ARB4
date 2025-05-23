import { PrismaClient } from '@prisma/client'
import { placeBet, checkBetResults } from '../services/aposta.service.js'

const prisma = new PrismaClient()

// Função para criar uma aposta
export const createBet = async (req, res) => {
  try {
    const { userId, antId, amount } = req.body
    const bet = await placeBet(userId, antId, amount)
    res.status(201).json(bet)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Função para listar todas as apostas
export const listBets = async (req, res) => {
  try {
    const bets = await prisma.betticket.findMany({
      include: { user: true, room: true, ant: true },
    })

    res.status(200).json(bets)
  } catch (error) {
    console.error('Erro ao listar todas as apostas:', error)
    res.status(500).json({ error: 'Erro ao buscar apostas. Tente novamente.' })
  }
}

// Função para listar uma aposta específica por ID
export const getBetById = async (req, res) => {
  try {
    const { id } = req.params

    const bet = await prisma.betticket.findUnique({
      where: { id },
      include: { user: true, room: true, ant: true },
    })

    if (!bet) return res.status(404).json({ error: 'Aposta não encontrada.' })

    res.status(200).json(bet)
  } catch (error) {
    console.error('Erro ao buscar aposta:', error)
    res.status(500).json({ error: 'Erro ao buscar aposta. Tente novamente.' })
  }
}

// Função para editar a aposta
export const updateBet = async (req, res) => {
  try {
    const bet = await prisma.bet.findUnique({ where: { id: req.params.id } })

    if (!bet) {
      return res.status(404).send('Aposta não encontrada')
    }

    await prisma.bet.update({
      where: {
        id: req.params.id,
      },
      data: {
        amount: req.body.amount,
      },
    })
    res.send('OK! ta funfando!')
  } catch ( error ) {
    console.error(err)
    res.status(500).send('Erro ao editar aposta')
  }
}

// Função para deletar a aposta
export const deleteBet = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const bet = await prisma.bet.findUnique({ where: { id: req.params.id } })

    if (!bet) {
      return res.status(404).send('Aposta não encontrada')
    }

    await prisma.bet.update({
      where:{ id: id},

    })
  } catch (error) {
    console.error('Erro ao deletar aposta do usuário:', error)
    res.status(500).json({ error: 'Erro ao deletar aposta. Tente novamente.' })
  }
}

// Função para listar todas as apostas de um usuário específico
export const listUserBets = async (req, res) => {
  const id = parseInt(req.params.id)

  try {

    const bets = await prisma.bet.findMany({
      where: { id: id },
      include: { user: true, ant: true },
    })

    if (bets.length === 0) {
      return res
        .status(404)
        .json({ error: 'Nenhuma aposta encontrada para este usuário.' })
    }

    res.status(200).json(bets)
  } catch (error) {
    console.error('Erro ao listar apostas do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar apostas. Tente novamente.' })
  }
}

// Função para processar a corrida e pagar os vencedores
export const processRaceResults = async (req, res) => {
  try {
    const { winningAntId } = req.body
    await checkBetResults(winningAntId)
    res.status(200).json({ message: 'Resultados processados com sucesso.' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

import express from 'express'
import { prismaClient } from '@prisma/client'
import { withdraw, deposit } from '../services/pay.service'

const app = express()
const prisma = prismaClient()

app.use(express.json())

// Função que faz deposito na conta do usuário
export const Deposito = async (req, res) => {
  const id = parseInt(req.params.id)

  if (!id) {
    return res
      .status(400)
      .json('Id do usuário não encontrado para realizar transação.')
  }

  try {
    const valor = req.body.saldo

    const user = await prisma.user.update({
      where: { id: id },
      data: { saldo: { increment: valor } },
    })

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' })
    }

    await deposit(id, valor)

    res
      .status(200)
      .json({ message: 'Depósito realizado com sucesso', saldo: user.saldo })
  } catch (error) {
    console.error('Erro ao fazer depósito: ', error)
    res.status(500).json({ error: 'Erro ao processar depósito' })
  }
}

// Função que faz saque na conta do usuário
export const Saque = async (req, res) => {
  const id = parseInt(req.params.id)

  if (!id) {
    return res.status(400).json('Id do usuário inválido.')
  }

  try {
    const valor = parseFloat(req.body.saldo)

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (valor > user.saldo) {
      return res.status(401).json({ error: 'Saldo insuficiente!' })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { saldo: { decrement: valor } },
    })

    await withdraw(id, valor)

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Houve um erro ao realizar o saque' })
  }
}

// Função que lista todos as transações de um usuário
export const listUserTransacoes = async (req, res) => {
  const id = parseInt(req.params.id)

  if (!id) {
    res.status(400).json('Id do usuário não encontrado.')
  }

  try {
    const response = await prisma.transaction.findMany({
      where: { userId: id },
    })

    if (!response) {
      return res.status(400).json('Nenhuma transação encontrada')
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Erro ao carregar transações: ', error)
    res.status(500).json({ error: 'Erro ao tentar carregar as transações' })
  }
}

// Função que lista uma transação em específico
export const listTransacoesId = async (req, res) => {
  const id = parseInt(req.params.id)

  if (!id) {
    return res.status(400).json('Id da transação inválido.')
  }

  try {
    const response = await prisma.transaction.findUnique({
      where: { id: id },
    })

    if (!response) {
      return res.status(400).json('Transação não encontrada.')
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Erro ao carregar transação: ', error)
    res.status(500).json({ error: 'Erro ao tentar carregar transação!' })
  }
}

// Função que lista todas as transações para o admin
export const listTransacoes = async (req, res) => {
  //fazer
}

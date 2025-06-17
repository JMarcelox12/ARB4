import express from 'express'
import { PrismaClient } from '@prisma/client'
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js'
import { deposit, withdraw } from '../services/pay.service.js'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

//cria usuário
export const register = async (req, res) => {
  try {
    const result = await registerUser(
      req.body.name,
      req.body.age,
      req.body.email,
      req.body.password
    )

    return res.status(201).json(result)
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)

    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao registrar usuário' })
    }
  }
}

//listagem de usuario
export const findOne = async (req, res) => {
  const userId = req.params.id

  if (!userId) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
}

//edita um usuário
export const update = async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.status(200).json(updatedUser)
  } catch (error) {
    // registrar
    res.status(500).json({ error: error.message })

    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao editar usuário' })
    }
  }
}

//deleta usuário do id
export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    })
    res.json({ message: 'Usuário deletado com sucesso!' })
  } catch (error) {
    res.status(500).json({ error: error.message })

    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao deletar usuário' })
    }
  }
}

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await loginUser(email, password)
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })

    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao logar usuário' })
    }
  }
}

//requisição de redefinição de senha
export const requestPasswordResetController = async (req, res) => {
  try {
    const message = await requestPasswordReset(req.body.email)
    res.json({ message })
  } catch (error) {
    res.status(400).json({ error: error.message })

    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao redefinir senha' })
    }
  }
}

//redefine a senha
export const resetPasswordController = async (req, res) => {
  try {
    const message = await resetPassword(req.body.token, req.body.newPassword)
    res.json({ message })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)

    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao redefinir senha' })
    }
  }
}

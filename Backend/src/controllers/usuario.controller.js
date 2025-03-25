import express from 'express'
import { PrismaClient } from '@prisma/client'
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js'
import { body, validationResult } from 'express-validator'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

//cria usuário
export const register = async (req, res) => {
  res.send('Registro está funcionando!')
  try {
    const result = await registerUser(
      req.body.name,
      req.body.age,
      req.body.email,
      req.body.password
    )

    res.status(201).json(result)
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)

    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  }
}

//listagem de usuario
export const findOne = async (req, res) => {
  const userId = req.params.id

  console.log(req.params.id, req.body.id)

  if (!userId) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })

    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao listar usuário" });
    }
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
    registrar
    res.status(500).json({ error: error.message })

    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao editar usuário" });
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
      res.status(500).json({ error: "Erro ao deletar usuário" });
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
      res.status(500).json({ error: "Erro ao logar usuário" });
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
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  }
}

//redefine a senha
export const resetPasswordController = async (req, res) => {
  try {
    const message = await resetPassword(req.body.token, req.body.newPassword)
    res.json({ message })
  } catch (error) {
    res.status(400).json({ error: error.message })

    const deposito = async (req, res) => {
      try {
        const message = await deposito(res)
      } catch (error) {
        res.status(500).json({error: message})
      }
    }
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  }
}

//deposito
export const deposit = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        saldo: user.saldo + req.body.saldo, 
      },
    })
    data = data + req
    console.log('Tá depositando: ', user.saldo)
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({error: message})
  }
}

//saque
export const withdraw = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (user.saldo < req.body.saldo) {
      return res.status(400).json({ error: "Saldo insuficiente!" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        saldo: user.saldo - req.body.saldo,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Houve um erro ao realizar o saque" });
  }
}

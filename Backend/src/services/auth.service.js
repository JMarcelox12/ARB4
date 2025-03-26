import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendResetEmail } from './email.service.js'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const SECRET_KEY = process.env.JWT_SECRET

//cria usuário
export async function registerUser(name, age, email, password) {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) throw new Error('E-mail já registrado.')

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, age, email, password: hashedPassword },
  })

  return { message: 'Usuário registrado com sucesso!' }
}

//login de usuário
export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Usuário não encontrado.')

  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) throw new Error('Senha incorreta.')

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '10m' })

  return { token, userId: user.id, saldo: user.saldo }
}

//sistema de redefinição de senha
export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new Error('Usuário não encontrado.')
  }

  const resetToken = jwt.sign({ userId: user.id }, SECRET_KEY, {
    expiresIn: '10m',
  })

  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpires: new Date(Date.now() + 3600000),
    },
  })
  await sendResetEmail(email, resetToken)

  return 'E-mail de redefinição enviado.'
}

//redefine a senha
export async function resetPassword(token, newPassword) {
  let decoded
  try {
    decoded = jwt.verify(token, SECRET_KEY)
  } catch (err) {
    throw new Error('Token inválido ou expirado.')
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  })

  if (
    !user ||
    user.resetToken !== token ||
    new Date() > user.resetTokenExpires
  ) {
    throw new Error('Token inválido ou expirado.')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  })

  return 'Senha redefinida com sucesso!'
}

// Middleware para proteger rotas privadas
export function authenticateToken(req, res, next) {
  const token = req.header('Authorization')
  if (!token) return res.status(401).json({ error: 'Acesso negado.' })

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY)
    req.userId = verified.userId
    next()
  } catch (err) {
    res.status(403).json({ error: 'Token inválido.' })
  }
}

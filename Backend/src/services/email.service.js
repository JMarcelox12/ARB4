import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Configuração do transportador de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Função para enviar o e-mail de recuperação de senha
async function sendResetEmail(email, token) {
  const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`

  const mailOptions = {
    from: `"Ant Bet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Redefinição de Senha',
    html: `
            <h2>Redefinição de Senha</h2>
            <p>Você solicitou a redefinição de senha. Clique no link abaixo para redefinir:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Se não foi você, ignore este e-mail.</p>
        `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('E-mail de redefinição enviado para:', email)
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    throw new Error('Falha ao enviar e-mail de redefinição.')
  }
}

export { sendResetEmail }

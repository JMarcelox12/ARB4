import { Router } from 'express'
import {
  register,
  findOne,
  update,
  deleteUser,
  login,
  requestPasswordResetController,
  resetPasswordController,
} from '../controllers/usuario.controller.js'
import {
  Deposito,
  Saque,
  listTransacoes,
  listUserTransacoes,
  listTransacoesId,
} from '../controllers/transacoes.controller.js'

var UserRoutes = Router()

UserRoutes.post('/register', register)
UserRoutes.get('/:id', findOne)
UserRoutes.put('/update/:id', update)
UserRoutes.delete('/delete/:id', deleteUser)
UserRoutes.post('/login', login)
UserRoutes.post('/request-reset', requestPasswordResetController)
UserRoutes.post('/reset-password', resetPasswordController)
UserRoutes.post('/deposit/:id', Deposito)
UserRoutes.post('/withdraw/:id', Saque)
UserRoutes.get('/transactions/:id', listUserTransacoes)
UserRoutes.get('/transaction/:id', listTransacoesId)
UserRoutes.get('/admin/transaction', listTransacoes)

export default UserRoutes

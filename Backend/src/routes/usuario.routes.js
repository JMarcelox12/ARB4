import { Router } from 'express'
import {
  register,
  findOne,
  update,
  deleteUser,
  login,
  requestPasswordResetController,
  resetPasswordController,
  Deposito,
  Saque,
} from '../controllers/usuario.controller.js'

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

export default UserRoutes

import { Router } from 'express'
import {
  register,
  findOne,
  update,
  deleteUser,
  login,
  requestPasswordResetController,
  resetPasswordController,
  deposit,
  withdraw,
} from '../controllers/usuario.controller.js'

var UserRoutes = Router()

UserRoutes.post('/register', register)
UserRoutes.get('/:id', findOne)
UserRoutes.put('/:id', update)
UserRoutes.delete('/:id', deleteUser)
UserRoutes.post('/login', login)
UserRoutes.post('/request-reset', requestPasswordResetController)
UserRoutes.post('/reset-password', resetPasswordController)
UserRoutes.update("/deposit", deposit)
UserRoutes.update("/withdraw", withdraw)

export default UserRoutes

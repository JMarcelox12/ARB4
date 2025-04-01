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
UserRoutes.get('/search/:id', findOne)
UserRoutes.put('/update/:id', update)
UserRoutes.delete('/delete/:id', deleteUser)
UserRoutes.post('/login', login)
UserRoutes.post('/request-reset', requestPasswordResetController)
UserRoutes.post('/reset-password', resetPasswordController)
UserRoutes.post("/deposit", deposit)
UserRoutes.post("/withdraw", withdraw)

export default UserRoutes

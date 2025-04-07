import express from 'express'
import { Router } from 'express'
import UserRoutes from './usuario.routes.js'
import AntRoutes from './formiga.routes.js'
import RoomRoutes from './sala.routes.js'
import BetRoutes from './aposta.routes.js'

const app = express()
const route = Router()

app.use('/uploads', express.static('uploads')) // serve as imagens

route.use(express.json())

route.use('/user', UserRoutes)
route.use('/ant', AntRoutes)
route.use('/room', RoomRoutes)
route.use('/bet', BetRoutes)

route.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bem-vindo!',
  })
})

export default route

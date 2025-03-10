import { Router } from 'express'
import {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
} from '../controllers/sala.controller.js'

var RoomRoutes = Router()

RoomRoutes.post('/', createRoom)
RoomRoutes.get('/rooms', getRooms)
RoomRoutes.put('/room/:id', updateRoom)
RoomRoutes.delete('/room/:id', deleteRoom)

RoomRoutes.use('/room', RoomRoutes)

export default RoomRoutes

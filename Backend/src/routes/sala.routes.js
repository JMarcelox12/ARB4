import { Router } from 'express'
import { upload } from '../controllers/formiga.controller.js'
import {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  getRoomStatus,
  playRoom,
  endRoom,
  listAnts,
} from '../controllers/sala.controller.js'

var RoomRoutes = Router()

RoomRoutes.get('/status/:id', getRoomStatus)
RoomRoutes.post('/', upload.single('image'), createRoom)
RoomRoutes.get('/rooms', getRooms)
RoomRoutes.post('/update/:id', updateRoom)
RoomRoutes.delete('/room/:id', deleteRoom)
RoomRoutes.post('/play/:id', playRoom)
RoomRoutes.post('/finish/:id', endRoom)
RoomRoutes.get('/:id/formigas', listAnts)

RoomRoutes.use('/room', RoomRoutes)

export default RoomRoutes

import { Router } from 'express'
import { upload } from '../controllers/formiga.controller.js'
import {
  createAnt,
  getAnts,
  updateAnt,
  deleteAnt,
} from '../controllers/formiga.controller.js'

var AntRoutes = Router()

AntRoutes.post('/', upload.single('image'), createAnt)
AntRoutes.get('/list', getAnts)
AntRoutes.put('/update/:id', updateAnt)
AntRoutes.delete('/delete/:id', deleteAnt)

AntRoutes.use('/ant', AntRoutes)

export default AntRoutes

import { Router } from 'express'
import {
  createAnt,
  getAnts,
  updateAnt,
  deleteAnt,
} from '../controllers/formiga.controller.js'

var AntRoutes = Router()

AntRoutes.post('/', createAnt)
AntRoutes.get('/:id', getAnts)
AntRoutes.put('/:id', updateAnt)
AntRoutes.delete('/:id', deleteAnt)

AntRoutes.use('/ant', AntRoutes)

export default AntRoutes

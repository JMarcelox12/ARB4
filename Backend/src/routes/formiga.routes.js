import { Router } from 'express'
import {
  createAnt,
  getAnts,
  updateAnt,
  deleteAnt,
  upload,
} from '../controllers/formiga.controller.js'
import { upload } from '../middlewares/upload.js'

var AntRoutes = Router()

AntRoutes.post('/', upload.single('imagem'), createAnt)
AntRoutes.get('/list', getAnts)
AntRoutes.put('/update/:id', updateAnt)
AntRoutes.delete('/delete/:id', deleteAnt)

AntRoutes.use('/ant', AntRoutes)

export default AntRoutes

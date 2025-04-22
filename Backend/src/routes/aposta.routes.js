import { Router } from 'express'
import {
  createBet,
  listBets,
  getBetById,
  listUserBets,
  processRaceResults,
} from '../controllers/aposta.controller.js'

const BetRoutes = Router()

BetRoutes.post('/bet', createBet)
BetRoutes.get('/list', listBets)
BetRoutes.get('/:id', getBetById)
BetRoutes.get('/user/:id', listUserBets)
BetRoutes.post('/race/results', processRaceResults)

export default BetRoutes

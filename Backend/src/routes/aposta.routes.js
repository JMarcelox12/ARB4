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
BetRoutes.get('/bet/list', listBets)
BetRoutes.get('/bet/:id', getBetById)
BetRoutes.get('/bet/user/:userId', listUserBets)
BetRoutes.post('/race/results', processRaceResults)

export default BetRoutes

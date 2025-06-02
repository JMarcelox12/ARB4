import { Router } from 'express'
import {
  createBet,
  listBets,
  getBetById,
  listUserBets,
  processRaceResults,
  updateBet,
  deleteBet,
} from '../controllers/aposta.controller.js'

const BetRoutes = Router()

BetRoutes.post('/', createBet)
BetRoutes.get('/list', listBets)
BetRoutes.get('/:id', getBetById)
BetRoutes.get('/bets/:id', listUserBets)
BetRoutes.post('/update/:id', updateBet)
BetRoutes.delete('/delete/:id', deleteBet)
BetRoutes.post('/race/results', processRaceResults)

export default BetRoutes

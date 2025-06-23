import { Router } from 'express'
import {
  createBet,
  listBets,
  getBetById,
  listUserBets,
  listBetsRoom,
  processRaceResults,
  updateBet,
  deleteBet,
} from '../controllers/aposta.controller.js'

var BetRoutes = Router()

BetRoutes.post('/', createBet)
BetRoutes.get('/list', listBets)
BetRoutes.get('/:id', getBetById)
BetRoutes.get('/user/:id', listUserBets)
BetRoutes.get("/rooms/:id", listBetsRoom)
BetRoutes.post('/update/:id', updateBet)
BetRoutes.delete('/delete/:id', deleteBet)
BetRoutes.post('/race/results', processRaceResults)

export default BetRoutes

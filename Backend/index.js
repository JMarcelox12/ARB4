import express from 'express'
import cors from 'cors'
import route from './src/routes/index.js'

const app = express()

/*var corsOptions = {
    origin: 'ARB é web-site de uma casa de recompensa com temática de formigas!',
  }*/

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/app', route)

app.get('/', async (req, res) => {
  res.send('ARB funcionando!')
})

app.listen(1200, (req, res) => {
  console.log('Servidor rodando na porta 1200!')
})

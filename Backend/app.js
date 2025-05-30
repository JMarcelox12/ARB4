import express from 'express'
import cors from 'cors'
import route from './src/routes/index.js'

const app = express()

const corsOptions = {
  origin: '*',
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static('uploads'))
app.use('/app', route)

app.get('/', async (req, res) => {
  res.send('ARB funcionando!')
})

export default app

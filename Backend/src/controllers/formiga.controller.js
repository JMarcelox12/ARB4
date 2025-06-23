import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { captureRejectionSymbol } from 'events'

const prisma = new PrismaClient()

const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Define onde as imagens serão salvas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // cria uma pasta chamada 'uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

export const upload = multer({ storage })

// Sorteia o número de partidas
async function sortGame() {
  return Math.round(Math.random() * 100)
}

// Sorteia o número de vitórias
async function sortWin(game) {
  if (game <= 0) {
    return 0
  }
  let win
  do {
    win = Math.random() * 100
  } while (win > game)
  return Math.round(win)
}

// Calcula a odd da formiga
async function calculateODDAnt(win, game) {
  let odd = 0
  if (game === 0) {
    odd = 1.1
    return parseFloat(odd.toFixed(2))
  }
  let result = (win / game) * 100
  result = parseFloat(result.toFixed(0))

  if (result > 92) {
    odd = 1.1
  } else if (result < 6) {
    odd = 4.94
  } else {
    let aux = 5
    odd = 4.62
    while (aux != result) {
      aux++
      odd -= 0.04
    }
  }
  return parseFloat(odd.toFixed(2))
}

// Função para criar uma nova formiga
export const createAnt = async (req, res) => {
  const { name } = req.body
  const imagePath = req.file ? req.file.path : null

  if (!imagePath) {
    return res.status(400).send('Imagem da formiga é obrigatória')
  }

  if (!name) {
    return res.status(400).send('Nome da formiga é obrigatório')
  }

  try {
    let sg = await sortGame(),
      sw = await sortWin(sg)

    await prisma.ant.create({
      data: {
        image: imagePath, // salva o caminho do arquivo
        name: name,
        win: sw,
        game: sg,
        odd: await calculateODDAnt(sw, sg),
      },
    })

    res.status(200).send('Formiga criada com sucesso!')
  } catch (error) {
    console.error(error)
    res.status(500).send('Erro ao registrar formiga')
  }
}

// Função para listar as formigas
export const getAnts = async (req, res) => {
  let ant = []

  if (req.query.name) {
    ant = await prisma.ant.findMany({
      where: {
        name: {
          contains: req.query.name,
          mode: 'insensitive', // busca case-insensitive
        },
      },
    })
  } else {
    ant = await prisma.ant.findMany()
  }

  res.status(200).json(ant)
}

// Função para editar uma formiga
export const updateAnt = async (req, res) => {
  const { name } = req.body

  try {
    const id = parseInt(req.params.id)

    const ant = await prisma.ant.findUnique({ where: { id: id } })

    if (!ant) {
      return res.status(404).send('Formiga não encontrada')
    }

    console.log(req.body.name)

    await prisma.ant.update({
      where: {
        id: id,
      },
      data: {
        name,
      },
    })
    console.log(ant)
    res.send('OK! ta funfando!')
  } catch (err) {
    console.error(err)
    res.status(500).send('Erro ao editar formiga')
  }
}

// Função para deletar uma formiga
export const deleteAnt = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const ant = await prisma.ant.findUnique({ where: { id: id } })

    if (!ant) {
      return res.status(404).send('Formiga não encontrada')
    }

    await prisma.ant.delete({
      where: {
        id: id,
      },
    })
    res.json('OK, tá deletando!')
  } catch (err) {
    console.error(err)
    res.status(500).send('Erro ao deletar formiga')
  }
}

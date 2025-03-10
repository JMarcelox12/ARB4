import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    odd = 1.1
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
  let sg = await sortGame(),
    sw = await sortWin(sg)

  await prisma.ant.create({
    data: {
      image: req.body.image,
      name: req.body.name,
      win: sw,
      game: sg,
      odd: await calculateODDAnt(sw, sg),
    },
  })

  res.send('OK! ta funfando!')
}

// Função para listar as formigas
export const getAnts = async (req, res) => {
  let ant = []

  if (req.query.name) {
    ant = await prisma.ant.findMany()
  } else {
    ant = await prisma.ant.findMany()
  }

  res.status(200).json(ant)
}

// Função para editar uma formiga
export const updateAnt = async (req, res) => {
  await prisma.ant.update({
    where: {
      id: req.params.id,
    },
    data: {
      image: req.body.image,
      name: req.body.name,
    },
  })
  res.send('OK! ta funfando!')
}

// Função para deletar uma formiga
export const deleteAnt = async (req, res) => {
  await prisma.ant.delete({
    where: {
      id: req.params.id,
    },
  })
  res.send('OK, tá deletando!')
}

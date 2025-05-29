import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

//gerencia aposta
export async function placeBet(userId, antId, roomId, amount, betType) {
  if (amount <= 0) {
    throw new Error('O valor da aposta deve ser maior que zero.')
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuário não encontrado.')

  if (user.saldo < amount) throw new Error('Saldo insuficiente.')

  const ant = await prisma.ant.findUnique({ where: { id: antId } })
  if (!ant) throw new Error('Formiga não encontrada.')

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) throw new Error('Sala não encontrada.')
  if (room.status !== 'APOSTAS')
    throw new Error('Apostas não permitidas no momento.')

  const potentialWin = amount * ant.odd

  //cria aposta
  return await prisma.$transaction(async () => {
    const bet = await prisma.bet.create({
      data: {
        userId,
        antId,
        roomId,
        amount,
        potentialWin,
        odd: ant.odd,
        type: betType,
        status: 'PENDING',
      },
    })

    //saque
    await prisma.user.update({
      where: { id: userId },
      data: { saldo: { decrement: amount } },
    })

    await prisma.transaction.create({
      data: {
        userId,
        amount: -amount,
        type: 'WITHDRAW',
      },
    })

    return bet
  })
}

//verifica aposta
export async function checkBetResults(roomId, resultado) {
  if (!Array.isArray(resultado) || resultado.length < 2) {
    throw new Error('Resultado inválido. Deve conter pelo menos duas formigas.')
  }

  const pendingBets = await prisma.bet.findMany({
    where: { status: 'PENDING', roomId },
  })

  if (pendingBets.length === 0) {
    return { message: 'Nenhuma aposta pendente encontrada.' }
  }

  return await prisma.$transaction(async () => {
    for (const bet of pendingBets) {
      let expectedAntId

      switch (bet.type) {
        case 'CAMPEA':
          expectedAntId = resultado[0]
          break
        case 'VICE':
          expectedAntId = resultado[1]
          break
        case 'PENULTIMA':
          expectedAntId = resultado[resultado.length - 2]
          break
        case 'ULTIMA':
          expectedAntId = resultado[resultado.length - 1]
          break
        default:
          throw new Error(`Tipo de aposta desconhecido: ${bet.type}`)
      }

      const isWinner = bet.antId === expectedAntId
      const newStatus = isWinner ? 'WON' : 'LOST'

      console.log(
        `Aposta ${bet.id} do usuário ${bet.userId}: ${isWinner ? 'GANHOU' : 'PERDEU'}`
      )

      await prisma.bet.update({
        where: { id: bet.id },
        data: { status: newStatus },
      })

      if (isWinner) {
        const payout = bet.potentialWin

        //deposito
        await Promise.all([
          prisma.user.update({
            where: { id: bet.userId },
            data: { saldo: { increment: payout } },
          }),
          prisma.transaction.create({
            data: {
              userId: bet.userId,
              amount: payout,
              type: 'DEPOSIT',
            },
          }),
        ])
      }
    }
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'FINALIZADA' },
    })

    return { message: 'Resultados das apostas processados!' }
  })
}

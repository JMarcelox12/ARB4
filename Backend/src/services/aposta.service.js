import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

//gerencia aposta
export async function placeBet(userId, antId, amount) {
  if (amount <= 0) {
    throw new Error('O valor da aposta deve ser maior que zero.')
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuário não encontrado.')

  if (user.saldo < amount) throw new Error('Saldo insuficiente.')

  const ant = await prisma.ant.findUnique({ where: { id: antId } })
  if (!ant) throw new Error('Formiga não encontrada.')

  //cria aposta
  return await prisma.$transaction(async (x) => {
    const bet = await x.bet.create({
      data: {
        userId,
        antId,
        amount,
        odd: ant.odd,
        status: 'PENDING',
      },
    })

    //saque
    await x.user.update({
      where: { id: userId },
      data: { saldo: { decrement: amount } },
    })

    await x.transaction.create({
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
export async function checkBetResults(winningAntId) {
  const pendingBets = await prisma.bet.findMany({
    where: { status: 'PENDING' },
  })

  if (pendingBets.length === 0) {
    return { message: 'Nenhuma aposta pendente encontrada.' }
  }

  return await prisma.$transaction(async (x) => {
    for (const bet of pendingBets) {
      const isWinner = bet.antId === winningAntId
      const newStatus = isWinner ? 'WON' : 'LOST'

      await x.bet.update({
        where: { id: bet.id },
        data: { status: newStatus },
      })

      if (isWinner) {
        const payout = bet.amount * bet.odd

        //deposito
        await x.user.update({
          where: { id: bet.userId },
          data: { saldo: { increment: payout } },
        })

        await x.transaction.create({
          data: {
            userId: bet.userId,
            amount: payout,
            type: 'DEPOSIT',
          },
        })
      }
    }
    return { message: 'Resultados das apostas processados!' }
  })
}

import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient()

//gerencia aposta
export async function placeBet(userId, antId, roomId, amount, BetType) {
  console.time('>>>> Tempo total da função placeBet')

  try {
    const usuario = parseInt(userId)
    const formiga = parseInt(antId)
    const sala = parseInt(roomId)
    const valor = parseFloat(amount)

    if (valor <= 0) {
      throw new Error('O valor da aposta deve ser maior que zero.')
    }

    console.time('--- Verificações pré-transação');

    const user = await prisma.user.findUnique({ where: { id: usuario } })
    if (!user) throw new Error('Usuário não encontrado.')

    if (user.saldo < valor) throw new Error('Saldo insuficiente.')

    const ant = await prisma.ant.findUnique({ where: { id: formiga } })
    if (!ant) throw new Error('Formiga não encontrada.')

    const room = await prisma.room.findUnique({ where: { id: sala } })
    if (!room) throw new Error('Sala não encontrada.')

    console.timeEnd('--- Verificações pré-transação');

    if (room.status === 'CORRENDO')
      throw new Error('Apostas não permitidas no momento.')

    const odd = parseFloat(ant.odd);
    const potentialWin = valor * odd;
    const pw = parseFloat(potentialWin.toFixed(2));

    console.time('--- Transação no Banco de Dados');
    //cria aposta
    return await prisma.$transaction(async () => {
      const bet = await prisma.bet.create({
        data: {
          userId: usuario,
          antId: formiga,
          roomId: sala,
          amount: valor,
          potentialWin: pw,
          odd: odd,
          type: BetType,
          status: 'PENDING',
        },
      })

      //saque
      await prisma.user.update({
        where: { id: usuario },
        data: { saldo: { decrement: valor } },
      })

      await prisma.transaction.create({
        data: {
          userId: usuario,
          amount: -valor,
          type: 'WITHDRAW',
        },
      },
        { timeout: 20000 }
      )
      console.timeEnd('--- Transação no Banco de Dados');

      return bet
    });
  } catch (error) {
    console.error({ error: error.message })
  } finally {
    console.timeEnd('>>>> Tempo total da função placeBet'); // Para o cronômetro geral
  }
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

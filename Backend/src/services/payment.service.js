import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function settleBetsForRace(io, roomId, finishedAntsOrder) {
  // Verificação de segurança: se não houver ordem de chegada, não há como determinar vencedores.
  if (!finishedAntsOrder || finishedAntsOrder.length === 0) {
    console.log(
      `[Sala ${roomId}] Sem ordem de chegada, nenhuma aposta a ser liquidada.`
    )
    return
  }

  console.log(`[Sala ${roomId}] Iniciando liquidação de apostas...`)

  // 1. Encontrar todas as apostas pendentes para esta corrida.
  // O 'include' é crucial para pegar a ODD no momento em que a aposta foi feita.
  const allPendingBets = await prisma.bet.findMany({
    where: {
      roomId: roomId,
      status: 'PENDING',
    },
    include: {
      ant: {
        select: { odd: true }, // Seleciona a odd da formiga relacionada
      },
    },
  })

  if (allPendingBets.length === 0) {
    console.log(`[Sala ${roomId}] Nenhuma aposta pendente encontrada.`)
    return
  }

  // 2. Mapear as posições chave para os IDs das formigas correspondentes.
  const raceSize = finishedAntsOrder.length
  const placementMap = {
    FIRST: finishedAntsOrder[0] || null,
    SECOND: raceSize > 1 ? finishedAntsOrder[1] : null,
    PENULTIMATE: raceSize > 1 ? finishedAntsOrder[raceSize - 2] : null,
    LAST: raceSize > 0 ? finishedAntsOrder[raceSize - 1] : null,
  }

  const transactionOperations = []
  let wonBetsCount = 0 // CORREÇÃO: Contagem mais simples e robusta
  let lostBetsCount = 0 // CORREÇÃO: Contagem mais simples e robusta

  // 3. Iterar sobre cada aposta para determinar seu resultado.
  for (const bet of allPendingBets) {
    const winningAntIdForBetType = placementMap[bet.betType]
    const isWinner = bet.antId === winningAntIdForBetType

    if (isWinner) {
      wonBetsCount++
      const payoutAmount = bet.amount * bet.ant.odd

      // Adiciona operações para pagar o usuário e atualizar a aposta
      transactionOperations.push(
        // Paga o saldo do usuário
        prisma.user.update({
          where: { id: bet.userId },
          data: { saldo: { increment: payoutAmount } },
        }),
        // Cria um registro da transação financeira
        prisma.transaction.create({
          data: {
            userId: bet.userId,
            amount: payoutAmount,
            type: 'WINNINGS', // Tipo mais específico
            description: `Ganhos da aposta (${bet.betType}) na sala ${roomId}`,
          },
        }),
        // Atualiza o status da aposta para 'WON'
        prisma.bet.update({
          where: { id: bet.id },
          data: { status: 'WON', payout: payoutAmount },
        })
      )

      // Notifica o usuário específico sobre seu ganho.
      // DICA: No seu app principal, faça com que cada usuário conectado entre em uma sala privada.
      // Ex: io.on('connection', socket => { socket.join(`user-${userId}`) });
      io.to(`user-${bet.userId}`).emit('bet_won', {
        message: `Parabéns! Você ganhou ${payoutAmount.toFixed(2)} na sua aposta!`,
        payout: payoutAmount,
      })
    } else {
      lostBetsCount++
      // Adiciona a operação para marcar a aposta como 'LOST'
      transactionOperations.push(
        prisma.bet.update({
          where: { id: bet.id },
          data: { status: 'LOST' },
        })
      )
    }
  }

  // 4. Executar todas as atualizações de banco de dados em uma única transação atômica.
  if (transactionOperations.length > 0) {
    try {
      await prisma.$transaction(transactionOperations)
      console.log(
        `[Sala ${roomId}] Liquidação finalizada. ${wonBetsCount} apostas pagas. ${lostBetsCount} apostas perdidas.`
      )
    } catch (error) {
      console.error(`[Sala ${roomId}] ERRO CRÍTICO ao liquidar apostas:`, error)
      // Relança o erro para que o chamador (roomManager) saiba que a operação falhou.
      throw error
    }
  }
}

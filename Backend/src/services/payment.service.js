// src/services/paymentService.js

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * Liquida todas as apostas pendentes para uma corrida finalizada.
 * Processa pagamentos para apostas vencedoras (1º, 2º, penúltimo, último)
 * e marca as perdedoras como 'LOST'.
 * @param {string} roomId - O ID da sala onde a corrida terminou.
 * @param {string[]} finishedAntsOrder - Array com os IDs das formigas na ordem exata de chegada.
 */
export async function settleBetsForRace(roomId, finishedAntsOrder) {
  if (!finishedAntsOrder || finishedAntsOrder.length === 0) {
    console.log(
      `[Sala ${roomId}] Sem ordem de chegada, nenhuma aposta a ser liquidada.`
    )
    return
  }

  console.log(`[Sala ${roomId}] Iniciando liquidação de apostas...`)

  // 1. Encontrar todas as apostas pendentes para esta corrida
  const allPendingBets = await prisma.bet.findMany({
    where: {
      roomId: roomId,
      status: 'PENDING',
    },
  })

  if (allPendingBets.length === 0) {
    console.log(`[Sala ${roomId}] Nenhuma aposta pendente encontrada.`)
    return
  }

  // 2. Determinar os IDs das posições chave
  const raceSize = finishedAntsOrder.length
  const firstPlaceId = finishedAntsOrder[0] || null
  const secondPlaceId = raceSize > 1 ? finishedAntsOrder[1] : null
  const lastPlaceId = raceSize > 0 ? finishedAntsOrder[raceSize - 1] : null
  const penultimatePlaceId =
    raceSize > 1 ? finishedAntsOrder[raceSize - 2] : null

  const payoutOperations = []
  const losingBetOperations = []

  // 3. Iterar sobre cada aposta e verificar se foi vencedora
  for (const bet of allPendingBets) {
    let isWinner = false
    let payoutMultiplier = 2 // Multiplicador padrão (ex: para 1º lugar)

    switch (bet.betType) {
      case 'FIRST':
        isWinner = bet.antId === firstPlaceId
        payoutMultiplier = 2 // Ex: Paga 2x
        break
      case 'SECOND':
        isWinner = bet.antId === secondPlaceId
        payoutMultiplier = 3 // Ex: Paga 3x, pois é mais difícil
        break
      case 'PENULTIMATE':
        isWinner = bet.antId === penultimatePlaceId
        payoutMultiplier = 5 // Ex: Paga 5x
        break
      case 'LAST':
        isWinner = bet.antId === lastPlaceId
        payoutMultiplier = 4 // Ex: Paga 4x
        break
    }

    if (isWinner) {
      // Se a aposta foi vencedora, prepara as operações de pagamento
      const payoutAmount = bet.amount * payoutMultiplier

      payoutOperations.push(
        prisma.user.update({
          where: { id: bet.userId },
          data: { balance: { increment: payoutAmount } },
        }),
        prisma.transaction.create({
          data: {
            userId: bet.userId,
            amount: payoutAmount,
            type: 'DEPOSIT',
            description: `Ganhos da aposta (${bet.betType}) na sala ${roomId}`,
          },
        }),
        prisma.bet.update({
          where: { id: bet.id },
          data: { status: 'PAID' },
        })
      )
    } else {
      // Se a aposta foi perdedora, prepara a operação para marcá-la como 'LOST'
      losingBetOperations.push(
        prisma.bet.update({
          where: { id: bet.id },
          data: { status: 'LOST' },
        })
      )
    }
  }

  // 4. Executar todas as atualizações em uma única transação
  const allOperations = [...payoutOperations, ...losingBetOperations]

  if (allOperations.length > 0) {
    try {
      await prisma.$transaction(allOperations)
      console.log(
        `[Sala ${roomId}] Liquidação finalizada. ${payoutOperations.length / 3} apostas pagas. ${losingBetOperations.length} apostas perdidas.`
      )
    } catch (error) {
      console.error(`[Sala ${roomId}] ERRO CRÍTICO ao liquidar apostas:`, error)
    }
  }
}

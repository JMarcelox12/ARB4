// Arquivo: src/services/ant.service.js

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Função auxiliar para calcular a odd.
// Mantida como está, pois sua lógica é interna a este módulo.
function calculateODDAnt(win, game) {
  if (game === 0 || win === 0) {
    // Para formigas novas ou que nunca venceram, pode-se definir uma odd padrão alta.
    return 10.0
  }

  // Fórmula de exemplo: (Total de jogos / Total de vitórias) + margem de segurança
  // Isso garante que odds sejam sempre > 1.
  const baseOdd = game / win
  const oddWithMargin = baseOdd * 1.1 // Adiciona uma margem de 10% para a "casa"

  return parseFloat(oddWithMargin.toFixed(2))
}

/**
 * Atualiza as estatísticas (vitórias, jogos) e recalcula as odds das formigas após uma corrida.
 * Emite um evento de socket para notificar os clientes.
 *
 * @param {object} io - A instância do servidor Socket.IO.
 * @param {number} roomId - O ID da sala onde a corrida ocorreu, para emitir o evento.
 * @param {Array<number>} finishedAntsOrder - Um array de IDs de formigas, na ordem em que terminaram.
 */
export async function updateAntStats(io, roomId, finishedAntsOrder) {
  // Verificação de segurança
  if (!finishedAntsOrder || finishedAntsOrder.length === 0) {
    console.log('Nenhuma formiga na corrida para atualizar estatísticas.')
    return
  }

  const winnerAntId = finishedAntsOrder[0]
  const otherAntsIds = finishedAntsOrder.slice(1)
  const allAntsIds = finishedAntsOrder

  console.log(
    `[Sala ${roomId}] Iniciando atualização de estatísticas. Vencedora: ${winnerAntId}. Participantes: ${allAntsIds.length}`
  )

  try {
    // --- Tudo acontece dentro de UMA ÚNICA TRANSAÇÃO do Prisma ---
    // Isso garante que ou tudo funciona, ou nada é salvo no banco de dados.
    await prisma.$transaction(async (tx) => {
      // 1. Atualiza a formiga vencedora (incrementa jogos e vitórias)
      await tx.ant.update({
        where: { id: winnerAntId },
        data: {
          game: { increment: 1 },
          win: { increment: 1 },
        },
      })

      // 2. Atualiza as outras formigas (incrementa apenas jogos)
      if (otherAntsIds.length > 0) {
        await tx.ant.updateMany({
          where: { id: { in: otherAntsIds } },
          data: { game: { increment: 1 } },
        })
      }

      // 3. Busca os dados ATUALIZADOS de todas as formigas que participaram
      const updatedAnts = await tx.ant.findMany({
        where: { id: { in: allAntsIds } },
        select: { id: true, win: true, game: true },
      })

      // 4. Recalcula e atualiza as odds para cada formiga com base nos novos dados
      const updateOddPromises = updatedAnts.map((ant) => {
        const newOdd = calculateODDAnt(ant.win, ant.game)
        return tx.ant.update({
          where: { id: ant.id },
          data: { odd: newOdd },
        })
      })

      // Executa todas as atualizações de odd em paralelo dentro da transação
      await Promise.all(updateOddPromises)
    })
    // --- FIM DA TRANSAÇÃO ---

    console.log(
      `[Sala ${roomId}] Estatísticas e odds de ${allAntsIds.length} formigas atualizadas com sucesso no DB.`
    )

    // 5. Após a transação ser bem-sucedida, notifica os clientes na sala correta.
    // O evento 'stats_updated' pode ser geral ou específico da sala.
    // Enviar para a sala específica é mais eficiente.
    io.to(String(roomId)).emit('stats_updated', {
      message: 'As odds foram atualizadas!',
    })
    console.log(`[Sala ${roomId}] Emitido 'stats_updated' para os clientes.`)
  } catch (error) {
    console.error(
      `[Sala ${roomId}] Erro crítico ao atualizar estatísticas das formigas:`,
      error
    )
    // Relançar o erro é importante para que a função chamadora (em roomManager)
    // possa capturá-lo em seu próprio bloco try/catch.
    throw error
  }
}

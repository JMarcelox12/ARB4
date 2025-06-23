import { PrismaClient } from '@prisma/client';

// Função auxiliar para calcular a odd.
// Supondo que ela receba o número de vitórias e jogos.
function calculateODDAnt(win, game) {
  if (game === 0) return 1.0; // Evita divisão por zero, odd base
  const winRate = win / game;
  // Exemplo simples de cálculo de odd (inverso da probabilidade com margem)
  // Você pode ter uma fórmula mais complexa.
  const odd = 1 / winRate;
  return parseFloat(odd.toFixed(2));
}

const prisma = new PrismaClient();

export async function updateAntStats(finishedAntsOrder) {
  if (!finishedAntsOrder || finishedAntsOrder.length === 0) {
    console.log("Nenhuma formiga na corrida para atualizar estatísticas.");
    return;
  }

  const winnerAntId = finishedAntsOrder[0];
  const otherAntsIds = finishedAntsOrder.slice(1);
  const allAntsIds = finishedAntsOrder;

  console.log(`Iniciando atualização de estatísticas. Vencedora: ${winnerAntId}. Total de participantes: ${allAntsIds.length}`);

  try {
    // --- Tudo acontece dentro de UMA ÚNICA TRANSAÇÃO ---
    await prisma.$transaction(async (tx) => {
      // 1. Atualiza a formiga vencedora
      await tx.ant.update({
        where: { id: winnerAntId },
        data: {
          game: { increment: 1 },
          win: { increment: 1 },
        },
      });

      // 2. Atualiza as outras formigas (perdedoras)
      if (otherAntsIds.length > 0) {
        await tx.ant.updateMany({
          where: { id: { in: otherAntsIds } },
          data: { game: { increment: 1 } },
        });
      }

      // 3. Busca os dados ATUALIZADOS de todas as formigas que participaram
      const updatedAnts = await tx.ant.findMany({
        where: { id: { in: allAntsIds } },
        select: { id: true, win: true, game: true },
      });

      // 4. Recalcula e atualiza as odds para cada formiga, uma por uma
      const updateOddPromises = updatedAnts.map(ant => {
        const newOdd = calculateODDAnt(ant.win, ant.game);
        return tx.ant.update({
          where: { id: ant.id },
          data: { odd: newOdd },
        });
      });

      // Executa todas as promessas de atualização de odd
      await Promise.all(updateOddPromises);
    });

    console.log(`Estatísticas e odds de ${allAntsIds.length} formigas atualizadas com sucesso.`);

    io.to(roomId).emit('stats_updated');
    console.log(`Backend: Emitindo 'stats_updated' para a sala ${roomId}`);

  } catch (error) {
    console.error("Erro ao atualizar estatísticas das formigas:", error);
    // É uma boa prática relançar o erro para que o chamador saiba que algo falhou
    throw error;
  }
}
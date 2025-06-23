import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function updateAntStats(finishedAntsOrder) {
  if (!finishedAntsOrder || finishedAntsOrder.length === 0) {
    console.log("Nenhuma formiga na corrida para atualizar estatísticas.");
    return;
  }

  const winnerAntId = finishedAntsOrder[0];
  console.log(`Atualizando estatísticas. Vencedora: ${winnerAntId}. Total de participantes: ${finishedAntsOrder.length}`);
  
  const updateOperations = [];

  // 1. Operação para a formiga vencedora
  const winnerUpdate = prisma.ant.update({
    where: { id: winnerAntId },
    data: {
      racesRun: { increment: 1 },
      wins: { increment: 1 }
    }
  });
  updateOperations.push(winnerUpdate);

  // 2. Operações para as outras formigas
  const otherAntsIds = finishedAntsOrder.slice(1);
  if(otherAntsIds.length > 0){
    const losersUpdate = prisma.ant.updateMany({
      where: {
        id: { in: otherAntsIds }
      },
      data: {
        racesRun: { increment: 1 }
      }
    });
    updateOperations.push(losersUpdate);
  }

  try {
    // 3. Executa as atualizações em uma transação para garantir consistência
    await prisma.$transaction(updateOperations);
    console.log(`Estatísticas de ${finishedAntsOrder.length} formigas atualizadas com sucesso.`);
  } catch (error) {
    console.error("Erro ao atualizar estatísticas das formigas:", error);
  }
}
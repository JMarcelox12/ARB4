import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function settleBetsForRace(roomId, finishedAntsOrder) {
  if (!finishedAntsOrder || finishedAntsOrder.length === 0) {
    console.log(`[Sala ${roomId}] Sem ordem de chegada, nenhuma aposta a ser liquidada.`);
    return;
  }

  console.log(`[Sala ${roomId}] Iniciando liquidação de apostas...`);

  // 1. Encontrar todas as apostas pendentes para esta corrida, JÁ INCLUINDO AS ODDS.
  const allPendingBets = await prisma.bet.findMany({
    where: {
      roomId: roomId,
      status: 'PENDING',
    },
    include: {
      ant: {
        select: { odd: true }
      }
    }
  });

  if (allPendingBets.length === 0) {
    console.log(`[Sala ${roomId}] Nenhuma aposta pendente encontrada.`);
    return;
  }

  // 2. Determinar os IDs das posições chave
  const raceSize = finishedAntsOrder.length;
  const placementMap = {
    FIRST: finishedAntsOrder[0] || null,
    SECOND: raceSize > 1 ? finishedAntsOrder[1] : null,
    PENULTIMATE: raceSize > 1 ? finishedAntsOrder[raceSize - 2] : null,
    LAST: raceSize > 0 ? finishedAntsOrder[raceSize - 1] : null,
  };

  const transactionOperations = [];

  // 3. Iterar sobre cada aposta e verificar se foi vencedora
  for (const bet of allPendingBets) {
    const winningAntIdForBetType = placementMap[bet.betType];
    const isWinner = bet.antId === winningAntIdForBetType;

    if (isWinner) {
      // --- CORREÇÃO CRÍTICA ---
      // O pagamento deve ser calculado com base na ODD no momento da aposta, não um multiplicador fixo.
      const payoutAmount = bet.amount * bet.ant.odd; // Usando a odd da aposta.
      // bet.ant.odd vem do 'include' que fizemos na busca.

      // Adiciona as operações de pagamento
      transactionOperations.push(
        prisma.user.update({
          where: { id: bet.userId },
          data: { saldo: { increment: payoutAmount } }, // 'saldo' em vez de 'balance' para consistência
        }),
        prisma.transaction.create({
          data: {
            userId: bet.userId,
            amount: payoutAmount,
            type: 'DEPOSIT', // ou 'WINNINGS' para ser mais específico
            description: `Ganhos da aposta (${bet.betType}) na sala ${roomId}`,
          },
        }),
        prisma.bet.update({
          where: { id: bet.id },
          data: { status: 'WON', payout: payoutAmount }, // Opcional: Salvar o valor pago
        })
      );
    } else {
      // Adiciona a operação para marcar como perdida
      transactionOperations.push(
        prisma.bet.update({
          where: { id: bet.id },
          data: { status: 'LOST' },
        })
      );
    }
  }

  // 4. Executar todas as atualizações em uma única transação
  if (transactionOperations.length > 0) {
    try {
      await prisma.$transaction(transactionOperations);

      const wonBetsCount = transactionOperations.filter(op => op.model === 'Bet' && op.args.data.status === 'WON').length;
      const lostBetsCount = transactionOperations.length - (wonBetsCount * 3); // Cada aposta ganha gera 3 operações

      console.log(`[Sala ${roomId}] Liquidação finalizada. ${wonBetsCount} apostas pagas. ${lostBetsCount} apostas perdidas.`);
    } catch (error) {
      console.error(`[Sala ${roomId}] ERRO CRÍTICO ao liquidar apostas:`, error);
      // É uma boa prática relançar o erro para que o serviço que chamou esta função saiba que falhou.
      throw error;
    }
  }
}
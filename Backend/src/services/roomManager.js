import { PrismaClient } from '@prisma/client';
import { settleBetsForRace } from './payment.service.js';
import { updateAntStats } from './ant.service.js';

const prisma = new PrismaClient();

// Objeto principal que guarda o estado e o timer de cada sala ativa.
const activeRooms = {};

// Variável do módulo para guardar a instância do Socket.IO.
let io;

export function initializeSocket(socketIoInstance) {
  console.log('Socket.IO instance received in roomManager.');
  io = socketIoInstance;
}

/**
 * Simula a corrida para uma sala específica.
 * Resolve com os resultados da corrida.
 * Emite eventos de 'race_update' durante a corrida e 'confetti_burst' no final.
 */
async function startRaceSimulation(roomId, ants) {
  console.log(`[Sala ${roomId}] Simulação de corrida iniciada.`);

  return new Promise((resolve) => {
    // Limpa qualquer timer de simulação antigo, caso exista
    if (activeRooms[roomId]?.simulationInterval) {
      clearInterval(activeRooms[roomId].simulationInterval);
    }

    const antPositions = {};
    ants.forEach((ant) => {
      antPositions[ant.id] = 0;
    });

    const raceLength = 1000;
    const raceDuration = 20000; // 20 segundos

    // Inicializa/Reseta o estado da corrida na sala
    activeRooms[roomId].antPositions = antPositions;
    activeRooms[roomId].finishedAntsOrder = [];
    activeRooms[roomId].raceStartedAt = Date.now();
    activeRooms[roomId].confettiFired = false; // Flag para o evento de confetes

    const simulationInterval = setInterval(() => {
      if (!activeRooms[roomId]) {
        clearInterval(simulationInterval);
        return;
      }

      const currentRaceTime = Date.now() - activeRooms[roomId].raceStartedAt;
      const newPositions = { ...activeRooms[roomId].antPositions };
      const finishedThisTick = new Set();

      ants.forEach((ant) => {
        if (activeRooms[roomId].finishedAntsOrder.includes(ant.id)) {
          newPositions[ant.id] = raceLength;
          return;
        }
        const speed = Math.random() * (raceLength / raceDuration) * 150;
        const newPosition = Math.min(newPositions[ant.id] + speed, raceLength);
        newPositions[ant.id] = newPosition;

        if (newPosition >= raceLength) {
          finishedThisTick.add(ant.id);
        }
      });

      if (finishedThisTick.size > 0) {
        finishedThisTick.forEach((antId) => {
          if (!activeRooms[roomId].finishedAntsOrder.includes(antId)) {
            activeRooms[roomId].finishedAntsOrder.push(antId);
          }
        });
      }

      activeRooms[roomId].antPositions = newPositions;

      const antsForFrontend = ants.map((ant) => ({
        id: ant.id,
        position: ((newPositions[ant.id] / raceLength) * 100).toFixed(0),
      }));

      if (io) io.to(String(roomId)).emit('race_update', { roomId, ants: antsForFrontend });

      const allFinished = activeRooms[roomId].finishedAntsOrder.length === ants.length;

      // NOVO: Dispara o evento de confetes quando todas as formigas terminam
      if (allFinished && !activeRooms[roomId].confettiFired) {
        if (io) io.to(String(roomId)).emit('confetti_burst');
        activeRooms[roomId].confettiFired = true;
        console.log(`[Sala ${roomId}] Todas as formigas chegaram. Confetes disparados!`);
      }

      const timeLimitReached = currentRaceTime >= raceDuration * 1.5;

      if (allFinished || timeLimitReached) {
        clearInterval(simulationInterval);
        activeRooms[roomId].simulationInterval = null;
        console.log(`[Sala ${roomId}] Simulação de corrida terminada.`);
        const results = {
          winnerId: activeRooms[roomId].finishedAntsOrder[0] || null,
          finishedAntsOrder: activeRooms[roomId].finishedAntsOrder,
        };
        resolve(results);
      }
    }, 100);

    activeRooms[roomId].simulationInterval = simulationInterval;
  });
}

/**
 * Processa os resultados da corrida (pagamentos, estatísticas) e os salva.
 * Não altera o estado da sala, apenas lida com a lógica pós-corrida.
 */
async function processRaceResults(roomId, raceResults) {
    try {
        console.log(`[Sala ${roomId}] Processando resultados pós-corrida. Vencedor: ${raceResults.winnerId}`);
        
        const { winnerId, finishedAntsOrder } = raceResults;

        // Salva os resultados no objeto da sala para uso posterior pelo loop principal
        if (activeRooms[roomId]) {
            activeRooms[roomId].raceResults = { winnerId, finishedAntsOrder };
        }

        // Processa pagamentos e estatísticas em segundo plano
        await Promise.all([
            settleBetsForRace(io, roomId, finishedAntsOrder),
            updateAntStats(roomId, finishedAntsOrder),
        ]);

        // Atualiza o pódio no banco de dados
        await prisma.room.update({
            where: { id: roomId },
            data: {
                winnerId: winnerId,
                vice: finishedAntsOrder[1] || null,
                terceiro: finishedAntsOrder[2] || null,
            },
        });

        console.log(`[Sala ${roomId}] Resultados da corrida processados e salvos.`);

    } catch (error) {
        console.error(`[Sala ${roomId}] Erro ao processar resultados da corrida:`, error);
        if (activeRooms[roomId]) {
            activeRooms[roomId].status = 'PAUSE';
            activeRooms[roomId].faseStartTime = Date.now();
        }
    }
}


/**
 * Inicia e gerencia o ciclo de vida de uma sala (Pausa -> Apostando -> Correndo -> Encerrada).
 */
export async function startRoomCycle(roomId, initialStatus = 'PAUSE') {
  console.log(`\n[Sala ${roomId}] Iniciando ciclo com status: ${initialStatus} às ${new Date().toLocaleTimeString()}\n`);

  if (activeRooms[roomId]?.mainInterval) {
    clearInterval(activeRooms[roomId].mainInterval);
  }

  activeRooms[roomId] = {
    ...activeRooms[roomId],
    status: initialStatus,
    faseStartTime: Date.now(),
    mainInterval: null,
    simulationInterval: null,
    raceResults: null,
  };

  const fasesConfig = {
    PAUSE: 10,
    APOSTANDO: 10,
    CORRENDO: 35,
    ENCERRADA: 30,
  };

  const updateRoomState = async () => {
    if (!activeRooms[roomId]) return;

    let { status, faseStartTime } = activeRooms[roomId];
    const duration = fasesConfig[status] || 0;
    let remainingTime = Math.max(0, duration - Math.floor((Date.now() - faseStartTime) / 1000));

    if (remainingTime <= 0) {
      activeRooms[roomId].faseStartTime = Date.now();

      switch (status) {
        case 'PAUSE':
          activeRooms[roomId].status = 'APOSTANDO';
          break;

        case 'APOSTANDO':
          activeRooms[roomId].status = 'CORRENDO';

          // Dispara a simulação e o processamento em segundo plano, sem bloquear o loop.
          (async () => {
            try {
              const roomWithAnts = await prisma.room.findUnique({
                where: { id: roomId },
                include: { rooms: { include: { ant: true } } },
              });
              const antsInRace = roomWithAnts?.rooms.map((ra) => ra.ant);
              
              if (!antsInRace || antsInRace.length === 0) {
                 console.log(`[Sala ${roomId}] Sem formigas para a corrida. Preparando para pular fase.`);
                 if (activeRooms[roomId]) activeRooms[roomId].raceResults = { winnerId: null, finishedAntsOrder: [] };
                 return;
              }

              const results = await startRaceSimulation(roomId, antsInRace);
              await processRaceResults(roomId, results);
            } catch (e) {
              console.error(`[Sala ${roomId}] Erro na cadeia de execução da corrida:`, e);
            }
          })(); // IIFE (Immediately Invoked Function Expression)
          break;

        case 'CORRENDO':
          // O tempo da fase CORRENDO terminou. Agora, fazemos a transição.
          activeRooms[roomId].status = 'ENCERRADA';

          const results = activeRooms[roomId].raceResults;

          // Emite o evento final com os dados do pódio para o frontend
          if (io && results) {
            io.to(String(roomId)).emit('race_finished', {
              roomId,
              winnerId: results.winnerId,
              finishedAntsOrder: results.finishedAntsOrder,
            });
          }
          
          // Limpa os resultados para a próxima corrida
          delete activeRooms[roomId].raceResults;
          break;

        case 'ENCERRADA':
          activeRooms[roomId].status = 'PAUSE';
          // Limpa o pódio no banco de dados para a próxima corrida
          await prisma.room.update({
            where: { id: roomId },
            data: { winnerId: null, vice: null, terceiro: null },
          });
          break;
      }
    }

    if (io) {
      io.to(String(roomId)).emit('room_state_update', {
        status: activeRooms[roomId].status,
        tempoRestante: remainingTime,
      });
    }
  };

  const intervalId = setInterval(updateRoomState, 1000);
  if (activeRooms[roomId]) {
    activeRooms[roomId].mainInterval = intervalId;
  }
  updateRoomState(); // Chama imediatamente para definir o estado inicial
}

/**
 * Para completamente o ciclo de uma sala.
 */
export function stopRoomCycle(roomId) {
  if (activeRooms[roomId]) {
    if (activeRooms[roomId].mainInterval) clearInterval(activeRooms[roomId].mainInterval);
    if (activeRooms[roomId].simulationInterval) clearInterval(activeRooms[roomId].simulationInterval);
    delete activeRooms[roomId];
    console.log(`\n[Sala ${roomId}] Ciclo da sala e todas as atividades encerradas manualmente.`);
  }
}

// Exporta o objeto de salas ativas para consulta externa, se necessário
export { activeRooms };
import { io } from '../../app.js';
import { PrismaClient } from '@prisma/client';

const activeRooms = {};
const prisma = new PrismaClient();

// Função para iniciar uma nova corrida (chamada quando uma sala entra no status "correndo")
async function startRaceSimulation(roomId, ants) {
  if (activeRooms[roomId] && activeRooms[roomId].interval) {
    clearInterval(activeRooms[roomId].interval); // Limpa qualquer simulação anterior
  }

  const antPositions = {};
  ants.forEach((ant) => {
    antPositions[ant.id] = 0; // Posição inicial
  });

  const raceLength = 1000; // Comprimento total da pista (ex: 1000 unidades)
  const raceDuration = 15000; // Duração estimada da corrida em ms (15 segundos)

  activeRooms[roomId] = {
    status: 'correndo',
    antPositions: antPositions,
    winnerId: null,
    finishedAnts: new Set(), // Para controlar quais formigas já chegaram
    finishedAntsOrder: [], // Ordem de chegada
    interval: null,
    raceLength: raceLength,
    raceStartedAt: Date.now(), // Marca o início real da corrida
    raceDuration: raceDuration,
  };

  console.log(`Backend: Iniciando simulação para sala: ${roomId}`);

  // --- Lógica de Simulação da Corrida ---
  activeRooms[roomId].interval = setInterval(async () => {
    const currentRaceTime = Date.now() - activeRooms[roomId].raceStartedAt; // Usa o raceStartedAt do activeRooms

    const newPositions = { ...activeRooms[roomId].antPositions };
    let allFinished = true;

    ants.forEach((ant) => {
      if (!activeRooms[roomId].finishedAnts.has(ant.id)) {
        // Aumenta a posição. Exemplo simples: velocidade aleatória
        // Você pode usar 'ant.speed' do seu DB se tiver
        const currentPosition = newPositions[ant.id]
        const speed = Math.random() * ((raceLength / raceDuration) * 150) // Ajuste a velocidade para sua animação
        const newPosition = Math.min(currentPosition + speed, raceLength)
        newPositions[ant.id] = newPosition

        if (newPosition >= raceLength) {
          activeRooms[roomId].finishedAnts.add(ant.id)
          activeRooms[roomId].finishedAntsOrder.push(ant.id)
          console.log(`Formiga ${ant.id} finalizou a corrida na sala ${roomId}`)
        } else {
          allFinished = false // Ainda há formigas correndo
        }
      }
    })

    activeRooms[roomId].antPositions = newPositions;

    const antsForFrontend = ants.map((ant) => ({
      id: ant.id,
      position: ((newPositions[ant.id] / raceLength) * 100).toFixed(0), // Posição em %
    }));

    console.log('Backend: Emitindo race_update para sala', roomId, antsForFrontend); // LOG DE DEBUG
    io.to(roomId).emit('race_update', {
      roomId: roomId,
      ants: antsForFrontend,
    });

    // Verifica se a corrida terminou (todas as formigas ou tempo limite)
    if (allFinished || currentRaceTime >= raceDuration * 1.5) {
      clearInterval(activeRooms[roomId].interval);
      const winnerId = activeRooms[roomId].finishedAntsOrder[0]; // O primeiro a chegar é o vencedor

      activeRooms[roomId].status = 'encerrada'; // Atualiza o status local para 'encerrada'
      activeRooms[roomId].winnerId = winnerId;

      try {
        await prisma.room.update({
          where: { id: roomId },
          data: {
            winnerId: winnerId,
            vice: activeRooms[roomId].finishedAntsOrder[1] || null,
            terceiro: activeRooms[roomId].finishedAntsOrder[2] || null,
            quarto: activeRooms[roomId].finishedAntsOrder[3] || null,
            quinto: activeRooms[roomId].finishedAntsOrder[4] || null,
            sexto: activeRooms[roomId].finishedAntsOrder[5] || null,
            penultimo: activeRooms[roomId].finishedAntsOrder[6] || null,
            ultimo: activeRooms[roomId].finishedAntsOrder[7] || null,
          },
        });
        console.log(`Backend: Vencedor da sala ${roomId} persistido no DB: ${winnerId}`); // LOG DE DEBUG
      } catch (error) {
        console.error('Backend: Erro ao persistir vencedor da sala: ', error);
      }

      console.log('Backend: Emitindo race_finished para sala', roomId, { winnerId }); // LOG DE DEBUG
      io.to(roomId).emit('race_finished', {
        roomId: roomId,
        winnerId: winnerId,
        finalPositions: antsForFrontend, // Posições finais
        finishedAntsOrder: activeRooms[roomId].finishedAntsOrder, // Ordem completa de chegada
      });

      console.log(`Corrida na sala ${roomId} terminou! Vencedor: ${winnerId}`);
      // NENHUM room_state_update AQUI. Deixe o startRoomCycle lidar com isso.
    }
  }, 100); // Atualiza a cada 100ms (10 vezes por segundo)
}

let roomTimers = {}; // Para gerenciar os timers de cada fase da sala

async function startRoomCycle(roomId, initialStatus = 'apostando') {
  console.log(`Backend: Iniciando ciclo da sala: ${roomId} com status inicial: ${initialStatus}`); // LOG DE DEBUG
  if (roomTimers[roomId]) {
    clearInterval(roomTimers[roomId].interval);
  }

  let currentStatus = initialStatus;

  // Assegura que o startTime é definido para a fase inicial
  roomTimers[roomId] = {
    startTime: Date.now(),
    interval: null,
    encerradaStartTime: null // Para a fase 'encerrada'
  };

  const updateRoomState = async () => {
    let remainingTime; // Variável para o tempo restante da fase atual
    let antsInRace = []; // Variável para armazenar as formigas da corrida

    const fasesBackend = {
      PAUSE: 30,
      BETTING: 60,
      RACING: 15,
      ENCERRADA: 30,
    };

    const durationInSeconds = fasesBackend[currentStatus.toUpperCase()] || 0;

    // Lógica de transição de status
    if (currentStatus === 'correndo') {
      // Se a corrida está ativa, o tempo restante deve vir da simulação da corrida
      if (activeRooms[roomId] && activeRooms[roomId].status === 'correndo') {
        const raceDurationFromSim = activeRooms[roomId].raceDuration * 1.5;
        const raceElapsedTime = Date.now() - activeRooms[roomId].raceStartedAt;
        remainingTime = Math.max(0, Math.floor((raceDurationFromSim - raceElapsedTime) / 1000));
        // O status permanece 'correndo'
      } else if (activeRooms[roomId] && activeRooms[roomId].status === 'encerrada') {
        // A simulação terminou, agora a sala está na fase 'encerrada'
        currentStatus = 'encerrada';
        if (!roomTimers[roomId].encerradaStartTime) {
          roomTimers[roomId].encerradaStartTime = Date.now();
        }
        remainingTime = Math.max(0, fasesBackend.ENCERRADA - Math.floor((Date.now() - roomTimers[roomId].encerradaStartTime) / 1000));
      } else {
        // Fallback: se a corrida deveria estar correndo, mas não há activeRoom, volta para pausa
        currentStatus = 'pausando';
        roomTimers[roomId].startTime = Date.now();
        roomTimers[roomId].encerradaStartTime = null; // Reseta para próxima vez
        remainingTime = fasesBackend.PAUSE;
      }
    } else {
      // Para fases PAUSE, BETTING, ENCERRADA (antes de iniciar a próxima)
      remainingTime = Math.max(
        0,
        durationInSeconds - Math.floor((Date.now() - roomTimers[roomId].startTime) / 1000)
      );

      if (remainingTime <= 0) {
        switch (currentStatus) {
          case 'pausando':
            currentStatus = 'apostando';
            break;
          case 'apostando':
            currentStatus = 'correndo';
            roomTimers[roomId].startTime = Date.now(); // Reseta o timer para a nova fase 'correndo'
            roomTimers[roomId].encerradaStartTime = null; // Garante que está limpo

            // BUSCAR FORMIGAS DIRETAMENTE DO PRISMA
            try {
              const roomWithAnts = await prisma.room.findUnique({
                where: { id: roomId },
                include: { rooms: { include: { ant: true } } },
              });

              if (roomWithAnts && roomWithAnts.rooms && roomWithAnts.rooms.length > 0) {
                antsInRace = roomWithAnts.rooms.map((roomAnt) => roomAnt.ant);
                startRaceSimulation(roomId, antsInRace); // INICIA A SIMULAÇÃO DA CORRIDA
              } else {
                console.error(`[Sala ${roomId}] Formigas não encontradas para iniciar a corrida. Voltando para PAUSE.`);
                currentStatus = 'pausando'; // Em caso de erro ou falta de formigas, volta para pausando
                roomTimers[roomId].startTime = Date.now(); // Reseta para próxima fase
              }
            } catch (error) {
              console.error(`[Sala ${roomId}] Erro ao buscar formigas para a corrida:`, error);
              currentStatus = 'pausando'; // Em caso de erro no DB, volte para pausando
              roomTimers[roomId].startTime = Date.now(); // Reseta para próxima fase
            }
            break;
          case 'encerrada':
            currentStatus = 'pausando'; // Volta para pausando para iniciar um novo ciclo
            roomTimers[roomId].startTime = Date.now(); // Reseta o timer
            roomTimers[roomId].encerradaStartTime = null; // Reseta para próxima vez
            break;
          default:
            currentStatus = 'pausando'; // Estado inicial padrão
            roomTimers[roomId].startTime = Date.now(); // Reseta o timer
            roomTimers[roomId].encerradaStartTime = null; // Reseta para próxima vez
        }
      }
    }

    // Atualiza o status da sala no activeRooms para que outras requisições possam ver
    if (!activeRooms[roomId]) { // Cria se não existir (para o caso de primeira inicialização)
      activeRooms[roomId] = {};
    }
    activeRooms[roomId].status = currentStatus;
    // O tempo restante só é relevante para o `room_state_update` emitido, não precisa ser salvo em activeRooms se já vem da simulação

    console.log(`Backend: Sala ${roomId} - Status: ${currentStatus}, Tempo Restante: ${Math.floor(remainingTime)}s`); // LOG DE DEBUG
    const tempo = Math.floor(remainingTime)
    io.to(roomId).emit('room_state_update', {
      tempoRestante: tempo,
      status: currentStatus
    });
  };

  roomTimers[roomId].interval = setInterval(updateRoomState, 1000); // Atualiza a cada segundo
  updateRoomState(); // Chama uma vez imediatamente para inicializar
}

// Função para parar o ciclo de uma sala (chamada em 'endRoom' no controller)
export function stopRoomCycle(roomId) {
  if (activeRooms[roomId] && activeRooms[roomId].interval) {
    clearInterval(activeRooms[roomId].interval);
    delete activeRooms[roomId];
  }
  if (roomTimers[roomId] && roomTimers[roomId].interval) {
    clearInterval(roomTimers[roomId].interval);
    delete roomTimers[roomId];
  }
  console.log(`Backend: Ciclo da sala ${roomId} encerrado no gerenciador.`);
}

export { startRaceSimulation, startRoomCycle, activeRooms };
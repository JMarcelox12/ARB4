import { io } from '../../app.js'
import { PrismaClient } from '@prisma/client'

const activeRooms = {}

const prisma = new PrismaClient()

// Função para iniciar uma nova corrida (chamada quando uma sala entra no status "correndo")
async function startRaceSimulation(roomId, ants) {
  if (activeRooms[roomId] && activeRooms[roomId].interval) {
    clearInterval(activeRooms[roomId].interval) // Limpa qualquer simulação anterior
  }

  // Inicializa as posições das formigas (todas em 0 no início)
  const antPositions = {}
  ants.forEach((ant) => {
    antPositions[ant.id] = 0 // Posição inicial
  })

  const raceLength = 1000 // Comprimento total da pista (ex: 1000 unidades)
  let raceStartedAt = Date.now()
  let raceDuration = 15000 // Duração estimada da corrida em ms (15 segundos)
  let currentRaceTime = 0

  activeRooms[roomId] = {
    status: 'correndo',
    antPositions: antPositions,
    winnerId: null,
    finishedAnts: new Set(), // Para controlar quais formigas já chegaram
    finishedAntsOrder: [], // Ordem de chegada
    interval: null,
    // Você pode adicionar mais estados aqui, como 'bets', 'players', etc.
    raceLength: raceLength,
    raceStartedAt: Date.now(),
    raceDuration: raceDuration,
  }

  // --- Lógica de Simulação da Corrida ---
  activeRooms[roomId].interval = setInterval(async () => {
    currentRaceTime = Date.now() - raceStartedAt

    // Calcula a posição de cada formiga
    // Aqui você pode adicionar lógica mais complexa:
    // - Velocidades aleatórias ou pré-determinadas
    // - Aceleradores/desaceleradores no caminho
    // - Variância na velocidade de cada formiga
    const newPositions = { ...activeRooms[roomId].antPositions }
    let allFinished = true

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

    activeRooms[roomId].antPositions = newPositions

    // Envia as atualizações das posições para o frontend
    // Converte a posição para porcentagem (0-100) para o frontend
    const antsForFrontend = ants.map((ant) => ({
      id: ant.id,
      position: (newPositions[ant.id] / raceLength) * 100, // Posição em %
    }))

    io.to(roomId).emit('race_update', {
      roomId: roomId,
      ants: antsForFrontend,
      // winner: activeRooms[roomId].winnerId // Pode enviar winner aqui se já souber
    })

    // Verifica se a corrida terminou (todas as formigas ou tempo limite)
    if (allFinished || currentRaceTime >= raceDuration * 1.5) {
      // Ex: 1.5x a duração estimada
      clearInterval(activeRooms[roomId].interval)
      const winnerId = activeRooms[roomId].finishedAntsOrder[0] // O primeiro a chegar é o vencedor

      // Define o vencedor e atualiza o estado da sala
      activeRooms[roomId].status = 'encerrada'
      activeRooms[roomId].winnerId = winnerId

      try {
        await prisma.room.update({
          where: {
            id: roomId,
          },
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
        })
      } catch (error) {
        console.error('Erro ao acessar vencedor da sala: ', error)
      }

      // Envia o evento de corrida finalizada para o frontend
      io.to(roomId).emit('race_finished', {
        roomId: roomId,
        winnerId: winnerId,
        finalPositions: antsForFrontend, // Posições finais
        finishedAntsOrder: activeRooms[roomId].finishedAntsOrder, // Ordem completa de chegada
      })

      console.log(`Corrida na sala ${roomId} terminou! Vencedor: ${winnerId}`)

      // TODO: Chame a lógica de pagamento/resolução de apostas aqui
      // resolveBets(roomId, winnerId, activeRooms[roomId].finishedAntsOrder);
    }

    // Envia o estado geral da sala (status, tempo restante, etc.)
    // Este evento 'room_state_update' sincroniza o cronômetro e o status da sala
    io.to(roomId).emit('room_state_update', {
      status: activeRooms[roomId].status,
      tempoRestante: Math.max(
        0,
        Math.floor((raceDuration * 1.5 - currentRaceTime) / 1000)
      ),
      winnerId: activeRooms[roomId].winnerId,
    })
  }, 100) // Atualiza a cada 100ms (10 vezes por segundo)
}

// --- Funções para gerenciar o estado da sala (tempo de aposta, pausando, etc.) ---
// Você provavelmente já tem uma lógica para isso. Aqui vamos integrá-la.

let roomTimers = {} // Para gerenciar os timers de cada fase da sala

async function startRoomCycle(roomId, initialStatus = 'apostando') {
  if (roomTimers[roomId]) {
    clearInterval(roomTimers[roomId].interval)
  }

  let currentStatus = initialStatus
  let timerDuration // Em segundos

  const updateRoomState = async () => {
    let remainingTime // Variável para o tempo restante da fase atual
    let antsInRace = [] // Variável para armazenar as formigas da corrida

    // Defina as durações das fases aqui (em segundos).
    // Isso é importante para que o backend tenha controle sobre o tempo.
    const fasesBackend = {
      PAUSE: 30,
      BETTING: 60,
      RACING: 15, // Duração estimada para a animação da corrida no frontend
      ENCERRADA: 30, // Tempo para mostrar o resultado e preparar a próxima
    }

    // A duração da fase atual é definida com base no `currentStatus`
    const durationInSeconds = fasesBackend[currentStatus.toUpperCase()] || 0

    // Calcula o tempo restante da fase atual (com base no `startTime` do timer da sala)
    // Este `remainingTime` será enviado para o frontend.
    remainingTime = Math.max(
      0,
      durationInSeconds -
        Math.floor((Date.now() - roomTimers[roomId].startTime) / 1000)
    )

    // Lógica de transição de status
    // Verifica se o tempo da fase atual acabou (ou se é a fase 'correndo' e a simulação terminou)
    if (remainingTime <= 0 && currentStatus !== 'correndo') {
      // Se o tempo da fase atual terminou e NÃO estamos na corrida
      switch (currentStatus) {
        case 'pausando':
          currentStatus = 'apostando'
          break
        case 'apostando':
          currentStatus = 'correndo'
          // --- AQUI ESTÁ A CORREÇÃO: BUSCAR FORMIGAS DIRETAMENTE DO PRISMA ---
          try {
            const roomWithAnts = await prisma.room.findUnique({
              where: { id: roomId },
              // Inclui a relação para as formigas associadas à sala
              include: { rooms: { include: { ant: true } } },
            })

            if (
              roomWithAnts &&
              roomWithAnts.rooms &&
              roomWithAnts.rooms.length > 0
            ) {
              antsInRace = roomWithAnts.rooms.map((roomAnt) => roomAnt.ant)
              // Inicia a simulação da corrida, passando as formigas carregadas
              startRaceSimulation(roomId, antsInRace)
            } else {
              console.error(
                `[Sala ${roomId}] Formigas não encontradas para iniciar a corrida. Voltando para PAUSE.`
              )
              // Em caso de erro ou falta de formigas, volta para pausando
              currentStatus = 'pausando'
            }
          } catch (error) {
            console.error(
              `[Sala ${roomId}] Erro ao buscar formigas para a corrida:`,
              error
            )
            currentStatus = 'pausando' // Em caso de erro no DB, volte para pausando
          }
          break
        case 'encerrada':
          currentStatus = 'pausando' // Volta para pausando para iniciar um novo ciclo
          break
        default:
          currentStatus = 'pausando' // Estado inicial padrão
      }
      roomTimers[roomId].startTime = Date.now() // Reseta o timer para a nova fase
    } else if (currentStatus === 'correndo') {
      // --- CUIDADO NA FASE 'correndo' ---
      // Nesta fase, o tempo restante e o status vêm da `startRaceSimulation` (via `activeRooms`)
      // O timer principal (updateRoomState) NÃO deve controlar o `remainingTime` ou `status`
      // da corrida. Ele apenas reflete o que a simulação está ditando.
      // Se a simulação já terminou e marcou o status como 'encerrada', este timer principal
      // deve refletir isso e começar a contagem para a fase 'encerrada'.
      if (activeRooms[roomId] && activeRooms[roomId].status === 'encerrada') {
        // Se a simulação já terminou, atualize o status para 'encerrada'
        currentStatus = 'encerrada'
        // E comece a contagem para a duração da fase 'encerrada'
        if (!roomTimers[roomId].encerradaStartTime) {
          // Marca o início da fase 'encerrada' se ainda não marcou
          roomTimers[roomId].encerradaStartTime = Date.now()
        }
        remainingTime = Math.max(
          0,
          fasesBackend.ENCERRADA -
            Math.floor(
              (Date.now() - roomTimers[roomId].encerradaStartTime) / 1000
            )
        )
      } else if (
        activeRooms[roomId] &&
        activeRooms[roomId].status === 'correndo'
      ) {
        // Se a corrida ainda está acontecendo, use o tempo da simulação
        currentStatus = 'correndo'
        // Você pode calcular um tempo restante "estimado" para a corrida aqui para o cronômetro visual
        const raceDurationFromSim = activeRooms[roomId].raceDuration * 1.5 // Use a duração da simulação
        const raceElapsedTime = Date.now() - activeRooms[roomId].raceStartedAt
        remainingTime = Math.max(
          0,
          Math.floor((raceDurationFromSim - raceElapsedTime) / 1000)
        )
      } else {
        // Caso a simulação não tenha iniciado ainda ou algum estado inconsistente
        currentStatus = 'pausando' // fallback
        remainingTime = fasesBackend.PAUSE // fallback
        roomTimers[roomId].startTime = Date.now() // reset timer
      }
    }

    // Emitir o estado da sala para todos os clientes nesta sala
    io.to(roomId).emit('room_state_update', {
      status: currentStatus,
      tempoRestante: Math.floor(remainingTime),
      winnerId: activeRooms[roomId] ? activeRooms[roomId].winnerId : null, // Inclui o vencedor
    })
  }

  roomTimers[roomId] = {
    startTime: Date.now(),
    interval: setInterval(updateRoomState, 1000), // Atualiza a cada segundo
  }

  updateRoomState() // Chama uma vez imediatamente
}

export { startRaceSimulation, startRoomCycle, activeRooms }

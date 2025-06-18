import { io } from '../../app.js'
import { PrismaClient } from '@prisma/client'

const activeRooms = {}
const prisma = new PrismaClient()

// Função para iniciar uma nova corrida (Refatorada)
async function startRaceSimulation(roomId, ants, onFinish) {
  // << Recebe o callback onFinish
  if (activeRooms[roomId] && activeRooms[roomId].interval) {
    clearInterval(activeRooms[roomId].interval)
  }

  const antPositions = {}
  ants.forEach((ant) => {
    antPositions[ant.id] = 0
  })

  const raceLength = 1000
  const raceDuration = 15000

  activeRooms[roomId] = {
    ...activeRooms[roomId], // Mantém o status 'correndo' que o gerente definiu
    antPositions,
    finishedAntsOrder: [],
    interval: null,
    raceStartedAt: Date.now(),
  }

  console.log(`[Sala ${roomId}] Simulação de corrida iniciada.`)

  activeRooms[roomId].interval = setInterval(() => {
    const currentRaceTime = Date.now() - activeRooms[roomId].raceStartedAt
    const newPositions = { ...activeRooms[roomId].antPositions }

    // Um conjunto para as formigas que terminaram NESTA iteração
    const finishedThisTick = new Set()

    ants.forEach((ant) => {
      // Se a formiga já está na ordem de chegada, não a mova mais
      if (activeRooms[roomId].finishedAntsOrder.includes(ant.id)) {
        newPositions[ant.id] = raceLength // Garante que fique em 100%
        return
      }

      const currentPosition = newPositions[ant.id]
      const speed = Math.random() * ((raceLength / raceDuration) * 150)
      const newPosition = Math.min(currentPosition + speed, raceLength)
      newPositions[ant.id] = newPosition

      if (newPosition >= raceLength) {
        finishedThisTick.add(ant.id)
      }
    })

    // Adiciona as formigas que terminaram nesta iteração à lista de ordem de chegada
    if (finishedThisTick.size > 0) {
      // Você pode adicionar uma lógica para desempatar se for preciso
      finishedThisTick.forEach((antId) => {
        if (!activeRooms[roomId].finishedAntsOrder.includes(antId)) {
          activeRooms[roomId].finishedAntsOrder.push(antId)
          console.log(`[Sala ${roomId}] Formiga ${antId} finalizou.`)
        }
      })
    }

    activeRooms[roomId].antPositions = newPositions

    const antsForFrontend = ants.map((ant) => ({
      id: ant.id,
      position: ((newPositions[ant.id] / raceLength) * 100).toFixed(0),
    }))

    // Emitir o progresso da corrida
    io.to(roomId).emit('race_update', {
      roomId: roomId,
      ants: antsForFrontend,
    })

    const allFinished =
      activeRooms[roomId].finishedAntsOrder.length === ants.length
    const timeLimitReached = currentRaceTime >= raceDuration * 1.5

    // Condição de término
    if (allFinished || timeLimitReached) {
      clearInterval(activeRooms[roomId].interval)
      console.log(`[Sala ${roomId}] Simulação de corrida terminada.`)

      const results = {
        winnerId: activeRooms[roomId].finishedAntsOrder[0] || null,
        finishedAntsOrder: activeRooms[roomId].finishedAntsOrder,
      }

      // Notifica o "gerente" (startRoomCycle) que a corrida terminou
      onFinish(results)
    }
  }, 100)
}

let roomTimers = {} // Para gerenciar os timers de cada fase da sala

async function startRoomCycle(roomId, initialStatus = 'pausando') {
  console.log(`[Sala ${roomId}] Iniciando ciclo com status: ${initialStatus}`)
  if (roomTimers[roomId]) {
    clearInterval(roomTimers[roomId].interval)
  }

  let currentStatus = initialStatus
  let faseStartTime = Date.now()

  const fasesConfig = {
    PAUSANDO: 30,
    APOSTANDO: 60,
    CORRENDO: 15, // Duração da fase, não da simulação
    ENCERRADA: 30,
  }

  const updateRoomState = async () => {
    const durationInSeconds = fasesConfig[currentStatus.toUpperCase()] || 0
    let remainingTime = Math.max(
      0,
      durationInSeconds - Math.floor((Date.now() - faseStartTime) / 1000)
    )

    // A transição de estado SÓ acontece quando o tempo da fase acaba
    if (remainingTime <= 0) {
      faseStartTime = Date.now() // Reseta o timer para a nova fase

      switch (currentStatus) {
        case 'pausando':
          currentStatus = 'apostando'
          break
        case 'apostando':
          currentStatus = 'correndo'

          try {
            const roomWithAnts = await prisma.room.findUnique({
              where: { id: roomId },
              include: { rooms: { include: { ant: true } } },
            })
            const antsInRace = roomWithAnts?.rooms.map((ra) => ra.ant)

            if (!antsInRace || antsInRace.length === 0) {
              console.error(
                `[Sala ${roomId}] Formigas não encontradas. Voltando para 'pausando'.`
              )
              currentStatus = 'pausando'
              break
            }

            // O gerente inicia o trabalhador e passa o callback
            startRaceSimulation(roomId, antsInRace, async (raceResults) => {
              // --- ESTE CÓDIGO SÓ EXECUTA QUANDO A CORRIDA TERMINAR ---
              console.log(
                `[Sala ${roomId}] Callback 'onFinish' recebido. Vencedor: ${raceResults.winnerId}`
              )

              const { winnerId, finishedAntsOrder } = raceResults

              // 1. Persistir os resultados no DB
              try {
                await prisma.room.update({
                  where: { id: roomId },
                  data: {
                    winnerId: winnerId,
                    vice: finishedAntsOrder[1] || null,
                    terceiro: finishedAntsOrder[2] || null,
                    // ... etc
                  },
                })
                console.log(`[Sala ${roomId}] Vencedor persistido no DB.`)
              } catch (error) {
                console.error(
                  `[Sala ${roomId}] Erro ao persistir vencedor:`,
                  error
                )
              }

              // 2. Emitir o evento de fim de corrida
              io.to(roomId).emit('race_finished', {
                roomId: roomId,
                winnerId: winnerId,
                finishedAntsOrder: finishedAntsOrder,
              })

              // 3. Mudar o estado para 'encerrada' e resetar o timer
              currentStatus = 'encerrada'
              faseStartTime = Date.now()
            })
          } catch (error) {
            console.error(
              `[Sala ${roomId}] Erro crítico ao buscar formigas:`,
              error
            )
            currentStatus = 'pausando'
          }
          break

        case 'correndo':
          // Se o tempo da fase 'correndo' acabou, mas a corrida ainda não notificou o fim,
          // forçamos a transição para 'encerrada'. Isso é um fallback de segurança.
          console.warn(
            `[Sala ${roomId}] Tempo da fase 'correndo' esgotado. Forçando para 'encerrada'.`
          )
          currentStatus = 'encerrada'
          break

        case 'encerrada':
          currentStatus = 'pausando'
          break
      }
    }

    // Atualiza o objeto global, se necessário
    if (!activeRooms[roomId]) activeRooms[roomId] = {}
    activeRooms[roomId].status = currentStatus

    const tempo = Math.floor(remainingTime)
    console.log(
      `[Sala ${roomId}] Emitindo estado: ${currentStatus}, Tempo: ${tempo}s`
    )

    io.to(roomId).emit('room_state_update', {
      tempoRestante: tempo,
      status: currentStatus,
    })
  }

  roomTimers[roomId] = {
    interval: setInterval(updateRoomState, 1000),
  }
  updateRoomState() // Chama imediatamente
}

// Função para parar o ciclo de uma sala (chamada em 'endRoom' no controller)
export function stopRoomCycle(roomId) {
  if (activeRooms[roomId] && activeRooms[roomId].interval) {
    clearInterval(activeRooms[roomId].interval)
    delete activeRooms[roomId]
  }
  if (roomTimers[roomId] && roomTimers[roomId].interval) {
    clearInterval(roomTimers[roomId].interval)
    delete roomTimers[roomId]
  }
  console.log(`Backend: Ciclo da sala ${roomId} encerrado no gerenciador.`)
}

export { startRaceSimulation, startRoomCycle, activeRooms }

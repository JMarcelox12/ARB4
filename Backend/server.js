import { app, httpServer, io } from './app.js'

httpServer.listen(1200, () => {
  console.log('Servidor rodando na porta 1200!')
})

export { io }

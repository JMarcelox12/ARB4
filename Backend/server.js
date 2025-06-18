import { app, httpServer, io } from './app.js'

const PORT = 1200
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando e ouvindo na porta ${PORT}`)
})

export { io }

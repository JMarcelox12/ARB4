import express from 'express'
import cors from 'cors'
import route from './src/routes/index.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} entrou na sala ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
app.use('/app', route);

app.get('/', async (req, res) => {
  res.send('ARB funcionando!');
});

export { app, httpServer, io };
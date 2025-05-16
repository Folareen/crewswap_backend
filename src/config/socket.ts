import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'

const setupSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })

    io.on('connection', (socket) => {
        console.log(socket.id, 'socket id')
        console.log(socket.rooms, 'socket rooms')
        console.log(socket.handshake.query, 'socket handshake query')
        console.log('a user connected')

        // Handle individual socket messages
        socket.on('message', (msg) => {
            console.log('message received:', msg)
            // You can broadcast or emit back to specific clients
            socket.emit('message', `Server received: ${msg}`)
        })

        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id)
        })

        socket.on('error', (error) => {
            console.log('socket error:', error)
        })
    })

    // Server-wide error handling
    io.on('error', (error) => {
        console.log('server error:', error)
    })
}

export default setupSocket
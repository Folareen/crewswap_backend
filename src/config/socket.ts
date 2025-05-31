import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import Message from '../models/Message'
import Chat from '../models/Chat'
// import { v4 as uuidv4 } from 'uuid' // Add this for generating unique IDs

const setupSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        transports: ['websocket'],
        pingTimeout: 60000,
        pingInterval: 25000
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Handle chat messages
        socket.on('send_message', async (data) => {
            try {

                const { chatId, senderId, text, senderName } = data

                // Validate required fields
                if (!chatId || !senderId || !text) {
                    socket.emit('message_error', {
                        error: 'Missing required fields'
                    })
                    return
                }

                // Save message to database
                const newMessage = await Message.create({
                    chatId,
                    senderId,
                    senderName,
                    text,
                })

                // Get chat details
                const chat = await Chat.findOne({
                    where: { id: chatId }
                })

                if (!chat) {
                    socket.emit('message_error', {
                        error: 'Chat not found'
                    })
                    return
                }

                // check if the other member is online

                // Emit message to all users in the chat room
                io.to(`chat_${chatId}`).emit('message_received', {
                    id: newMessage.dataValues.id,
                    text,
                    createdAt: newMessage.dataValues.createdAt,
                    senderId,
                    senderName,
                })

            } catch (error) {
                console.error('Error saving message:', error)
                socket.emit('message_error', {
                    messageId: data.messageId,
                    error: 'Failed to send message'
                })
            }
        })

        // Join chat room
        socket.on('join_chat', ({ chatId }) => {
            if (!chatId) {
                socket.emit('error', 'Chat ID is required')
                return
            }

            socket.join(`chat_${chatId}`)
            console.log(`User ${socket.id} joined chat: ${chatId}`)

            // // Optionally, you can emit a system message when someone joins
            // io.to(`chat_${chatId}`).emit('system_message', {
            //     id: new Date().getTime(),
            //     text: 'A user has joined the chat',
            //     timestamp: new Date().toISOString(),
            //     type: 'system'
            // })
        })

        // Leave chat room
        socket.on('leave_chat', ({ chatId }) => {
            if (!chatId) return

            socket.leave(`chat_${chatId}`)
            console.log(`User ${socket.id} left chat: ${chatId}`)

            // Optionally, you can emit a system message when someone leaves
            io.to(`chat_${chatId}`).emit('system_message', {
                id: new Date().getTime(),
                text: 'A user has left the chat',
                timestamp: new Date().toISOString(),
                type: 'system'
            })
        })

        // Handle message deletion
        // socket.on('delete_message', async ({ messageId, chatId }) => {
        //     try {
        //         const message = await Message.findOne({
        //             where: { id: messageId }
        //         })

        //         if (!message) {
        //             socket.emit('message_error', {
        //                 messageId,
        //                 error: 'Message not found'
        //             })
        //             return
        //         }

        //         await message.destroy()

        //         // Notify all users in the chat about the deletion
        //         io.to(`chat_${chatId}`).emit('message_deleted', {
        //             messageId,
        //             chatId
        //         })

        //     } catch (error) {
        //         console.error('Error deleting message:', error)
        //         socket.emit('message_error', {
        //             messageId,
        //             error: 'Failed to delete message'
        //         })
        //     }
        // })

        // Handle read receipts
        socket.on('mark_as_read', async ({ messageId, chatId }) => {
            try {
                await Message.update(
                    { read: true },
                    { where: { id: messageId } }
                )

                io.to(`chat_${chatId}`).emit('message_read', {
                    messageId,
                    chatId,
                    readBy: socket.id
                })

            } catch (error) {
                console.error('Error marking message as read:', error)
                socket.emit('message_error', {
                    messageId,
                    error: 'Failed to mark message as read'
                })
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })

        socket.on('error', (error) => {
            console.error('Socket error:', error)
        })
    })

    // Server-wide error handling
    io.on('error', (error) => {
        console.error('Server error:', error)
    })

    return io
}

export default setupSocket
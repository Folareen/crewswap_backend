// import { Response } from "express";
// import { AuthenticatedReq } from "../../types/authenticatedReq";
// import Chat, { ChatType } from "../../models/Chat";
// import Message from "../../models/Message";
// import User from "../../models/User";
// import validateData from "../../utils/validators/chat/CreateChat";


// export default async (req: AuthenticatedReq, res: Response) => {
//     try {

//         const validatedData = validateData(req.body)

//         if (!validatedData) {
//             res.status(400).json({ message: 'Invalid chat data' })
//             return
//         }

//         const { message, receiverId, type } = validatedData

//         if (!message || !receiverId) {
//             res.status(400).json({ message: 'Message and receiverId are required' })
//             return
//         }

//         const user = await User.findByPk(req.user?.id)

//         if (!user) {
//             res.status(400).json({ message: 'User not found' })
//             return
//         }

//         const chat = await Chat.create({
//             type,
//             members: [req.user?.id, receiverId]
//         })

//         await Message.create({
//             chatId: chat.dataValues.id,
//             senderId: req.user?.id,
//             message
//         })

//         res.status(200).json({ message: 'Message sent successfully', data: message })
//         return

//     } catch (error: any) {
//         console.log(error, 'errrorrr')

//         res.status(500).json({ message: 'Internal server error' })
//         return
//     }
// }
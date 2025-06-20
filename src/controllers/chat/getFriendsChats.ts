import { Response } from "express";
import { Op, fn, col, where } from "sequelize";
import Chat, { ChatType } from "../../models/Chat";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import Message from "../../models/Message";
import User from "../../models/User";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req.user?.id

        console.log(userId, 'userId')

        const chats = await Chat.findAll({
            where: {
                type: ChatType.FRIENDS,
                [Op.and]: [
                    where(
                        fn('JSON_CONTAINS', col('members'), JSON.stringify(userId)),
                        true
                    )
                ]
            },
            order: [['createdAt', 'DESC']]
        })

        const chatsData = await Promise.all(chats.map(async (chat) => {
            const otherMember = chat?.dataValues?.members?.find((id: number) => id !== userId)
            const lastMessage = await Message.findOne({
                where: {
                    chatId: chat.dataValues.id
                },
                order: [['createdAt', 'DESC']]
            })

            const user = await User.findOne({
                where: {
                    id: otherMember
                }
            })

            const unreadMessages = await Message.count({
                where: {
                    chatId: chat.dataValues.id,
                    read: false,
                    senderId: {
                        [Op.ne]: userId
                    }
                }
            })

            return {
                id: chat.dataValues.id,
                userId: otherMember,
                lastMessage: lastMessage?.dataValues.message,
                lastMessageTime: lastMessage?.dataValues.createdAt,
                userType: user?.dataValues.userType,
                unreadMessages,
                otherMemberDetails: user?.dataValues
            }
        }))

        res.status(200).json({
            message: 'Chats fetched successfully', chats: chatsData
        })
        return

    } catch (error: any) {
        console.log(error, 'errrorrr')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}
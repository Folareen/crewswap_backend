import { Response } from "express";
import { Op, fn, col, where } from "sequelize";
import Chat, { ChatType } from "../../models/Chat";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import Message from "../../models/Message";
import Schedule from "../../models/Schedule";
import User from "../../models/User";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req.user?.id

        const chatId = req.params.id

        const chat = await Chat.findOne({
            where: {
                type: ChatType.CREW,
                id: chatId,
                [Op.and]: [
                    where(
                        fn('JSON_CONTAINS', col('members'), JSON.stringify(userId)),
                        true
                    )
                ]
            }
        })

        if (!chat) {
            res.status(404).json({ message: 'Chat not found' })
            return
        }

        const messages = await Message.findAll({
            where: {
                chatId
            },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        })

        console.log(messages, 'messages')

        const otherMember = chat.dataValues.members.find((id: number) => id !== userId)

        const otherMemberDetails = await User.findOne({
            where: {
                id: otherMember
            }
        })

        res.status(200).json({
            message: 'Chat fetched successfully',
            chat: {
                id: chat.dataValues.id,
                userId: otherMember,
                otherMemberDetails: otherMemberDetails?.dataValues,
                messages: messages.map((message) => {
                    return {
                        id: message.dataValues.id,
                        text: message.dataValues.text,
                        createdAt: message.dataValues.createdAt,
                        senderId: message.dataValues.senderId,
                        read: message.dataValues.read
                    }
                }),
            },
        })
        return

    } catch (error: any) {
        console.log(error, 'errrorrr')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}
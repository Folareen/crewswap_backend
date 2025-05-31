import { Response } from "express";
import { Op, fn, col, where } from "sequelize";
import Chat, { ChatType } from "../../models/Chat";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import Message from "../../models/Message";
import User from "../../models/User";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        console.log(req.params, 'req.params')
        const userId = req.user?.id

        const chatId = req.params.id

        const chat = await Chat.findOne({
            where: {
                type: ChatType.CREW_GROUP,
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


        res.status(200).json({
            message: 'Chat fetched successfully',
            chat: {
                id: chat.dataValues.id,
                name: chat.dataValues.name,
                members: chat.dataValues.members,
                messages: messages.map((message) => {
                    return {
                        id: message.dataValues.id,
                        text: message.dataValues.text,
                        createdAt: message.dataValues.createdAt,
                        senderId: message.dataValues.senderId,
                        senderName: message.dataValues.sender.firstName + ' ' + message.dataValues.sender.lastName,
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

import { Response } from "express";
import { Op } from "sequelize";
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
                type: ChatType.FRIENDS,
                id: chatId,
                [Op.or]: [
                    {
                        member1: userId,
                    },
                    {
                        member2: userId
                    }
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

        const otherMember = chat.dataValues.member1 === userId ? chat.dataValues.member2 : chat.dataValues.member1

        const otherMemberDetails = await User.findOne({
            where: {
                id: otherMember
            }
        })

        console.log(otherMemberDetails, 'otherMemberDetails')

        const schedule = await Schedule.findOne({
            where: {
                userId: otherMemberDetails?.dataValues?.id
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
                        senderName: '',
                        read: message.dataValues.read
                    }
                }),
            },
            schedule: schedule?.dataValues
        })
        return

    } catch (error: any) {
        console.log(error, 'errrorrr')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}


import { Response } from "express";
import { Op } from "sequelize";
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
                type: {
                    [Op.or]: [
                        ChatType.CREW,
                        ChatType.CREW_GROUP
                    ]
                },
                [Op.or]: [
                    {
                        members: {
                            [Op.contains]: userId
                        }
                    }
                ]
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'memberOne',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'memberTwo',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        })

        console.log(chats, 'chats')

        const lastMessage = await Message.findOne({
            where: {
                chatId: chats[0].dataValues.id
            },
            order: [['createdAt', 'DESC']]
        })

        const chatsData = await Promise.all(chats.map(async (chat) => {
            const otherMember = chat.dataValues.member1 === userId ? chat.dataValues.member2 : chat.dataValues.member1
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
                    read: false
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
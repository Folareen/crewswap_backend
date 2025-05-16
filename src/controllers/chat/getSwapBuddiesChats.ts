
import { Response } from "express";
import { Op } from "sequelize";
import Chat, { ChatType } from "../../models/Chat";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import Message from "../../models/Message";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req.user?.id

        const chats = await Chat.findAll({
            where: {
                type: ChatType.SWAP_BUDDIES,
                [Op.or]: [
                    {
                        member1: userId,
                    },
                    {
                        member2: userId
                    }
                ]
            },
            order: [['createdAt', 'DESC']]
        })

        const lastMessage = await Message.findOne({
            where: {
                chatId: chats[0].dataValues.id
            },
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({ message: 'Chats fetched successfully', data: { chats, lastMessage } })
        return

    } catch (error: any) {
        console.log(error, 'errrorrr')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}
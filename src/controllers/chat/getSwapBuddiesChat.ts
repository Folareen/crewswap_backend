
import { Response } from "express";
import { Op } from "sequelize";
import Chat, { ChatType } from "../../models/Chat";
import { AuthenticatedReq } from "../../types/authenticatedReq";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const userId = req.user?.id

        const chatId = req.params.id

        const chat = await Chat.findOne({
            where: {
                type: ChatType.SWAP_BUDDIES,
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

        res.status(200).json({ message: 'Chat fetched successfully', data: chat })
        return

    } catch (error: any) {
        console.log(error, 'errrorrr')

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}
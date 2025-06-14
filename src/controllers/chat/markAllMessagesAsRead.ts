import { Response } from "express";
import Chat, { ChatType } from "../../models/Chat";
import Message from "../../models/Message";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import validateData from "../../utils/validators/schedule/likeSchedule";
import Schedule from "../../models/Schedule";
import { Op, fn, col, where } from "sequelize";

export default async (req: AuthenticatedReq, res: Response) => {
    try {
        const { chatId } = req.params;

        console.log(chatId, 'chatId')

        if (!chatId) {
            res.status(400).json({ message: 'Chat ID is required' })
            return
        }

        await Message.update({ read: true }, { where: { chatId, senderId: { [Op.ne]: req.user?.id } } })

        res.status(200).json({
            message: 'Messages marked as read'
        })
        return

    } catch (error: any) {

        res.status(500).json({ message: 'Internal server error' })
        return
    }
}
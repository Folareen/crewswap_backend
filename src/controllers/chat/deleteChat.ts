import Chat from "../../models/Chat";
import { Response } from "express";
import { AuthenticatedReq } from "../../types/authenticatedReq";

export const deleteChat = async (req: AuthenticatedReq, res: Response) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findByPk(chatId);

        if (!chat) {
            res.status(404).json({ message: 'Chat not found' });
            return
        }

        await chat.destroy();

        res.status(200).json({ message: 'Chat deleted successfully' });
        return
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error' });
        return
    }
}
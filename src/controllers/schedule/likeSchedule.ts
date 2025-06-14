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

        const validatedData = validateData(req.body)

        const scheduleId = validatedData?.scheduleId

        console.log(scheduleId, 'scheduleId')

        if (!scheduleId) {
            res.status(400).json({ message: 'Schedule ID is required' })
            return
        }

        const schedule = await Schedule.findByPk(scheduleId)

        if (!schedule) {
            res.status(400).json({ message: 'Schedule not found' })
            return
        }

        if (schedule.dataValues.userId == req.user?.id) {
            res.status(400).json({ message: 'You cannot like your own schedule' })
            return
        }

        const user = await User.findByPk(schedule.dataValues.userId)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }

        const chatExists = await Chat.findOne({
            where: {
                type: ChatType.SWAP_BUDDIES,
                [Op.and]: [
                    where(
                        fn('JSON_CONTAINS', col('members'), JSON.stringify(req.user?.id)),
                        true
                    ),
                    where(
                        fn('JSON_CONTAINS', col('members'), JSON.stringify(user.dataValues.id)),
                        true
                    )
                ]
            }
        })

        if (chatExists) {
            res.status(200).json({
                message: 'Swap buddies already connected',
                user: {
                    id: user.dataValues.id,
                    firstName: user.dataValues.firstName,
                    lastName: user.dataValues.lastName
                },
                chat: chatExists.dataValues
            })
            return
        }

        const chat = await Chat.create({
            type: ChatType.SWAP_BUDDIES,
            members: [req.user?.id, user.dataValues.id]
        })

        res.status(200).json({
            message: 'Schedule liked successfully',
            user: {
                id: user.dataValues.id,
                firstName: user.dataValues.firstName,
                lastName: user.dataValues.lastName
            },
            chat: chat.dataValues
        })
        return

    } catch (error: any) {
        if (error?.type == 'validation') {
            res.status(400).json({
                message: error?.message
            })
            return;
        }


        res.status(500).json({ message: 'Internal server error' })
        return
    }
}
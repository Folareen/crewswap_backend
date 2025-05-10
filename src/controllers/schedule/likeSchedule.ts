import { Response } from "express";
import Chat, { ChatType } from "../../models/Chat";
import Message from "../../models/Message";
import User from "../../models/User";
import { AuthenticatedReq } from "../../types/authenticatedReq";
import validateData from "../../utils/validators/schedule/likeSchedule";
import Schedule from "../../models/Schedule";
import { Op } from "sequelize";
import sequelizeInstance from "../../config/database";

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

        const user = await User.findByPk(schedule.dataValues.userId)

        if (!user) {
            res.status(400).json({ message: 'User not found' })
            return
        }

        const chatExists = await Chat.findOne({
            where: {
                type: ChatType.SWAP_BUDDIES,
                [Op.or]: [
                    {
                        member1: req.user?.id,
                        member2: user.dataValues.id
                    },
                    {
                        member1: user.dataValues.id,
                        member2: req.user?.id
                    }
                ]
            }
        })

        if (chatExists) {
            res.status(200).json({ message: 'Swap buddies already connected', data: chatExists })
            return
        }

        const chat = await Chat.create({
            type: ChatType.SWAP_BUDDIES,
            member1: req.user?.id,
            member2: user.dataValues.id
        })

        res.status(201).json({ message: 'Schedule liked successfully', data: chat })
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
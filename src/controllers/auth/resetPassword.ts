import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import { Op } from "sequelize"
import Otp, { ActionType } from "../../models/Otp"
import User from "../../models/User"
import validateData from '../../utils/validators/auth/resetPassword'

export default async (req: Request, res: Response) => {
    try {
        const data = validateData(req.body)

        if (!data) {
            res.status(400).json({ message: 'Invalid reset password data' })
            return;
        }

        const { otp, newPassword } = data

        const otpRecord = await Otp.findOne({
            where: {
                code: otp,
                actionType: ActionType.PASSWORD_RESET,
                used: false,
                expiresAt: { [Op.gt]: new Date() },
            },
        })

        if (!otpRecord) {
            res.status(400).json({ message: "Invalid or expired OTP" })
            return;
        }

        const user = await User.findOne({ where: { id: otpRecord.getDataValue('userId') } })
        if (!user) {
            res.status(404).json({ message: "User not found" })
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await user.update({ password: hashedPassword })
        await otpRecord.update({ used: true })

        res.status(200).json({ message: "Password reset successful" })
        return;
    } catch (error: any) {
        if (error?.type == 'validation') {
            res.status(400).json({
                message: error?.message
            })
            return;
        }

        console.error("Reset password error:", error)
        res.status(500).json({ message: "Internal Server Error" })
        return;
    }
}

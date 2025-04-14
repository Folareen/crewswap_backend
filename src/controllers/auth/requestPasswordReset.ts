import { Request, Response } from "express"
import User from "../../models/User"
import Otp from "../../models/Otp"
import nodemailer from 'nodemailer'
import validateData from '../../utils/validators/auth/requestPasswordReset'

const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>OTP Code</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        padding: 20px;
      }
      .container {
        max-width: 480px;
        margin: auto;
        background-color: #ffffff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .otp {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 16px 0;
        text-align: center;
        letter-spacing: 4px;
      }
      .footer {
        font-size: 13px;
        color: #999999;
        margin-top: 24px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Password Reset Request</h2>
      <p>Hi there,</p>
      <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
      <div class="otp">{{OTP_CODE}}</div>
      <p>This code is valid for 5 minutes. If you didn't request this, you can safely ignore this email.</p>
      <div class="footer">Thank you,<br />CrewSwap</div>
    </div>
  </body>
</html>
`


export default async (req: Request, res: Response) => {
  try {
    const data = validateData(req.body)

    if (!data) {
      res.status(400).json({ message: 'Invalid data' })
      return;
    }

    const user = await User.findOne({ where: { email: data.email } })
    if (!user) {
      res.status(404).json({ message: "No user found with this email" })
      return;
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString()
    const sentAt = new Date()

    const otp = Otp.build({
      userId: user.getDataValue("id"),
      code: otpCode,
      actionType: "password_reset",
      sentAt,
    })

    const html = EMAIL_TEMPLATE.replace("{{OTP_CODE}}", otpCode)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      secureConnection: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL as string,
        pass: process.env.NODEMAILER_PASS as string
      }
    } as nodemailer.TransportOptions);

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL as string,
      to: user.getDataValue('email'),
      subject: 'CrewSwap password reset token',
      html
    }

    await transporter.sendMail(mailOptions);

    const expiresAt = new Date(sentAt.getTime() + 5 * 60000)

    otp.setDataValue('expiresAt', expiresAt)

    await otp.save()

    res.status(200).json({ message: "OTP sent to email" })
    return;
  } catch (error: any) {
    if (error?.type == 'validation') {
      res.status(400).json({
        message: error?.message
      })
      return;
    }

    console.error("OTP request error:", error)
    res.status(500).json({ message: "Internal Server Error" })
    return;
  }
}
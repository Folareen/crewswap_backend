import { z } from "zod"

const resetPasswordSchema = z.object({
    newPassword: z.string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .refine((password) => /[A-Z]/.test(password), {
            message: "Password must contain atleast one uppercase letter",
        })
        .refine((password) => /[a-z]/.test(password), {
            message: "Password must contain atleast one uppercase letter",
        })
        .refine((password) => /[0-9]/.test(password), { message: "Password must contain atleast one number" })
        .refine((password) => /[!@#$%^&*]/.test(password), {
            message: "Password must contain atleast one special character",
        }),
    otp: z.string({ required_error: 'OTP is required' })
        .length(4, { message: 'Invalid OTP' })
})

export default (data: any) => {
    try {
        return resetPasswordSchema.parse(data)
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const readableErrors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))

            const message = `${readableErrors[0].message}`
            throw {
                type: 'validation',
                message
            }
        }
    }
}

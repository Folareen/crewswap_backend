import { z } from "zod"

const loginSchema = z.object({
    email: z.string({ required_error: "Email is required" })
        .email("Enter a valid email"),
    password: z.string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
})

export default (data: any) => {
    try {
        return loginSchema.parse(data)
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

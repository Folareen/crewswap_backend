import { z } from "zod"

const signupSchema = z.object({
    email: z.string({ required_error: "Email is required" })
        .email("Enter a valid email"),
    password: z.string({ required_error: "Password is required" })
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
    baseAirport: z.string({ required_error: "Base airport is required" })
        .min(1, "Base airport is required"),
    airline: z.string({ required_error: "Airline is required" })
        .min(1, "Airline is required"),
    userType: z.enum(["pilot", "flight-attendant"], {
        errorMap: () => ({ message: "User type must be either 'pilot' or 'flight-attendant'" }),
    }),
    timeFormat: z.enum(["24h", "12h"], {
        errorMap: () => ({ message: "Time format must be either '24h' or '12h'" }),
    }),
})

export default (data: any) => {
    try {
        return signupSchema.parse(data)
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

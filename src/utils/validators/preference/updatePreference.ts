import { ZodError, array, boolean, date, object, string } from "zod"

const updatePreferenceSchema = object({
    weekendsOff: boolean().optional(),
    lessSits: boolean().optional(),
    thirtyLayover: boolean().optional(),
    moreCredits: boolean().optional(),
    commutable: boolean().optional(),
    lateCheckIn: boolean().optional(),
    stackTripsTogether: boolean().optional(),
    noMexicoLayovers: boolean().optional(),
    moreDaysOff: boolean().optional(),
    datesOff: array(string()).optional()
})

export default (data: any) => {
    try {
        return updatePreferenceSchema.parse(data)

    } catch (error: any) {
        if (error instanceof ZodError) {
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

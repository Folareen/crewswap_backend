import { Request } from "express";

export type AuthenticatedReq = Request & {
    user?: {
        id: string,
        email: string,
        displayName: string,
        baseAirport: string,
        airline: string,
        userType: string
    }
}

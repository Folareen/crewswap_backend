import { Router } from "express";
import syncSchedule from "../controllers/schedule/syncSchedule";
const router = Router()

router.post('/sync-schedule', syncSchedule)

export default router
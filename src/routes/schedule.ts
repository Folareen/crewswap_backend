import { Router } from "express";
import syncSchedule from "../controllers/schedule/syncSchedule";
import authenticate from "../middlewares/authenticate";

const router = Router()

router.post('/sync-schedule', authenticate, syncSchedule)

export default router
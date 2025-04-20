import { Router } from "express";
import syncSchedule from "../controllers/schedule/syncSchedule";
import authenticate from "../middlewares/authenticate";

const router = Router()

router.route('/schedule').post(authenticate, syncSchedule)

export default router
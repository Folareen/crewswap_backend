import { Router } from "express";
import syncSchedule from "../controllers/schedule/syncSchedule";
import authenticate from "../middlewares/authenticate";
import getPreferredSchedules from "../controllers/schedule/getPreferredSchedules";
import likeSchedule from "../controllers/schedule/likeSchedule";

const router = Router()

router.route('/schedule').post(authenticate, syncSchedule)
router.route('/preferred-schedules').get(authenticate, getPreferredSchedules)
router.route('/like-schedule').post(authenticate, likeSchedule)

export default router
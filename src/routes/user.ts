import { Router } from "express";
import getUser from "../controllers/user/getUser";
import authenticate from "../middlewares/authenticate";

const router = Router()

router.route('/user').get(authenticate, getUser)

export default router
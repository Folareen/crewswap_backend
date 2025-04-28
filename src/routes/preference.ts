import { Router } from "express";
import updatePreference from "../controllers/preference/updatePreference";
import authenticate from "../middlewares/authenticate";

const router = Router()

router.route('/preference').post(authenticate, updatePreference)

export default router
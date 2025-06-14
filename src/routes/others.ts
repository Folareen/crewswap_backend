import { Router } from "express";
import getGates from "../controllers/others/getGates";

const router = Router()

router.post('/gates', getGates)

export default router
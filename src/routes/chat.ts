import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import getSwapBuddiesChats from "../controllers/chat/getSwapBuddiesChats";
import getSwapBuddiesChat from "../controllers/chat/getSwapBuddiesChat";

const router = Router()

router.route('/swap-buddies').get(authenticate, getSwapBuddiesChats)
router.route('/swap-buddies/:id').get(authenticate, getSwapBuddiesChat)

export default router
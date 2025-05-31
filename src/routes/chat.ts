import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import getSwapBuddiesChats from "../controllers/chat/getSwapBuddiesChats";
import getSwapBuddiesChat from "../controllers/chat/getSwapBuddiesChat";
import getFriendsChats from "../controllers/chat/getFriendsChats";
import getFriendChat from "../controllers/chat/getFriendChat";
import chatCrew from "../controllers/chat/chatCrew";
import chatCrewGroup from "../controllers/chat/chatCrewGroup";

const router = Router()

router.route('/swap-buddies').get(authenticate, getSwapBuddiesChats)
router.route('/swap-buddies/:id').get(authenticate, getSwapBuddiesChat)
router.route('/friends').get(authenticate, getFriendsChats)
router.route('/friends/:id').get(authenticate, getFriendChat)
router.route('/crew').post(authenticate, chatCrew)
router.route('/crew-group').post(authenticate, chatCrewGroup)

export default router
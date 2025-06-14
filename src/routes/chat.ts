import { Router } from "express";
import chatCrew from "../controllers/chat/chatCrew";
import chatCrewGroup from "../controllers/chat/chatCrewGroup";
import getCrews from "../controllers/chat/getCrews";
import getFriendChat from "../controllers/chat/getFriendChat";
import getFriendsChats from "../controllers/chat/getFriendsChats";
import getSwapBuddies from "../controllers/chat/getSwapBuddies";
import getSwapBuddy from "../controllers/chat/getSwapBuddy";
import authenticate from "../middlewares/authenticate";
import getCrewGroup from "../controllers/chat/getCrewGroup";
import getCrew from "../controllers/chat/getCrew";
import markAllMessagesAsRead from "../controllers/chat/markAllMessagesAsRead";
import { deleteChat } from "../controllers/chat/deleteChat";
const router = Router()

router.route('/swap-buddies').get(authenticate, getSwapBuddies)
router.route('/swap-buddies/:id').get(authenticate, getSwapBuddy)
router.route('/friends').get(authenticate, getFriendsChats)
router.route('/friends/:id').get(authenticate, getFriendChat)
router.route('/crew').post(authenticate, chatCrew)
router.route('/crew/:id').get(authenticate, getCrew)
router.route('/crew-group').post(authenticate, chatCrewGroup)
router.route('/crew-group/:id').get(authenticate, getCrewGroup)
router.route('/crews').get(authenticate, getCrews)
router.route('/chats/:chatId/read').post(authenticate, markAllMessagesAsRead)
router.route('/chats/:chatId').delete(authenticate, deleteChat)

export default router
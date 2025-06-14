import { Router } from "express";
import getUser from "../controllers/user/getUser";
import authenticate from "../middlewares/authenticate";
import searchUsers from "../controllers/user/searchUsers";
import addFriend from "../controllers/user/addFriend";
import updateUser from "../controllers/user/updateUser";
const router = Router()

router.route('/user').get(authenticate, getUser).put(authenticate, updateUser)
router.route('/users').get(authenticate, searchUsers)
router.route('/users/:id').post(authenticate, addFriend)

export default router
import { Router } from "express";
import { signup } from "../controllers/auth/signup";
import login from "../controllers/auth/login";
import requestPasswordReset from "../controllers/auth/requestPasswordReset";
import resetPassword from "../controllers/auth/resetPassword";

const router = Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/request-password-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)

export default router
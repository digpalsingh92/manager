import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema, resetPasswordSchema, changePasswordSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getProfile);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export { router as authRoutes };

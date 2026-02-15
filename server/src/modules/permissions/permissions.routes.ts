import { Router } from 'express';
import { PermissionsController } from './permissions.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const permissionsController = new PermissionsController();

router.get('/', authenticate, permissionsController.getAllPermissions);

export { router as permissionsRoutes };

import { Router } from 'express';
import { RolesController } from './roles.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createRoleSchema, updateRoleSchema } from './roles.validation';

const router = Router();
const rolesController = new RolesController();

router.get('/', authenticate, rolesController.getAllRoles);
router.get('/:id', authenticate, rolesController.getRoleById);

router.post(
  '/',
  authenticate,
  checkPermission('manage_users'),
  validate(createRoleSchema),
  rolesController.createRole
);

router.patch(
  '/:id',
  authenticate,
  checkPermission('manage_users'),
  validate(updateRoleSchema),
  rolesController.updateRole
);

router.delete(
  '/:id',
  authenticate,
  checkPermission('manage_users'),
  rolesController.deleteRole
);

export { router as rolesRoutes };

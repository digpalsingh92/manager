import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createWorkspaceSchema,
  workspaceIdParamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
} from './workspace.validation';

const router = Router();
const workspaceController = new WorkspaceController();

// ─── Workspace CRUD ──────────────────────────

router.post(
  '/',
  authenticate,
  validate(createWorkspaceSchema),
  workspaceController.createWorkspace
);

router.get(
  '/',
  authenticate,
  workspaceController.getUserWorkspaces
);

router.get(
  '/:id',
  authenticate,
  validate(workspaceIdParamSchema),
  workspaceController.getWorkspaceById
);

// ─── Workspace Members ───────────────────────

router.get(
  '/:id/members',
  authenticate,
  validate(workspaceIdParamSchema),
  workspaceController.getWorkspaceMembers
);

router.post(
  '/:id/invite',
  authenticate,
  validate(inviteMemberSchema),
  workspaceController.inviteMember
);

router.patch(
  '/:id/members/:memberId',
  authenticate,
  validate(updateMemberRoleSchema),
  workspaceController.updateMemberRole
);

router.delete(
  '/:id/members/:memberId',
  authenticate,
  validate(removeMemberSchema),
  workspaceController.removeMember
);

export { router as workspacesRoutes };

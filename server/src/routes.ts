import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { rolesRoutes } from './modules/roles/roles.routes';
import { permissionsRoutes } from './modules/permissions/permissions.routes';
import { projectsRoutes } from './modules/projects/projects.routes';
import { tasksRoutes } from './modules/tasks/tasks.routes';
import { commentsRoutes } from './modules/comments/comments.routes';

const router = Router();

// ─── API v1 Routes ────────────────────────────
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/comments', commentsRoutes);

export { router as apiRoutes };

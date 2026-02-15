import { Router } from 'express';
import { CommentsController } from './comments.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/permission.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCommentSchema,
  commentIdParamSchema,
  commentsByTaskSchema,
} from './comments.validation';

const router = Router();
const commentsController = new CommentsController();

router.get(
  '/task/:taskId',
  authenticate,
  validate(commentsByTaskSchema),
  commentsController.getCommentsByTask
);

router.post(
  '/',
  authenticate,
  checkPermission('comment_task'),
  validate(createCommentSchema),
  commentsController.createComment
);

router.delete(
  '/:id',
  authenticate,
  validate(commentIdParamSchema),
  commentsController.deleteComment
);

export { router as commentsRoutes };

import { Request, Response } from 'express';
import { CommentsService } from './comments.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/response';

export class CommentsController {
  private commentsService: CommentsService;

  constructor() {
    this.commentsService = new CommentsService();
  }

  getCommentsByTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.params.taskId as string;
    const result = await this.commentsService.getCommentsByTask(
      taskId,
      req.query as any
    );
    sendResponse(res, 200, 'Comments retrieved successfully', result.comments, {
      pagination: result.pagination,
    });
  });

  createComment = asyncHandler(async (req: Request, res: Response) => {
    const comment = await this.commentsService.createComment(
      req.body,
      req.user!.id
    );
    sendResponse(res, 201, 'Comment created successfully', comment);
  });

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.commentsService.deleteComment(id, req.user!.id);
    sendResponse(res, 200, 'Comment deleted successfully');
  });
}

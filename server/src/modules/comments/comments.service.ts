import { AppError } from '../../utils/appError';
import { CommentsRepository } from './comments.repository';
import { CreateCommentInput } from './comments.validation';

export class CommentsService {
  private commentsRepository: CommentsRepository;

  constructor() {
    this.commentsRepository = new CommentsRepository();
  }

  async getCommentsByTask(
    taskId: string,
    query: { page?: number; limit?: number }
  ) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const { comments, total } = await this.commentsRepository.findByTask({
      taskId,
      skip,
      take: limit,
    });

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createComment(data: CreateCommentInput, userId: string) {
    return this.commentsRepository.create({
      content: data.content,
      taskId: data.taskId,
      userId,
    });
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw AppError.notFound('Comment not found.');
    }

    // Only the comment author can delete their comment
    if (comment.user.id !== userId) {
      throw AppError.forbidden('You can only delete your own comments.');
    }

    return this.commentsRepository.softDelete(id);
  }
}

import { WorkspaceRole } from '@prisma/client';
import { AppError } from '../../utils/appError';
import { logger } from '../../utils/logger';
import { WorkspaceRepository } from './workspace.repository';
import { CreateWorkspaceInput } from './workspace.validation';

export class WorkspaceService {
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
  }

  /**
   * Create a new workspace. The creator automatically becomes OWNER.
   */
  async createWorkspace(data: CreateWorkspaceInput, userId: string) {
    logger.info(`Creating workspace "${data.name}" for user ${userId}`);

    const workspace = await this.workspaceRepository.create({
      name: data.name,
      createdById: userId,
    });

    return workspace;
  }

  /**
   * Get workspace by ID. Verifies that the requesting user is a member.
   */
  async getWorkspaceById(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found.');
    }

    // Verify membership
    const membership = await this.workspaceRepository.getMemberByUserAndWorkspace(userId, workspaceId);
    if (!membership) {
      throw AppError.forbidden('You are not a member of this workspace.');
    }

    return workspace;
  }

  /**
   * Get all workspaces for the authenticated user.
   */
  async getUserWorkspaces(userId: string) {
    const memberships = await this.workspaceRepository.findByUserId(userId);
    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      createdBy: m.workspace.createdBy,
      memberCount: m.workspace._count.members,
      projectCount: m.workspace._count.projects,
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Get all members of a workspace. Verifies requesting user is a member.
   */
  async getWorkspaceMembers(workspaceId: string, userId: string) {
    // Verify workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found.');
    }

    // Verify membership
    const membership = await this.workspaceRepository.getMemberByUserAndWorkspace(userId, workspaceId);
    if (!membership) {
      throw AppError.forbidden('You are not a member of this workspace.');
    }

    return this.workspaceRepository.findMembers(workspaceId);
  }

  /**
   * Invite a user to the workspace. Only OWNER or ADMIN can invite.
   */
  async inviteMember(
    workspaceId: string,
    inviterUserId: string,
    email: string,
    role: WorkspaceRole
  ) {
    // Verify workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found.');
    }

    // Verify inviter's role
    const inviterRole = await this.workspaceRepository.getMemberRole(inviterUserId, workspaceId);
    if (!inviterRole) {
      throw AppError.forbidden('You are not a member of this workspace.');
    }

    if (inviterRole !== WorkspaceRole.OWNER && inviterRole !== WorkspaceRole.ADMIN) {
      throw AppError.forbidden('Only OWNER or ADMIN can invite members.');
    }

    // ADMIN cannot assign OWNER role
    if (inviterRole === WorkspaceRole.ADMIN && role === WorkspaceRole.OWNER) {
      throw AppError.forbidden('Only OWNER can assign the OWNER role.');
    }

    // Prevent assigning OWNER role through invite
    if (role === WorkspaceRole.OWNER) {
      throw AppError.badRequest('Cannot assign OWNER role through invite. Use role update instead.');
    }

    // Find the user being invited
    const invitedUser = await this.workspaceRepository.findUserByEmail(email);
    if (!invitedUser) {
      throw AppError.notFound('No user found with this email address.');
    }

    if (!invitedUser.isActive) {
      throw AppError.badRequest('Cannot invite a deactivated user.');
    }

    // Check if already a member
    const existingMembership = await this.workspaceRepository.getMemberByUserAndWorkspace(
      invitedUser.id,
      workspaceId
    );
    if (existingMembership) {
      throw AppError.conflict('User is already a member of this workspace.');
    }

    logger.info(`User ${inviterUserId} inviting ${email} to workspace ${workspaceId} as ${role}`);

    return this.workspaceRepository.addMember({
      userId: invitedUser.id,
      workspaceId,
      role,
    });
  }

  /**
   * Update a workspace member's role. Only OWNER can promote/demote.
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    newRole: WorkspaceRole,
    requestingUserId: string
  ) {
    // Verify workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found.');
    }

    // Verify requesting user is OWNER
    const requestingUserRole = await this.workspaceRepository.getMemberRole(requestingUserId, workspaceId);
    if (requestingUserRole !== WorkspaceRole.OWNER) {
      throw AppError.forbidden('Only OWNER can change member roles.');
    }

    // Find the target member
    const targetMember = await this.workspaceRepository.findMemberById(memberId);
    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      throw AppError.notFound('Member not found in this workspace.');
    }

    // Prevent self-role escalation (OWNER trying to change their own role)
    if (targetMember.userId === requestingUserId) {
      throw AppError.badRequest('You cannot change your own role.');
    }

    // If demoting from OWNER, ensure there is at least one other OWNER
    if (targetMember.role === WorkspaceRole.OWNER && newRole !== WorkspaceRole.OWNER) {
      const ownerCount = await this.workspaceRepository.countOwners(workspaceId);
      if (ownerCount <= 1) {
        throw AppError.badRequest('Cannot demote the sole OWNER. Transfer ownership first.');
      }
    }

    logger.info(
      `User ${requestingUserId} changing role of member ${memberId} from ${targetMember.role} to ${newRole} in workspace ${workspaceId}`
    );

    return this.workspaceRepository.updateMemberRole(memberId, newRole);
  }

  /**
   * Remove a member from the workspace. OWNER or ADMIN can remove.
   */
  async removeMember(
    workspaceId: string,
    memberId: string,
    requestingUserId: string
  ) {
    // Verify workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found.');
    }

    // Verify requesting user's role
    const requestingUserRole = await this.workspaceRepository.getMemberRole(requestingUserId, workspaceId);
    if (!requestingUserRole) {
      throw AppError.forbidden('You are not a member of this workspace.');
    }

    if (requestingUserRole !== WorkspaceRole.OWNER && requestingUserRole !== WorkspaceRole.ADMIN) {
      throw AppError.forbidden('Only OWNER or ADMIN can remove members.');
    }

    // Find the target member
    const targetMember = await this.workspaceRepository.findMemberById(memberId);
    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      throw AppError.notFound('Member not found in this workspace.');
    }

    // Cannot remove yourself if sole OWNER
    if (targetMember.userId === requestingUserId && targetMember.role === WorkspaceRole.OWNER) {
      const ownerCount = await this.workspaceRepository.countOwners(workspaceId);
      if (ownerCount <= 1) {
        throw AppError.badRequest('Cannot remove yourself as the sole OWNER. Transfer ownership first.');
      }
    }

    // ADMIN cannot remove OWNER
    if (requestingUserRole === WorkspaceRole.ADMIN && targetMember.role === WorkspaceRole.OWNER) {
      throw AppError.forbidden('ADMIN cannot remove OWNER from workspace.');
    }

    // ADMIN cannot remove other ADMINs
    if (
      requestingUserRole === WorkspaceRole.ADMIN &&
      targetMember.role === WorkspaceRole.ADMIN &&
      targetMember.userId !== requestingUserId
    ) {
      throw AppError.forbidden('ADMIN cannot remove other ADMINs from workspace.');
    }

    logger.info(`User ${requestingUserId} removing member ${memberId} from workspace ${workspaceId}`);

    return this.workspaceRepository.removeMember(memberId);
  }
}

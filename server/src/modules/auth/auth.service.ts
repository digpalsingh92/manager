import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config';
import { AppError } from '../../utils/appError';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput, ChangePasswordInput, ResetPasswordInput } from './auth.validation';
import { AuthPayload } from '../../middlewares/auth.middleware';
import { logger } from '../../utils/logger';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw AppError.conflict('A user with this email already exists.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create user
    const user = await this.authRepository.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Create default workspace and assign as OWNER
    const workspaceName = `${data.firstName}'s Workspace`;
    const workspace = await this.authRepository.createDefaultWorkspace(user.id, workspaceName);

    logger.info(`User ${user.id} registered with default workspace ${workspace.id}`);

    // Generate token
    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      user,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        role: 'OWNER',
      },
      token,
    };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated.');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    // Generate token
    const token = this.generateToken({ userId: user.id, email: user.email });

    // Format roles and permissions (legacy)
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name)
        )
      ),
    ];

    // Format workspace memberships
    const workspaces = user.workspaceMembers.map((wm) => ({
      id: wm.workspace.id,
      name: wm.workspace.name,
      role: wm.role,
    }));

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        permissions,
      },
      workspaces,
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name)
        )
      ),
    ];

    const workspaces = user.workspaceMembers.map((wm) => ({
      id: wm.workspace.id,
      name: wm.workspace.name,
      role: wm.role,
    }));

    return {
      ...user,
      userRoles: undefined,
      workspaceMembers: undefined,
      roles,
      permissions,
      workspaces,
    };
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    // Find user with password
    const user = await this.authRepository.findUserByEmail(
      (await this.authRepository.findUserById(userId))?.email || ''
    );

    if (!user) {
      throw AppError.notFound('User not found.');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw AppError.badRequest('Current password is incorrect.');
    }

    // Ensure new password is different from old password
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      throw AppError.badRequest('New password must be different from current password.');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    // Update password
    await this.authRepository.updateUserPassword(userId, hashedPassword);

    return { message: 'Password changed successfully.' };
  }

  async resetPassword(data: ResetPasswordInput) {
    // Find user by email
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      throw AppError.notFound('No account found with this email address.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated.');
    }

    // Ensure new password is different from old password
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      throw AppError.badRequest('New password must be different from current password.');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    // Update password
    await this.authRepository.updateUserPassword(user.id, hashedPassword);

    return { message: 'Password reset successfully.' };
  }

  private generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}

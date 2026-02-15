import { AppError } from '../../utils/appError';
import { UsersRepository } from './users.repository';
import { GetUsersQuery } from './users.validation';

export class UsersService {
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async getUsers(query: GetUsersQuery) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { users, total } = await this.usersRepository.findAll({
      skip,
      take: limit,
      where,
    });

    const formattedUsers = users.map((user) => ({
      ...user,
      roles: user.userRoles.map((ur) => ur.role.name),
      userRoles: undefined,
    }));

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(userId: string, roleNames: string[]) {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    // Find roles by names
    const roles = await this.usersRepository.findRolesByNames(roleNames);
    if (roles.length !== roleNames.length) {
      const foundNames = roles.map((r) => r.name);
      const notFound = roleNames.filter((n) => !foundNames.includes(n));
      throw AppError.badRequest(`Roles not found: ${notFound.join(', ')}`);
    }

    const roleIds = roles.map((r) => r.id);
    const updatedUser = await this.usersRepository.updateUserRoles(userId, roleIds);

    return {
      ...updatedUser,
      roles: updatedUser?.userRoles.map((ur) => ur.role.name),
      userRoles: undefined,
    };
  }
}

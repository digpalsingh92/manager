import { AppError } from '../../utils/appError';
import { RolesRepository } from './roles.repository';
import { CreateRoleInput } from './roles.validation';

export class RolesService {
  private rolesRepository: RolesRepository;

  constructor() {
    this.rolesRepository = new RolesRepository();
  }

  async getAllRoles() {
    const roles = await this.rolesRepository.findAll();
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map((rp) => rp.permission.name),
      userCount: role._count.userRoles,
      createdAt: role.createdAt,
    }));
  }

  async getRoleById(id: string) {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw AppError.notFound('Role not found.');
    }

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission.name),
      rolePermissions: undefined,
    };
  }

  async createRole(data: CreateRoleInput) {
    const existing = await this.rolesRepository.findByName(data.name);
    if (existing) {
      throw AppError.conflict(`Role '${data.name}' already exists.`);
    }

    return this.rolesRepository.create({
      name: data.name,
      description: data.description,
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw AppError.notFound('Role not found.');
    }

    return this.rolesRepository.update(id, {
      name: data.name,
      description: data.description,
      permissionIds: data.permissions,
    });
  }

  async deleteRole(id: string) {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw AppError.notFound('Role not found.');
    }

    return this.rolesRepository.delete(id);
  }
}

import { PermissionsRepository } from './permissions.repository';

export class PermissionsService {
  private permissionsRepository: PermissionsRepository;

  constructor() {
    this.permissionsRepository = new PermissionsRepository();
  }

  async getAllPermissions() {
    return this.permissionsRepository.findAll();
  }
}

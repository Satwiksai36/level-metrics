import { prisma } from '../db.js';

export class RoleRepository {
  async findAll() {
    return prisma.roleFamily.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.roleFamily.findUnique({
      where: { id },
    });
  }
}

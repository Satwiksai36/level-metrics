import { prisma } from '../db.js';

export class LocationRepository {
  async findAll() {
    return prisma.location.findMany({
      orderBy: { city: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.location.findUnique({
      where: { id },
    });
  }
}

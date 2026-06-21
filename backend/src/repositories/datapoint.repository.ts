import { prisma } from '../db.js';

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface CreateDataPointInput {
  companyId: string;
  levelMappingId: string;
  roleFamilyId: string;
  locationId: string;
  base: number;
  bonus: number;
  equity: number;
  vestingSchedule: string;
  signOn: number;
  refresher: number;
  currency: string;
  userId?: string;
}

export class DataPointRepository {
  async create(input: CreateDataPointInput) {
    const totalComp = input.base + input.bonus + (input.equity / 4) + input.refresher;

    return prisma.$transaction(async (tx) => {
      const compStructure = await tx.compensationStructure.create({
        data: {
          base: input.base,
          bonus: input.bonus,
          equity: input.equity,
          vestingSchedule: input.vestingSchedule,
          signOn: input.signOn,
          refresher: input.refresher,
          currency: input.currency,
          totalComp,
        },
      });

      return tx.dataPoint.create({
        data: {
          companyId: input.companyId,
          levelMappingId: input.levelMappingId,
          roleFamilyId: input.roleFamilyId,
          locationId: input.locationId,
          compensationStructureId: compStructure.id,
          verificationStatus: VerificationStatus.PENDING,
          userId: input.userId || null,
        },
        include: {
          company: true,
          levelMapping: {
            include: {
              normalizedLevel: true,
            },
          },
          roleFamily: true,
          location: true,
          compensationStructure: true,
        },
      });
    });
  }

  async findAll(filters: {
    normalizedLevelId?: string;
    roleFamilyId?: string;
    locationId?: string;
    companyId?: string;
    verificationStatus?: VerificationStatus;
    includeUnverified?: boolean;
  }) {
    const where: any = {};

    if (filters.normalizedLevelId) {
      where.levelMapping = { normalizedLevelId: filters.normalizedLevelId };
    }
    if (filters.roleFamilyId) {
      where.roleFamilyId = filters.roleFamilyId;
    }
    if (filters.locationId) {
      where.locationId = filters.locationId;
    }
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.verificationStatus) {
      where.verificationStatus = filters.verificationStatus;
    } else if (!filters.includeUnverified) {
      // By default, only show verified data in general queries
      where.verificationStatus = VerificationStatus.VERIFIED;
    }

    return prisma.dataPoint.findMany({
      where,
      include: {
        company: true,
        levelMapping: {
          include: {
            normalizedLevel: true,
          },
        },
        roleFamily: true,
        location: true,
        compensationStructure: true,
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.dataPoint.findUnique({
      where: { id },
      include: {
        company: true,
        levelMapping: {
          include: {
            normalizedLevel: true,
          },
        },
        roleFamily: true,
        location: true,
        compensationStructure: true,
      },
    });
  }

  async updateVerification(id: string, status: VerificationStatus) {
    return prisma.dataPoint.update({
      where: { id },
      data: { verificationStatus: status },
      include: {
        company: true,
        levelMapping: {
          include: {
            normalizedLevel: true,
          },
        },
        roleFamily: true,
        location: true,
        compensationStructure: true,
      },
    });
  }
}

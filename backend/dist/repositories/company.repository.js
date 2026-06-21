import { prisma } from '../db.js';
export class CompanyRepository {
    async findAll() {
        return prisma.company.findMany({
            include: {
                levelingFrameworks: {
                    include: {
                        levelMappings: {
                            include: {
                                normalizedLevel: true,
                            },
                        },
                    },
                },
                levelMappings: {
                    where: {
                        levelingFrameworkId: null,
                    },
                    include: {
                        normalizedLevel: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findById(id) {
        return prisma.company.findUnique({
            where: { id },
            include: {
                levelingFrameworks: {
                    include: {
                        levelMappings: {
                            include: {
                                normalizedLevel: true,
                            },
                        },
                    },
                },
                levelMappings: {
                    where: {
                        levelingFrameworkId: null,
                    },
                    include: {
                        normalizedLevel: true,
                    },
                },
            },
        });
    }
    async findLevelByFrameworkAndName(frameworkId, levelName) {
        return prisma.levelMapping.findFirst({
            where: {
                levelingFrameworkId: frameworkId,
                sourceLevelName: levelName,
            },
        });
    }
}
//# sourceMappingURL=company.repository.js.map
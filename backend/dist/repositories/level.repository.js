import { prisma } from '../db.js';
export class LevelRepository {
    async findNormalizedLevels() {
        return prisma.normalizedLevel.findMany({
            orderBy: { rank: 'asc' },
        });
    }
    async findLevelMappings(companyAId, companyBId) {
        // 1. Get all normalized levels ordered by rank
        const normalizedLevels = await prisma.normalizedLevel.findMany({
            orderBy: { rank: 'asc' },
        });
        // 2. Fetch all level mappings for Company A and Company B
        const companyAMappings = await prisma.levelMapping.findMany({
            where: {
                companyId: companyAId,
            },
            include: {
                levelingFramework: true,
            },
        });
        const companyBMappings = await prisma.levelMapping.findMany({
            where: {
                companyId: companyBId,
            },
            include: {
                levelingFramework: true,
            },
        });
        // 3. Map them together by normalized level ID
        return normalizedLevels.map((nl) => {
            const mappingsA = companyAMappings.filter((m) => m.normalizedLevelId === nl.id);
            const mappingsB = companyBMappings.filter((m) => m.normalizedLevelId === nl.id);
            return {
                normalizedLevel: {
                    id: nl.id,
                    name: nl.name,
                    rank: nl.rank,
                },
                companyAMappings: mappingsA.map((m) => ({
                    id: m.id,
                    name: m.mappingType === 'disclosed' ? m.sourceLevelName : `${m.sourceDesignation} (YOE: ${m.sourceYearsOfExperience})`,
                    frameworkName: m.levelingFramework?.name || 'Estimated',
                    track: m.levelingFramework?.track || 'N/A',
                    mappingType: m.mappingType,
                    confidenceScore: Number(m.confidenceScore),
                })),
                companyBMappings: mappingsB.map((m) => ({
                    id: m.id,
                    name: m.mappingType === 'disclosed' ? m.sourceLevelName : `${m.sourceDesignation} (YOE: ${m.sourceYearsOfExperience})`,
                    frameworkName: m.levelingFramework?.name || 'Estimated',
                    track: m.levelingFramework?.track || 'N/A',
                    mappingType: m.mappingType,
                    confidenceScore: Number(m.confidenceScore),
                })),
            };
        });
    }
}
//# sourceMappingURL=level.repository.js.map
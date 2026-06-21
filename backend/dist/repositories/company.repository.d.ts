export declare class CompanyRepository {
    findAll(): Promise<({
        levelingFrameworks: ({
            levelMappings: ({
                normalizedLevel: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    rank: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                levelingFrameworkId: string | null;
                companyId: string;
                sourceLevelName: string | null;
                sourceDesignation: string | null;
                sourceYearsOfExperience: number | null;
                normalizedLevelId: string;
                mappingType: string;
                confidenceScore: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            track: string;
        })[];
        levelMappings: ({
            normalizedLevel: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                rank: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelingFrameworkId: string | null;
            companyId: string;
            sourceLevelName: string | null;
            sourceDesignation: string | null;
            sourceYearsOfExperience: number | null;
            normalizedLevelId: string;
            mappingType: string;
            confidenceScore: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        name: string;
        industry: string;
        hasDisclosedFramework: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findById(id: string): Promise<({
        levelingFrameworks: ({
            levelMappings: ({
                normalizedLevel: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    rank: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                levelingFrameworkId: string | null;
                companyId: string;
                sourceLevelName: string | null;
                sourceDesignation: string | null;
                sourceYearsOfExperience: number | null;
                normalizedLevelId: string;
                mappingType: string;
                confidenceScore: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            track: string;
        })[];
        levelMappings: ({
            normalizedLevel: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                rank: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            levelingFrameworkId: string | null;
            companyId: string;
            sourceLevelName: string | null;
            sourceDesignation: string | null;
            sourceYearsOfExperience: number | null;
            normalizedLevelId: string;
            mappingType: string;
            confidenceScore: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        name: string;
        industry: string;
        hasDisclosedFramework: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findLevelByFrameworkAndName(frameworkId: string, levelName: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        levelingFrameworkId: string | null;
        companyId: string;
        sourceLevelName: string | null;
        sourceDesignation: string | null;
        sourceYearsOfExperience: number | null;
        normalizedLevelId: string;
        mappingType: string;
        confidenceScore: import("@prisma/client/runtime/library").Decimal;
    } | null>;
}

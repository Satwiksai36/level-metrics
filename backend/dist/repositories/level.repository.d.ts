export declare class LevelRepository {
    findNormalizedLevels(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        rank: number;
    }[]>;
    findLevelMappings(companyAId: string, companyBId: string): Promise<{
        normalizedLevel: {
            id: string;
            name: string;
            rank: number;
        };
        companyAMappings: {
            id: string;
            name: string | null;
            frameworkName: string;
            track: string;
            mappingType: string;
            confidenceScore: number;
        }[];
        companyBMappings: {
            id: string;
            name: string | null;
            frameworkName: string;
            track: string;
            mappingType: string;
            confidenceScore: number;
        }[];
    }[]>;
}

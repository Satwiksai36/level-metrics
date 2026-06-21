export interface HeuristicResult {
    normalizedLevelId: string;
    normalizedLevelName: string;
    confidenceScore: number;
    mappingType: 'estimated';
}
export declare class HeuristicMappingService {
    /**
     * Infers the global level and calculates a confidence score based on designation and years of experience.
     */
    static inferLevel(params: {
        companyId: string;
        designation: string;
        yearsOfExperience: number;
    }): Promise<HeuristicResult>;
}

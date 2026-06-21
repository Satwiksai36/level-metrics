export interface CompanyCompSummary {
    companyId: string;
    companyName: string;
    count: number;
    average: number | null;
    median: number | null;
    min: number;
    max: number;
    currency: string;
    datapoints: {
        id: string;
        levelName: string;
        mappingType: string;
        confidenceScore: number;
        sourceYearsOfExperience: number | null;
        totalComp: number;
        rawTotalComp: number;
        base: number;
        bonus: number;
        equity: number;
        refresher: number;
        locationCity: string;
        locationCountry: string;
        currency: string;
        timestamp: Date;
        verificationStatus: string;
    }[];
}
export declare class ComparisonService {
    private dataPointRepo;
    private locationRepo;
    compareByLevelAndRole(params: {
        normalizedLevelId: string;
        roleFamilyId: string;
        locationId?: string;
        adjustForCol?: boolean;
    }): Promise<CompanyCompSummary[]>;
    calculatePercentile(params: {
        normalizedLevelId: string;
        roleFamilyId: string;
        locationId: string;
        totalComp: number;
        currency: string;
    }): Promise<{
        percentile: number;
        sampleSize: number;
        percentiles: {
            p10: number;
            p25: number;
            p50: number;
            p75: number;
            p90: number;
        };
        isFallbackUsed: boolean;
    }>;
}

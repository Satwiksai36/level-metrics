export declare enum VerificationStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
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
export declare class DataPointRepository {
    create(input: CreateDataPointInput): Promise<{
        company: {
            id: string;
            name: string;
            industry: string;
            hasDisclosedFramework: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        levelMapping: {
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
        };
        roleFamily: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        location: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            country: string;
            costOfLivingIndex: import("@prisma/client/runtime/library").Decimal;
        };
        compensationStructure: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            base: import("@prisma/client/runtime/library").Decimal;
            bonus: import("@prisma/client/runtime/library").Decimal;
            equity: import("@prisma/client/runtime/library").Decimal;
            vestingSchedule: string;
            signOn: import("@prisma/client/runtime/library").Decimal;
            refresher: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            totalComp: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        levelMappingId: string;
        roleFamilyId: string;
        locationId: string;
        compensationStructureId: string;
        timestamp: Date;
        verificationStatus: string;
        userId: string | null;
    }>;
    findAll(filters: {
        normalizedLevelId?: string;
        roleFamilyId?: string;
        locationId?: string;
        companyId?: string;
        verificationStatus?: VerificationStatus;
        includeUnverified?: boolean;
    }): Promise<({
        company: {
            id: string;
            name: string;
            industry: string;
            hasDisclosedFramework: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        levelMapping: {
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
        };
        roleFamily: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        location: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            country: string;
            costOfLivingIndex: import("@prisma/client/runtime/library").Decimal;
        };
        compensationStructure: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            base: import("@prisma/client/runtime/library").Decimal;
            bonus: import("@prisma/client/runtime/library").Decimal;
            equity: import("@prisma/client/runtime/library").Decimal;
            vestingSchedule: string;
            signOn: import("@prisma/client/runtime/library").Decimal;
            refresher: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            totalComp: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        levelMappingId: string;
        roleFamilyId: string;
        locationId: string;
        compensationStructureId: string;
        timestamp: Date;
        verificationStatus: string;
        userId: string | null;
    })[]>;
    findById(id: string): Promise<({
        company: {
            id: string;
            name: string;
            industry: string;
            hasDisclosedFramework: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        levelMapping: {
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
        };
        roleFamily: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        location: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            country: string;
            costOfLivingIndex: import("@prisma/client/runtime/library").Decimal;
        };
        compensationStructure: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            base: import("@prisma/client/runtime/library").Decimal;
            bonus: import("@prisma/client/runtime/library").Decimal;
            equity: import("@prisma/client/runtime/library").Decimal;
            vestingSchedule: string;
            signOn: import("@prisma/client/runtime/library").Decimal;
            refresher: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            totalComp: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        levelMappingId: string;
        roleFamilyId: string;
        locationId: string;
        compensationStructureId: string;
        timestamp: Date;
        verificationStatus: string;
        userId: string | null;
    }) | null>;
    updateVerification(id: string, status: VerificationStatus): Promise<{
        company: {
            id: string;
            name: string;
            industry: string;
            hasDisclosedFramework: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        levelMapping: {
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
        };
        roleFamily: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        location: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            country: string;
            costOfLivingIndex: import("@prisma/client/runtime/library").Decimal;
        };
        compensationStructure: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            base: import("@prisma/client/runtime/library").Decimal;
            bonus: import("@prisma/client/runtime/library").Decimal;
            equity: import("@prisma/client/runtime/library").Decimal;
            vestingSchedule: string;
            signOn: import("@prisma/client/runtime/library").Decimal;
            refresher: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            totalComp: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        levelMappingId: string;
        roleFamilyId: string;
        locationId: string;
        compensationStructureId: string;
        timestamp: Date;
        verificationStatus: string;
        userId: string | null;
    }>;
}

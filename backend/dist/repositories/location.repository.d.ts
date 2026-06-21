export declare class LocationRepository {
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        country: string;
        costOfLivingIndex: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        city: string;
        country: string;
        costOfLivingIndex: import("@prisma/client/runtime/library").Decimal;
    } | null>;
}

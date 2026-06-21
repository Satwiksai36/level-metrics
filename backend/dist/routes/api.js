import { CompanyRepository } from '../repositories/company.repository.js';
import { DataPointRepository } from '../repositories/datapoint.repository.js';
import { LocationRepository } from '../repositories/location.repository.js';
import { RoleRepository } from '../repositories/role.repository.js';
import { LevelRepository } from '../repositories/level.repository.js';
import { ComparisonService } from '../services/comparison.service.js';
import { VerificationStatus } from '../repositories/datapoint.repository.js';
import { HeuristicMappingService } from '../services/heuristic-mapping.service.js';
import { prisma } from '../db.js';
export const apiRoutes = async (fastify) => {
    const companyRepo = new CompanyRepository();
    const dataPointRepo = new DataPointRepository();
    const locationRepo = new LocationRepository();
    const roleRepo = new RoleRepository();
    const levelRepo = new LevelRepository();
    const comparisonService = new ComparisonService();
    // 1. Metadata / Info lookups
    fastify.get('/companies', async (request, reply) => {
        try {
            const companies = await companyRepo.findAll();
            return companies;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    fastify.get('/normalized-levels', async (request, reply) => {
        try {
            const levels = await levelRepo.findNormalizedLevels();
            return levels;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    fastify.get('/role-families', async (request, reply) => {
        try {
            const roles = await roleRepo.findAll();
            return roles;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    fastify.get('/locations', async (request, reply) => {
        try {
            const locations = await locationRepo.findAll();
            return locations;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    // 2. Core Workflows
    // Compare comp distributions
    fastify.get('/compare', async (request, reply) => {
        try {
            const { normalizedLevelId, roleFamilyId, locationId, adjustForCol } = request.query;
            if (!normalizedLevelId || !roleFamilyId) {
                return reply.status(400).send({ error: 'normalizedLevelId and roleFamilyId are required query parameters.' });
            }
            const results = await comparisonService.compareByLevelAndRole({
                normalizedLevelId,
                roleFamilyId,
                locationId: locationId || undefined,
                adjustForCol: adjustForCol === 'true',
            });
            return results;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    // Mappings lookup side-by-side
    fastify.get('/level-mappings', async (request, reply) => {
        try {
            const { companyAId, companyBId } = request.query;
            if (!companyAId || !companyBId) {
                return reply.status(400).send({ error: 'companyAId and companyBId are required query parameters.' });
            }
            const mappings = await levelRepo.findLevelMappings(companyAId, companyBId);
            return mappings;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    // Benchmark / Percentile calculator
    fastify.get('/benchmark', async (request, reply) => {
        try {
            const { normalizedLevelId, roleFamilyId, locationId, totalComp, currency } = request.query;
            if (!normalizedLevelId || !roleFamilyId || !locationId || !totalComp || !currency) {
                return reply.status(400).send({
                    error: 'normalizedLevelId, roleFamilyId, locationId, totalComp, and currency are required query parameters.',
                });
            }
            const compVal = Number(totalComp);
            if (isNaN(compVal)) {
                return reply.status(400).send({ error: 'totalComp must be a valid number.' });
            }
            const benchmark = await comparisonService.calculatePercentile({
                normalizedLevelId,
                roleFamilyId,
                locationId,
                totalComp: compVal,
                currency,
            });
            return benchmark;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    // 3. Datapoint Submission & Moderation
    // Submit a data point
    fastify.post('/datapoints', async (request, reply) => {
        try {
            const body = request.body;
            const { companyId, roleFamilyId, locationId, base, bonus, equity, vestingSchedule, signOn, refresher, currency, } = body;
            if (!companyId ||
                !roleFamilyId ||
                !locationId ||
                base === undefined ||
                bonus === undefined ||
                equity === undefined ||
                !vestingSchedule ||
                signOn === undefined ||
                refresher === undefined ||
                !currency) {
                return reply.status(400).send({ error: 'Missing required submission fields in body.' });
            }
            const company = await companyRepo.findById(companyId);
            if (!company) {
                return reply.status(404).send({ error: 'Company not found.' });
            }
            let finalLevelMappingId = '';
            if (company.hasDisclosedFramework) {
                const mappingId = body.levelMappingId || body.companyLevelId;
                if (!mappingId) {
                    return reply.status(400).send({ error: 'levelMappingId is required for companies with a disclosed framework.' });
                }
                finalLevelMappingId = mappingId;
            }
            else {
                const { sourceDesignation, sourceYearsOfExperience } = body;
                if (!sourceDesignation || sourceYearsOfExperience === undefined) {
                    return reply.status(400).send({ error: 'sourceDesignation and sourceYearsOfExperience are required for estimated mappings.' });
                }
                const yoeVal = Number(sourceYearsOfExperience);
                if (isNaN(yoeVal)) {
                    return reply.status(400).send({ error: 'sourceYearsOfExperience must be a number.' });
                }
                // Check if mapping exists
                let existingMapping = await prisma.levelMapping.findFirst({
                    where: {
                        companyId,
                        sourceDesignation,
                        sourceYearsOfExperience: yoeVal,
                    },
                });
                if (existingMapping) {
                    finalLevelMappingId = existingMapping.id;
                }
                else {
                    // Infer using Heuristic Engine
                    const inferred = await HeuristicMappingService.inferLevel({
                        companyId,
                        designation: sourceDesignation,
                        yearsOfExperience: yoeVal,
                    });
                    // Create new LevelMapping
                    const newMapping = await prisma.levelMapping.create({
                        data: {
                            companyId,
                            sourceDesignation,
                            sourceYearsOfExperience: yoeVal,
                            normalizedLevelId: inferred.normalizedLevelId,
                            mappingType: 'estimated',
                            confidenceScore: inferred.confidenceScore,
                        },
                    });
                    finalLevelMappingId = newMapping.id;
                }
            }
            const newDp = await dataPointRepo.create({
                companyId,
                levelMappingId: finalLevelMappingId,
                roleFamilyId,
                locationId,
                base: Number(base),
                bonus: Number(bonus),
                equity: Number(equity),
                vestingSchedule,
                signOn: Number(signOn),
                refresher: Number(refresher),
                currency,
            });
            reply.status(201).send(newDp);
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    // List datapoints (includes moderation flag support)
    fastify.get('/datapoints', async (request, reply) => {
        try {
            const { includeUnverified } = request.query;
            const dps = await dataPointRepo.findAll({
                includeUnverified: includeUnverified === 'true',
            });
            return dps;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
    // Moderate/verify a datapoint
    fastify.patch('/datapoints/:id/verify', async (request, reply) => {
        try {
            const { id } = request.params;
            const { status } = request.body;
            if (!status || !Object.values(VerificationStatus).includes(status)) {
                return reply.status(400).send({
                    error: `Invalid or missing status. Supported values are: ${Object.values(VerificationStatus).join(', ')}`,
                });
            }
            const updatedDp = await dataPointRepo.updateVerification(id, status);
            return updatedDp;
        }
        catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
};
//# sourceMappingURL=api.js.map
import { DataPointRepository } from '../repositories/datapoint.repository.js';
import { LocationRepository } from '../repositories/location.repository.js';
export class ComparisonService {
    dataPointRepo = new DataPointRepository();
    locationRepo = new LocationRepository();
    async compareByLevelAndRole(params) {
        // 1. Fetch data points
        const datapoints = await this.dataPointRepo.findAll({
            normalizedLevelId: params.normalizedLevelId,
            roleFamilyId: params.roleFamilyId,
            locationId: params.locationId,
        });
        const baselineCOL = 100.0; // SF is baseline
        // 2. Process data points (perform currency conversions or COL adjustments)
        const getUSDConversionRate = (currency) => {
            const rates = {
                USD: 1.0,
                GBP: 1.25,
                INR: 0.012,
                EUR: 1.1,
            };
            return rates[currency.toUpperCase()] || 1.0;
        };
        const processedPoints = datapoints.map((dp) => {
            const rate = getUSDConversionRate(dp.compensationStructure.currency);
            const rawTotalUSD = Number(dp.compensationStructure.totalComp) * rate;
            const rawBaseUSD = Number(dp.compensationStructure.base) * rate;
            const rawBonusUSD = Number(dp.compensationStructure.bonus) * rate;
            const rawEquityUSD = Number(dp.compensationStructure.equity) * rate;
            const rawRefresherUSD = Number(dp.compensationStructure.refresher) * rate;
            let finalTotalComp = rawTotalUSD;
            // Adjust for Cost of Living if requested
            if (params.adjustForCol) {
                const colIndex = Number(dp.location.costOfLivingIndex);
                // adjusted = raw * (baseline / local)
                finalTotalComp = rawTotalUSD * (baselineCOL / colIndex);
            }
            const isDisclosed = dp.levelMapping.mappingType === 'disclosed';
            const levelName = isDisclosed
                ? (dp.levelMapping.sourceLevelName || '')
                : `${dp.levelMapping.sourceDesignation || ''} (YOE: ${dp.levelMapping.sourceYearsOfExperience ?? ''})`;
            return {
                id: dp.id,
                companyId: dp.companyId,
                companyName: dp.company.name,
                levelName,
                mappingType: dp.levelMapping.mappingType,
                confidenceScore: Number(dp.levelMapping.confidenceScore),
                sourceYearsOfExperience: dp.levelMapping.sourceYearsOfExperience,
                totalComp: finalTotalComp,
                rawTotalComp: rawTotalUSD,
                base: rawBaseUSD,
                bonus: rawBonusUSD,
                equity: rawEquityUSD,
                refresher: rawRefresherUSD,
                locationCity: dp.location.city,
                locationCountry: dp.location.country,
                currency: 'USD', // Normalized to USD
                timestamp: dp.timestamp,
                verificationStatus: dp.verificationStatus,
            };
        });
        // 3. Group by company and calculate aggregates
        const companyGroups = {};
        for (const p of processedPoints) {
            if (!companyGroups[p.companyId]) {
                companyGroups[p.companyId] = [];
            }
            companyGroups[p.companyId].push(p);
        }
        const summaries = [];
        for (const [companyId, points] of Object.entries(companyGroups)) {
            const companyName = points[0].companyName;
            const totalComps = points.map((p) => p.totalComp).sort((a, b) => a - b);
            const count = totalComps.length;
            const sum = totalComps.reduce((acc, val) => acc + val, 0);
            // Suppress average and median for less than 3 datapoints
            const average = count >= 3 ? sum / count : null;
            let median = null;
            if (count >= 3) {
                const mid = Math.floor(count / 2);
                median = count % 2 !== 0 ? totalComps[mid] : (totalComps[mid - 1] + totalComps[mid]) / 2;
            }
            const min = totalComps[0] || 0;
            const max = totalComps[count - 1] || 0;
            summaries.push({
                companyId,
                companyName,
                count,
                average,
                median,
                min,
                max,
                currency: 'USD',
                datapoints: points,
            });
        }
        // Sort by median. If median is null, sort to the bottom.
        return summaries.sort((a, b) => {
            if (a.median === null && b.median === null)
                return 0;
            if (a.median === null)
                return 1;
            if (b.median === null)
                return -1;
            return b.median - a.median;
        });
    }
    async calculatePercentile(params) {
        // 1. Fetch location details to convert user's compensation to USD and handle COL scaling
        const targetLocation = await this.locationRepo.findById(params.locationId);
        if (!targetLocation) {
            throw new Error('Location not found');
        }
        const getUSDConversionRate = (currency) => {
            const rates = {
                USD: 1.0,
                GBP: 1.25,
                INR: 0.012,
                EUR: 1.1,
            };
            return rates[currency.toUpperCase()] || 1.0;
        };
        const userRate = getUSDConversionRate(params.currency);
        const userTotalUSD = params.totalComp * userRate;
        // 2. Query all verified datapoints for the cohort at target location
        let cohort = await this.dataPointRepo.findAll({
            normalizedLevelId: params.normalizedLevelId,
            roleFamilyId: params.roleFamilyId,
            locationId: params.locationId,
        });
        let useFallback = false;
        let cohortUSDComps = [];
        // Fallback: If local cohort has too few datapoints (e.g. < 3),
        // calculate statistics based on all locations, adjusted to the target location's cost of living index!
        if (cohort.length < 3) {
            useFallback = true;
            const allCohort = await this.dataPointRepo.findAll({
                normalizedLevelId: params.normalizedLevelId,
                roleFamilyId: params.roleFamilyId,
            });
            const targetCol = Number(targetLocation.costOfLivingIndex);
            cohortUSDComps = allCohort.map((dp) => {
                const rate = getUSDConversionRate(dp.compensationStructure.currency);
                const dpTotalUSD = Number(dp.compensationStructure.totalComp) * rate;
                const dpCol = Number(dp.location.costOfLivingIndex);
                // Adjust from the datapoint's local COL to the target location's COL
                return dpTotalUSD * (targetCol / dpCol);
            }).sort((a, b) => a - b);
        }
        else {
            cohortUSDComps = cohort
                .map((dp) => Number(dp.compensationStructure.totalComp) * getUSDConversionRate(dp.compensationStructure.currency))
                .sort((a, b) => a - b);
        }
        const count = cohortUSDComps.length;
        if (count === 0) {
            return {
                percentile: 50,
                sampleSize: 0,
                percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
                isFallbackUsed: useFallback,
            };
        }
        // 3. Find percentile position of user's compensation
        let rank = 0;
        let equalCount = 0;
        for (const val of cohortUSDComps) {
            if (val < userTotalUSD) {
                rank++;
            }
            else if (val === userTotalUSD) {
                equalCount++;
            }
        }
        const percentile = ((rank + 0.5 * equalCount) / count) * 100;
        // Helper to interpolate percentiles
        const getPercentileValue = (sortedArray, p) => {
            if (sortedArray.length === 0)
                return 0;
            const index = (p / 100) * (sortedArray.length - 1);
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const weight = index - lower;
            return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
        };
        return {
            percentile: Math.round(percentile),
            sampleSize: count,
            percentiles: {
                p10: Math.round(getPercentileValue(cohortUSDComps, 10)),
                p25: Math.round(getPercentileValue(cohortUSDComps, 25)),
                p50: Math.round(getPercentileValue(cohortUSDComps, 50)),
                p75: Math.round(getPercentileValue(cohortUSDComps, 75)),
                p90: Math.round(getPercentileValue(cohortUSDComps, 90)),
            },
            isFallbackUsed: useFallback,
        };
    }
}
//# sourceMappingURL=comparison.service.js.map
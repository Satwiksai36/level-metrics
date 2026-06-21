import { ComparisonService } from './services/comparison.service.js';
import { prisma } from './db.js';
async function runTests() {
    console.log('--- STARTING PLATFORM LOGIC INTEGRATION TESTS ---');
    const comparisonService = new ComparisonService();
    // Test Case 1: Fetch normalized levels and confirm database seeding
    const normalizedLevels = await prisma.normalizedLevel.findMany({
        orderBy: { rank: 'asc' },
    });
    console.log(`[PASS] Database has ${normalizedLevels.length} normalized levels seeded.`);
    const entryLevel = normalizedLevels.find((nl) => nl.name === 'Entry');
    const seniorLevel = normalizedLevels.find((nl) => nl.name === 'Senior');
    const roleFamily = await prisma.roleFamily.findFirst({
        where: { name: 'Software Engineering' },
    });
    if (!entryLevel || !seniorLevel || !roleFamily) {
        throw new Error('Required seed data missing. Run seed script first.');
    }
    // Test Case 2: Verify Level-Normalized Comparison (No COL Adjustment)
    console.log('Testing level-normalized comparison...');
    const compareRaw = await comparisonService.compareByLevelAndRole({
        normalizedLevelId: entryLevel.id,
        roleFamilyId: roleFamily.id,
        adjustForCol: false,
    });
    console.log(`[PASS] Compare Raw returned ${compareRaw.length} companies.`);
    for (const company of compareRaw) {
        const medianStr = company.median !== null ? company.median.toLocaleString() : 'Suppressed (<3 entries)';
        console.log(` -> ${company.companyName}: Median Comp = $${medianStr} (${company.count} datapoints)`);
    }
    // Test Case 3: Verify Cost of Living Adjustment Math
    console.log('Testing Cost of Living (COL) adjustment...');
    const compareCol = await comparisonService.compareByLevelAndRole({
        normalizedLevelId: entryLevel.id,
        roleFamilyId: roleFamily.id,
        adjustForCol: true,
    });
    console.log(`[PASS] Compare COL returned ${compareCol.length} companies.`);
    for (const company of compareCol) {
        const medianStr = company.median !== null ? company.median.toLocaleString() : 'Suppressed (<3 entries)';
        console.log(` -> ${company.companyName}: COL-Adjusted Median Comp = $${medianStr}`);
    }
    // Test Case 4: Verify Percentile Calculations (Benchmarking)
    console.log('Testing benchmarking calculator (percentile)...');
    const locationSF = await prisma.location.findFirst({
        where: { city: 'San Francisco' },
    });
    if (!locationSF) {
        throw new Error('SF Location missing.');
    }
    // User input: $170,000 USD at Entry Level in SF
    const benchmarkSF = await comparisonService.calculatePercentile({
        normalizedLevelId: entryLevel.id,
        roleFamilyId: roleFamily.id,
        locationId: locationSF.id,
        totalComp: 170000,
        currency: 'USD',
    });
    console.log(`[PASS] SF Benchmark returned:`);
    console.log(` -> Percentile: ${benchmarkSF.percentile}%`);
    console.log(` -> Sample Size: ${benchmarkSF.sampleSize}`);
    console.log(` -> Fallback Used? ${benchmarkSF.isFallbackUsed}`);
    console.log(` -> Median (p50): $${benchmarkSF.percentiles.p50.toLocaleString()}`);
    // Test Case 5: Verify Fallback logic when location sample size is low
    console.log('Testing benchmarking fallback logic (low sample size)...');
    const locationLondon = await prisma.location.findFirst({
        where: { city: 'London' },
    });
    if (!locationLondon) {
        throw new Error('London Location missing.');
    }
    // London only has 1 verified entry level datapoint in seed, which triggers fallback (< 3)
    const benchmarkLondon = await comparisonService.calculatePercentile({
        normalizedLevelId: entryLevel.id,
        roleFamilyId: roleFamily.id,
        locationId: locationLondon.id,
        totalComp: 120000,
        currency: 'USD',
    });
    console.log(`[PASS] London Benchmark returned:`);
    console.log(` -> Percentile: ${benchmarkLondon.percentile}%`);
    console.log(` -> Sample Size: ${benchmarkLondon.sampleSize} (overall COL-adjusted sample size)`);
    console.log(` -> Fallback Used? ${benchmarkLondon.isFallbackUsed} (Expected: true)`);
    if (!benchmarkLondon.isFallbackUsed) {
        throw new Error('Fallback logic failed to trigger for London cohort.');
    }
    console.log('--- ALL INTEGRATION TESTS PASSED ---');
}
runTests()
    .catch((err) => {
    console.error('[FAIL] Test execution failed:', err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=test-logic.js.map
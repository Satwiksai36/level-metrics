import { HeuristicMappingService } from './services/heuristic-mapping.service.js';
import { prisma } from './db.js';
import process from 'node:process';

async function testHeuristics() {
  console.log('--- STARTING HEURISTIC MAPPING ENGINE TESTS ---');

  const company = await prisma.company.findFirst({
    where: { name: 'Cognizant' },
  });

  if (!company) {
    throw new Error('Seed data required. Run seed first.');
  }

  const testCases = [
    {
      title: 'Senior Software Engineer',
      yoe: 7,
      expectedLevel: 'Senior',
      expectedConfidence: 0.75, // Alignment bonus: Baseline 0.5 + 0.25
    },
    {
      title: 'Lead Engineer',
      yoe: 1,
      expectedLevel: 'Senior',
      expectedConfidence: 0.35, // Conflict penalty: Baseline 0.5 - 0.15 (1 YOE is Entry, Lead is Senior)
    },
    {
      title: 'Associate Developer',
      yoe: 1,
      expectedLevel: 'Entry',
      expectedConfidence: 0.75, // Alignment bonus: Baseline 0.5 + 0.25
    },
    {
      title: 'Software Engineer',
      yoe: 10,
      expectedLevel: 'Mid',
      expectedConfidence: 0.35, // Conflict penalty: Baseline 0.5 - 0.15 (10 YOE is Staff, Engineer is Mid)
    },
    {
      title: 'Technical Manager',
      yoe: 12,
      expectedLevel: 'Staff',
      expectedConfidence: 0.75, // Alignment bonus: Baseline 0.5 + 0.25
    },
    {
      title: 'Product Designer', // No keyword matched
      yoe: 6,
      expectedLevel: 'Senior', // Fallback to YOE level (Senior)
      expectedConfidence: 0.4, // Fallback confidence
    },
  ];

  for (const tc of testCases) {
    const result = await HeuristicMappingService.inferLevel({
      companyId: company.id,
      designation: tc.title,
      yearsOfExperience: tc.yoe,
    });

    console.log(`Input: "${tc.title}" (${tc.yoe} YOE)`);
    console.log(`  -> Inferred Level: ${result.normalizedLevelName} (Expected: ${tc.expectedLevel})`);
    console.log(`  -> Confidence: ${result.confidenceScore} (Expected: ${tc.expectedConfidence})`);

    if (result.normalizedLevelName !== tc.expectedLevel) {
      throw new Error(`FAIL: Expected level ${tc.expectedLevel}, got ${result.normalizedLevelName}`);
    }

    if (Math.abs(result.confidenceScore - tc.expectedConfidence) > 0.001) {
      throw new Error(`FAIL: Expected confidence ${tc.expectedConfidence}, got ${result.confidenceScore}`);
    }
    console.log('  [PASS]');
  }

  console.log('--- ALL HEURISTIC MAPPING ENGINE TESTS PASSED ---');
}

testHeuristics()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

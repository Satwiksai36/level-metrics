import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean existing data (order matters due to FK constraints)
  await prisma.dataPoint.deleteMany({});
  await prisma.compensationStructure.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.levelMapping.deleteMany({});
  await prisma.levelingFramework.deleteMany({});
  await prisma.normalizedLevel.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.roleFamily.deleteMany({});
  await prisma.location.deleteMany({});

  console.log('Database cleaned.');

  // 2. Seed Normalized Levels
  const normalizedLevels = [
    { name: 'Entry', rank: 1 },
    { name: 'Mid', rank: 2 },
    { name: 'Senior', rank: 3 },
    { name: 'Staff', rank: 4 },
    { name: 'Principal', rank: 5 },
    { name: 'Director+', rank: 6 },
  ];

  const dbNormalizedLevels: any[] = [];
  for (const nl of normalizedLevels) {
    const dbNl = await prisma.normalizedLevel.create({
      data: nl,
    });
    dbNormalizedLevels.push(dbNl);
  }
  console.log(`Seeded ${dbNormalizedLevels.length} normalized levels.`);

  const getNlByRank = (rank: number) => {
    return dbNormalizedLevels.find((nl) => nl.rank === rank)!;
  };

  // 3. Seed Companies
  const companies = [
    { name: 'Google', industry: 'Technology', hasDisclosedFramework: true },
    { name: 'Meta', industry: 'Technology', hasDisclosedFramework: true },
    { name: 'Amazon', industry: 'E-commerce & Cloud', hasDisclosedFramework: true },
    { name: 'Cognizant', industry: 'Consulting & IT Services', hasDisclosedFramework: false },
    { name: 'Infosys', industry: 'Consulting & IT Services', hasDisclosedFramework: false },
  ];

  const dbCompanies: Record<string, any> = {};
  for (const c of companies) {
    const dbC = await prisma.company.create({
      data: c,
    });
    dbCompanies[c.name] = dbC;
  }
  console.log(`Seeded ${Object.keys(dbCompanies).length} companies.`);

  // 4. Seed Leveling Frameworks & LevelMappings (Disclosed)
  // Google
  const googleFramework = await prisma.levelingFramework.create({
    data: {
      companyId: dbCompanies['Google'].id,
      name: 'Software Engineering Ladder',
      track: 'IC',
    },
  });

  const googleLevels = [
    { name: 'L3', rank: 1 },
    { name: 'L4', rank: 2 },
    { name: 'L5', rank: 3 },
    { name: 'L6', rank: 4 },
    { name: 'L7', rank: 5 },
    { name: 'L8', rank: 6 },
  ];

  const dbGoogleMappings: Record<string, any> = {};
  for (const gl of googleLevels) {
    const nl = getNlByRank(gl.rank);
    const dbMap = await prisma.levelMapping.create({
      data: {
        companyId: dbCompanies['Google'].id,
        levelingFrameworkId: googleFramework.id,
        sourceLevelName: gl.name,
        normalizedLevelId: nl.id,
        mappingType: 'disclosed',
        confidenceScore: 1.0,
      },
    });
    dbGoogleMappings[gl.name] = dbMap;
  }

  // Meta
  const metaFramework = await prisma.levelingFramework.create({
    data: {
      companyId: dbCompanies['Meta'].id,
      name: 'Software Engineering Track',
      track: 'IC',
    },
  });

  const metaLevels = [
    { name: 'E3', rank: 1 },
    { name: 'E4', rank: 2 },
    { name: 'E5', rank: 3 },
    { name: 'E6', rank: 4 },
    { name: 'E7', rank: 5 },
    { name: 'E8', rank: 6 },
  ];

  const dbMetaMappings: Record<string, any> = {};
  for (const ml of metaLevels) {
    const nl = getNlByRank(ml.rank);
    const dbMap = await prisma.levelMapping.create({
      data: {
        companyId: dbCompanies['Meta'].id,
        levelingFrameworkId: metaFramework.id,
        sourceLevelName: ml.name,
        normalizedLevelId: nl.id,
        mappingType: 'disclosed',
        confidenceScore: 1.0,
      },
    });
    dbMetaMappings[ml.name] = dbMap;
  }

  // Amazon
  const amazonFramework = await prisma.levelingFramework.create({
    data: {
      companyId: dbCompanies['Amazon'].id,
      name: 'Software Development Engineering Ladder',
      track: 'IC',
    },
  });

  const amazonLevels = [
    { name: 'L4', rank: 1 },
    { name: 'L5', rank: 2 },
    { name: 'L6', rank: 3 },
    { name: 'L7', rank: 4 },
    { name: 'L8', rank: 5 },
  ];

  const dbAmazonMappings: Record<string, any> = {};
  for (const al of amazonLevels) {
    const nl = getNlByRank(al.rank);
    const dbMap = await prisma.levelMapping.create({
      data: {
        companyId: dbCompanies['Amazon'].id,
        levelingFrameworkId: amazonFramework.id,
        sourceLevelName: al.name,
        normalizedLevelId: nl.id,
        mappingType: 'disclosed',
        confidenceScore: 1.0,
      },
    });
    dbAmazonMappings[al.name] = dbMap;
  }

  // 5. Seed LevelMappings (Estimated - AmbitionBox style)
  // Cognizant
  const cogLevels = [
    { designation: 'Programmer Analyst', yoe: 1, rank: 1, confidence: 0.75 },
    { designation: 'Associate', yoe: 4, rank: 2, confidence: 0.75 },
    { designation: 'Senior Associate', yoe: 7, rank: 3, confidence: 0.75 },
    { designation: 'Manager', yoe: 11, rank: 4, confidence: 0.85 },
  ];

  const dbCognizantMappings: Record<string, any> = {};
  for (const cl of cogLevels) {
    const nl = getNlByRank(cl.rank);
    const dbMap = await prisma.levelMapping.create({
      data: {
        companyId: dbCompanies['Cognizant'].id,
        sourceDesignation: cl.designation,
        sourceYearsOfExperience: cl.yoe,
        normalizedLevelId: nl.id,
        mappingType: 'estimated',
        confidenceScore: cl.confidence,
      },
    });
    dbCognizantMappings[cl.designation] = dbMap;
  }

  // Infosys
  const infLevels = [
    { designation: 'Systems Engineer', yoe: 1, rank: 1, confidence: 0.75 },
    { designation: 'Technology Analyst', yoe: 3, rank: 2, confidence: 0.75 },
    { designation: 'Technology Lead', yoe: 7, rank: 3, confidence: 0.75 },
    { designation: 'Project Manager', yoe: 12, rank: 4, confidence: 0.85 },
  ];

  const dbInfosysMappings: Record<string, any> = {};
  for (const il of infLevels) {
    const nl = getNlByRank(il.rank);
    const dbMap = await prisma.levelMapping.create({
      data: {
        companyId: dbCompanies['Infosys'].id,
        sourceDesignation: il.designation,
        sourceYearsOfExperience: il.yoe,
        normalizedLevelId: nl.id,
        mappingType: 'estimated',
        confidenceScore: il.confidence,
      },
    });
    dbInfosysMappings[il.designation] = dbMap;
  }

  console.log('Seeded company leveling mappings (Disclosed and Estimated).');

  // 6. Seed Role Families
  const roleFamilies = [
    { name: 'Software Engineering' },
    { name: 'Product Management' },
    { name: 'Data Science' },
  ];

  const dbRoleFamilies: Record<string, any> = {};
  for (const rf of roleFamilies) {
    const dbRf = await prisma.roleFamily.create({
      data: rf,
    });
    dbRoleFamilies[rf.name] = dbRf;
  }
  console.log(`Seeded ${Object.keys(dbRoleFamilies).length} role families.`);

  // 7. Seed Locations
  const locations = [
    { city: 'San Francisco', country: 'United States', costOfLivingIndex: 100.00 },
    { city: 'Seattle', country: 'United States', costOfLivingIndex: 90.00 },
    { city: 'New York City', country: 'United States', costOfLivingIndex: 95.00 },
    { city: 'London', country: 'United Kingdom', costOfLivingIndex: 80.00 },
    { city: 'Bengaluru', country: 'India', costOfLivingIndex: 30.00 },
  ];

  const dbLocations: Record<string, any> = {};
  for (const loc of locations) {
    const dbLoc = await prisma.location.create({
      data: loc,
    });
    dbLocations[`${loc.city}, ${loc.country}`] = dbLoc;
  }
  console.log(`Seeded ${Object.keys(dbLocations).length} locations.`);

  // 8. Users
  const testUser = await prisma.user.create({
    data: {
      email: 'user@compintel.com',
      role: 'USER',
    },
  });

  // 9. Datapoints Submission Seeding Helper
  const createDatapoint = async (
    companyName: string,
    mappingKey: string,
    roleName: string,
    locationKey: string,
    base: number,
    bonus: number,
    equity: number,
    refresher: number,
    signOn: number,
    currency: string,
    status: string,
    mappingsMap: Record<string, any>
  ) => {
    const totalComp = base + bonus + (equity / 4) + refresher;

    const compStruct = await prisma.compensationStructure.create({
      data: {
        base,
        bonus,
        equity,
        vestingSchedule: '25/25/25/25',
        signOn,
        refresher,
        currency,
        totalComp,
      },
    });

    await prisma.dataPoint.create({
      data: {
        companyId: dbCompanies[companyName].id,
        levelMappingId: mappingsMap[mappingKey].id,
        roleFamilyId: dbRoleFamilies[roleName].id,
        locationId: dbLocations[locationKey].id,
        compensationStructureId: compStruct.id,
        verificationStatus: status,
        userId: testUser.id,
      },
    });
  };

  // Google Disclosed Submissions
  await createDatapoint('Google', 'L3', 'Software Engineering', 'San Francisco, United States', 140000, 15000, 100000, 0, 20000, 'USD', 'VERIFIED', dbGoogleMappings);
  await createDatapoint('Google', 'L3', 'Software Engineering', 'Seattle, United States', 135000, 15000, 90000, 0, 15000, 'USD', 'VERIFIED', dbGoogleMappings);
  await createDatapoint('Google', 'L4', 'Software Engineering', 'San Francisco, United States', 170000, 25000, 180000, 15000, 20000, 'USD', 'VERIFIED', dbGoogleMappings);
  await createDatapoint('Google', 'L5', 'Software Engineering', 'San Francisco, United States', 210000, 40000, 320000, 35000, 30000, 'USD', 'VERIFIED', dbGoogleMappings);
  await createDatapoint('Google', 'L5', 'Software Engineering', 'Bengaluru, India', 3600000, 400000, 3500000, 400000, 500000, 'INR', 'VERIFIED', dbGoogleMappings);

  // Meta Disclosed Submissions
  await createDatapoint('Meta', 'E3', 'Software Engineering', 'San Francisco, United States', 145000, 15000, 120000, 0, 25000, 'USD', 'VERIFIED', dbMetaMappings);
  await createDatapoint('Meta', 'E4', 'Software Engineering', 'San Francisco, United States', 175000, 26000, 220000, 20000, 20000, 'USD', 'VERIFIED', dbMetaMappings);
  await createDatapoint('Meta', 'E5', 'Software Engineering', 'San Francisco, United States', 220000, 44000, 400000, 50000, 30000, 'USD', 'VERIFIED', dbMetaMappings);
  await createDatapoint('Meta', 'E6', 'Software Engineering', 'San Francisco, United States', 270000, 68000, 680000, 95000, 50000, 'USD', 'VERIFIED', dbMetaMappings);

  // Amazon Disclosed Submissions
  await createDatapoint('Amazon', 'L4', 'Software Engineering', 'Seattle, United States', 130000, 0, 80000, 0, 20000, 'USD', 'VERIFIED', dbAmazonMappings);
  await createDatapoint('Amazon', 'L5', 'Software Engineering', 'Seattle, United States', 160000, 0, 150000, 0, 30000, 'USD', 'VERIFIED', dbAmazonMappings);
  await createDatapoint('Amazon', 'L6', 'Software Engineering', 'San Francisco, United States', 200000, 0, 300000, 0, 45000, 'USD', 'VERIFIED', dbAmazonMappings);

  // Cognizant Estimated Submissions (AmbitionBox style)
  // Entry: Programmer Analyst
  await createDatapoint('Cognizant', 'Programmer Analyst', 'Software Engineering', 'Bengaluru, India', 450000, 30000, 0, 0, 15000, 'INR', 'VERIFIED', dbCognizantMappings);
  await createDatapoint('Cognizant', 'Programmer Analyst', 'Software Engineering', 'Bengaluru, India', 430000, 25000, 0, 0, 10000, 'INR', 'VERIFIED', dbCognizantMappings);
  
  // Mid: Associate
  await createDatapoint('Cognizant', 'Associate', 'Software Engineering', 'Bengaluru, India', 850000, 60000, 0, 0, 30000, 'INR', 'VERIFIED', dbCognizantMappings);
  await createDatapoint('Cognizant', 'Associate', 'Software Engineering', 'New York City, United States', 95000, 8000, 0, 0, 5000, 'USD', 'VERIFIED', dbCognizantMappings);

  // Senior: Senior Associate
  await createDatapoint('Cognizant', 'Senior Associate', 'Software Engineering', 'Bengaluru, India', 1400000, 100000, 200000, 0, 50000, 'INR', 'VERIFIED', dbCognizantMappings);
  await createDatapoint('Cognizant', 'Senior Associate', 'Software Engineering', 'New York City, United States', 130000, 12000, 20000, 0, 10000, 'USD', 'VERIFIED', dbCognizantMappings);

  // Infosys Estimated Submissions (AmbitionBox style)
  // Entry: Systems Engineer
  await createDatapoint('Infosys', 'Systems Engineer', 'Software Engineering', 'Bengaluru, India', 400000, 20000, 0, 0, 10000, 'INR', 'VERIFIED', dbInfosysMappings);
  
  // Mid: Technology Analyst
  await createDatapoint('Infosys', 'Technology Analyst', 'Software Engineering', 'Bengaluru, India', 780000, 50000, 0, 0, 25000, 'INR', 'VERIFIED', dbInfosysMappings);
  
  // Senior: Technology Lead
  await createDatapoint('Infosys', 'Technology Lead', 'Software Engineering', 'Bengaluru, India', 1350000, 90000, 150000, 0, 40000, 'INR', 'VERIFIED', dbInfosysMappings);
  
  // Staff: Project Manager
  await createDatapoint('Infosys', 'Project Manager', 'Software Engineering', 'Bengaluru, India', 2100000, 180000, 300000, 0, 80000, 'INR', 'VERIFIED', dbInfosysMappings);

  console.log('Seeded compensation data points (disclosed and estimated path).');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

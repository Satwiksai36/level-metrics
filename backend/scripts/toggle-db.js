import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const envPath = path.join(__dirname, '../.env');

const target = process.argv[2]; // 'sqlite' or 'postgres'

if (target !== 'sqlite' && target !== 'postgres') {
  console.error('Usage: node toggle-db.js [sqlite|postgres]');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

if (target === 'sqlite') {
  // Replace postgresql with sqlite
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  // Remove PostgreSQL specific Decimal decorations like @db.Decimal(15, 2)
  schema = schema.replace(/@db\.Decimal\(\d+,\s*\d+\)/g, '');
  
  fs.writeFileSync(schemaPath, schema, 'utf8');

  // Update .env file to use sqlite dev.db
  const envContent = 'DATABASE_URL="file:./dev.db"\n';
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('Switched Prisma schema to SQLite successfully.');
} else {
  // Restore PostgreSQL
  const postgresSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Company {
  id                    String              @id @default(uuid())
  name                  String              @unique
  industry              String
  hasDisclosedFramework Boolean             @default(true)
  levelingFrameworks    LevelingFramework[]
  levelMappings         LevelMapping[]
  dataPoints            DataPoint[]
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}

model LevelingFramework {
  id            String         @id @default(uuid())
  companyId     String
  company       Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  name          String
  track         String         // e.g. IC, Management
  levelMappings LevelMapping[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@unique([companyId, name])
}

model NormalizedLevel {
  id            String         @id @default(uuid())
  name          String         @unique // e.g. Entry, Mid, Senior, Staff, Principal, Director+
  rank          Int            @unique // to order from junior to senior
  levelMappings LevelMapping[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model LevelMapping {
  id                      String             @id @default(uuid())
  companyId               String
  company                 Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  levelingFrameworkId     String?
  levelingFramework       LevelingFramework? @relation(fields: [levelingFrameworkId], references: [id], onDelete: Cascade)
  sourceLevelName         String?            // e.g. L5 (disclosed)
  sourceDesignation       String?            // e.g. Senior Software Engineer (estimated)
  sourceYearsOfExperience Int?               // e.g. 6 (estimated)
  normalizedLevelId       String
  normalizedLevel         NormalizedLevel    @relation(fields: [normalizedLevelId], references: [id])
  mappingType             String             // disclosed | estimated
  confidenceScore         Decimal            @db.Decimal(5, 2)
  dataPoints              DataPoint[]
  createdAt               DateTime           @default(now())
  updatedAt               DateTime           @updatedAt
}

model RoleFamily {
  id         String      @id @default(uuid())
  name       String      @unique // e.g. Software Engineering, Product Management
  dataPoints DataPoint[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model Location {
  id                String      @id @default(uuid())
  city              String
  country           String
  costOfLivingIndex Decimal     @db.Decimal(10, 2) // e.g. SF = 100.00
  dataPoints        DataPoint[]
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@unique([city, country])
}

model CompensationStructure {
  id              String     @id @default(uuid())
  base            Decimal    @db.Decimal(15, 2)
  bonus           Decimal    @db.Decimal(15, 2)
  equity          Decimal    @db.Decimal(15, 2) // Total stock value over vesting period
  vestingSchedule String     // e.g. "25/25/25/25"
  signOn          Decimal    @db.Decimal(15, 2)
  refresher       Decimal    @db.Decimal(15, 2)
  currency        String     // e.g. USD, INR
  totalComp       Decimal    @db.Decimal(15, 2) // Annualized total compensation
  dataPoint       DataPoint?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model DataPoint {
  id                      String                @id @default(uuid())
  companyId               String
  company                 Company               @relation(fields: [companyId], references: [id])
  levelMappingId          String
  levelMapping            LevelMapping          @relation(fields: [levelMappingId], references: [id])
  roleFamilyId            String
  roleFamily              RoleFamily            @relation(fields: [roleFamilyId], references: [id])
  locationId              String
  location                Location              @relation(fields: [locationId], references: [id])
  compensationStructureId String                @unique
  compensationStructure   CompensationStructure @relation(fields: [compensationStructureId], references: [id], onDelete: Cascade)
  timestamp               DateTime              @default(now())
  verificationStatus      String                @default("PENDING")
  userId                  String?
  user                    User?                 @relation(fields: [userId], references: [id])
  createdAt               DateTime              @default(now())
  updatedAt               DateTime              @updatedAt
}

model User {
  id         String      @id @default(uuid())
  email      String      @unique
  role       String      @default("USER")
  dataPoints DataPoint[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
`;
  fs.writeFileSync(schemaPath, postgresSchema, 'utf8');
  console.log('Switched Prisma schema back to PostgreSQL.');
}

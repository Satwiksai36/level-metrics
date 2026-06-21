import { PrismaClient, NormalizedLevel } from '@prisma/client';
import { prisma } from '../db.js';

export interface HeuristicResult {
  normalizedLevelId: string;
  normalizedLevelName: string;
  confidenceScore: number;
  mappingType: 'estimated';
}

export class HeuristicMappingService {
  /**
   * Infers the global level and calculates a confidence score based on designation and years of experience.
   */
  static async inferLevel(params: {
    companyId: string;
    designation: string;
    yearsOfExperience: number;
  }): Promise<HeuristicResult> {
    const { designation, yearsOfExperience } = params;

    // Fetch all normalized levels to map rank/names
    const normalizedLevels = await prisma.normalizedLevel.findMany({
      orderBy: { rank: 'asc' },
    });

    if (normalizedLevels.length === 0) {
      throw new Error('Normalized levels must be seeded before running heuristic inference.');
    }

    // A. YOE Banding
    // 0–2 Years: Entry
    // 2–5 Years: Mid
    // 5–9 Years: Senior
    // 9–13 Years: Staff
    // 13–15 Years: Principal
    // 15+ Years: Director+
    let yoeLevelName = 'Entry';
    if (yearsOfExperience <= 2) {
      yoeLevelName = 'Entry';
    } else if (yearsOfExperience <= 5) {
      yoeLevelName = 'Mid';
    } else if (yearsOfExperience <= 9) {
      yoeLevelName = 'Senior';
    } else if (yearsOfExperience <= 13) {
      yoeLevelName = 'Staff';
    } else if (yearsOfExperience <= 15) {
      yoeLevelName = 'Principal';
    } else {
      yoeLevelName = 'Director+';
    }

    // B. Keyword Parsing
    const cleanDesignation = designation.toLowerCase().trim();

    // Group keywords. Ordered by priority/specificity
    const keywordGroups = [
      {
        levelName: 'Director+',
        keywords: ['director', 'vp', 'chief', 'head', 'cto', 'founder'],
      },
      {
        levelName: 'Principal',
        keywords: ['principal', 'distinguished', 'fellow', 'senior manager'],
      },
      {
        levelName: 'Staff',
        keywords: ['staff', 'architect', 'technical manager', 'manager'],
      },
      {
        levelName: 'Senior',
        keywords: ['senior', 'sr', 'tech lead', 'lead', 'sde iii', 'sde 3'],
      },
      {
        levelName: 'Entry',
        keywords: ['junior', 'jr', 'associate', 'intern', 'grad', 'trainee', 'sde i', 'sde 1'],
      },
      {
        levelName: 'Mid',
        keywords: ['sde ii', 'sde 2', 'analyst', 'developer', 'engineer'],
      },
    ];

    let matchedKeywordLevelName: string | null = null;
    
    // Find the first matching keyword group
    for (const group of keywordGroups) {
      const hasMatch = group.keywords.some((kw) => {
        // Use word boundary or simple substring.
        // A robust check is substring check or regex. Since keywords like "sr" or "jr" could be part of words,
        // we can use regex or boundary checking, but simple substring matches for phrases/words is standard.
        // Let's use boundary checking or direct substring check. Let's do substring search for multi-word phrases,
        // and word boundaries for short terms like "sr", "jr", "vp", etc.
        // To be simple and robust:
        if (kw.length <= 3) {
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(cleanDesignation);
        }
        return cleanDesignation.includes(kw);
      });

      if (hasMatch) {
        matchedKeywordLevelName = group.levelName;
        break;
      }
    }

    // C. Reconciliation & Confidence Scoring
    let targetLevelName = yoeLevelName;
    let confidenceScore = 0.5;

    if (matchedKeywordLevelName) {
      targetLevelName = matchedKeywordLevelName;
      if (matchedKeywordLevelName === yoeLevelName) {
        // Alignment Bonus
        confidenceScore = 0.5 + 0.25;
      } else {
        // Conflict Penalty
        confidenceScore = 0.5 - 0.15;
      }
    } else {
      // Fallback (no keywords matched)
      targetLevelName = yoeLevelName;
      confidenceScore = 0.4;
    }

    const matchedLevel = normalizedLevels.find(
      (nl) => nl.name.toLowerCase() === targetLevelName.toLowerCase()
    );

    if (!matchedLevel) {
      throw new Error(`Inferred level name "${targetLevelName}" could not be matched with seeded levels.`);
    }

    return {
      normalizedLevelId: matchedLevel.id,
      normalizedLevelName: matchedLevel.name,
      confidenceScore,
      mappingType: 'estimated',
    };
  }
}

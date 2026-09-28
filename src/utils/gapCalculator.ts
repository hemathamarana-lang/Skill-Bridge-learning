import { CareerSkill, GapAnalysisSummary, SkillCategory, SkillGap } from '../types';

export function computeSkillGaps(
  targetSkills: CareerSkill[],
  studentRatings: Record<string, number>
): GapAnalysisSummary {
  let totalWeightedScore = 0;
  let totalMaxWeightedScore = 0;

  const gapsList: SkillGap[] = [];
  const categoryStats: Record<
    SkillCategory,
    { currentSum: number; reqSum: number; count: number }
  > = {
    'Core Technical': { currentSum: 0, reqSum: 0, count: 0 },
    'Tools & Frameworks': { currentSum: 0, reqSum: 0, count: 0 },
    'Architecture & Concepts': { currentSum: 0, reqSum: 0, count: 0 },
    'Professional Skills': { currentSum: 0, reqSum: 0, count: 0 },
  };

  for (const skill of targetSkills) {
    const currentLevel = studentRatings[skill.name] ?? 0;
    const requiredLevel = skill.requiredLevel;
    const gap = Math.max(0, requiredLevel - currentLevel);

    let status: SkillGap['status'];
    if (currentLevel >= requiredLevel + 1) {
      status = 'exceeded';
    } else if (currentLevel >= requiredLevel) {
      status = 'target-met';
    } else if (gap === 1) {
      status = 'minor-gap';
    } else {
      status = 'critical-gap';
    }

    // Weighting based on criticality
    const weight = skill.criticality === 'Critical' ? 3 : skill.criticality === 'High' ? 2 : 1;
    const skillRatio = Math.min(1, currentLevel / requiredLevel);

    totalWeightedScore += skillRatio * weight;
    totalMaxWeightedScore += weight;

    // Estimate hours to close
    const unitHours = skill.estimatedHoursToLearn / Math.max(1, requiredLevel);
    const estimatedHoursToClose = Math.round(gap * unitHours);

    // Track category averages
    const cat = categoryStats[skill.category] || categoryStats['Core Technical'];
    cat.currentSum += currentLevel;
    cat.reqSum += requiredLevel;
    cat.count += 1;

    gapsList.push({
      skillName: skill.name,
      category: skill.category,
      requiredLevel,
      currentLevel,
      gap,
      criticality: skill.criticality,
      status,
      estimatedHoursToClose,
      description: skill.description,
    });
  }

  const matchScore =
    totalMaxWeightedScore > 0
      ? Math.round((totalWeightedScore / totalMaxWeightedScore) * 100)
      : 0;

  const targetMetCount = gapsList.filter((g) => g.status === 'target-met' || g.status === 'exceeded').length;
  const minorGapCount = gapsList.filter((g) => g.status === 'minor-gap').length;
  const criticalGapCount = gapsList.filter((g) => g.status === 'critical-gap').length;
  const totalHoursToCloseGaps = gapsList.reduce((acc, g) => acc + g.estimatedHoursToClose, 0);

  const criticalGapsList = gapsList.filter((g) => g.status === 'critical-gap');

  // Priority tackle list:
  // Sort primarily by criticality weight (Critical -> High -> Recommended),
  // then by gap size descending, then by quick-wins (estimated hours ascending)
  const priorityTackleList = [...gapsList]
    .filter((g) => g.gap > 0)
    .sort((a, b) => {
      const weightA = a.criticality === 'Critical' ? 3 : a.criticality === 'High' ? 2 : 1;
      const weightB = b.criticality === 'Critical' ? 3 : b.criticality === 'High' ? 2 : 1;
      if (weightB !== weightA) return weightB - weightA;
      if (b.gap !== a.gap) return b.gap - a.gap;
      return a.estimatedHoursToClose - b.estimatedHoursToClose;
    });

  const categoryBreakdown: GapAnalysisSummary['categoryBreakdown'] = {
    'Core Technical': {
      currentAvg: categoryStats['Core Technical'].count > 0 ? Number((categoryStats['Core Technical'].currentSum / categoryStats['Core Technical'].count).toFixed(1)) : 0,
      requiredAvg: categoryStats['Core Technical'].count > 0 ? Number((categoryStats['Core Technical'].reqSum / categoryStats['Core Technical'].count).toFixed(1)) : 0,
      matchPct: categoryStats['Core Technical'].reqSum > 0 ? Math.round((categoryStats['Core Technical'].currentSum / categoryStats['Core Technical'].reqSum) * 100) : 0,
    },
    'Tools & Frameworks': {
      currentAvg: categoryStats['Tools & Frameworks'].count > 0 ? Number((categoryStats['Tools & Frameworks'].currentSum / categoryStats['Tools & Frameworks'].count).toFixed(1)) : 0,
      requiredAvg: categoryStats['Tools & Frameworks'].count > 0 ? Number((categoryStats['Tools & Frameworks'].reqSum / categoryStats['Tools & Frameworks'].count).toFixed(1)) : 0,
      matchPct: categoryStats['Tools & Frameworks'].reqSum > 0 ? Math.round((categoryStats['Tools & Frameworks'].currentSum / categoryStats['Tools & Frameworks'].reqSum) * 100) : 0,
    },
    'Architecture & Concepts': {
      currentAvg: categoryStats['Architecture & Concepts'].count > 0 ? Number((categoryStats['Architecture & Concepts'].currentSum / categoryStats['Architecture & Concepts'].count).toFixed(1)) : 0,
      requiredAvg: categoryStats['Architecture & Concepts'].count > 0 ? Number((categoryStats['Architecture & Concepts'].reqSum / categoryStats['Architecture & Concepts'].count).toFixed(1)) : 0,
      matchPct: categoryStats['Architecture & Concepts'].reqSum > 0 ? Math.round((categoryStats['Architecture & Concepts'].currentSum / categoryStats['Architecture & Concepts'].reqSum) * 100) : 0,
    },
    'Professional Skills': {
      currentAvg: categoryStats['Professional Skills'].count > 0 ? Number((categoryStats['Professional Skills'].currentSum / categoryStats['Professional Skills'].count).toFixed(1)) : 0,
      requiredAvg: categoryStats['Professional Skills'].count > 0 ? Number((categoryStats['Professional Skills'].reqSum / categoryStats['Professional Skills'].count).toFixed(1)) : 0,
      matchPct: categoryStats['Professional Skills'].reqSum > 0 ? Math.round((categoryStats['Professional Skills'].currentSum / categoryStats['Professional Skills'].reqSum) * 100) : 0,
    },
  };

  return {
    matchScore,
    totalSkillsCount: targetSkills.length,
    targetMetCount,
    minorGapCount,
    criticalGapCount,
    totalHoursToCloseGaps,
    criticalGapsList,
    priorityTackleList,
    categoryBreakdown,
  };
}

export type SkillCategory =
  | 'Core Technical'
  | 'Tools & Frameworks'
  | 'Architecture & Concepts'
  | 'Professional Skills';

export type SkillCriticality = 'Critical' | 'High' | 'Recommended';

export interface CareerSkill {
  name: string;
  category: SkillCategory;
  requiredLevel: number; // 1 to 5
  criticality: SkillCriticality;
  description: string;
  estimatedHoursToLearn: number;
}

export interface StudentSkill {
  name: string;
  currentLevel: number; // 0 to 5 (0 = No knowledge)
  evidence?: string;
  category?: SkillCategory;
}

export interface CareerProfile {
  id: string;
  title: string;
  category: string;
  summary: string;
  experienceLevel: string;
  averageSalary: string;
  marketDemand: string;
  requiredSkills: CareerSkill[];
  topLearningFocus: string[];
  typicalInterviewFocus: string[];
  isCustom?: boolean;
}

export type GapStatus = 'critical-gap' | 'minor-gap' | 'target-met' | 'exceeded';

export interface SkillGap {
  skillName: string;
  category: SkillCategory;
  requiredLevel: number;
  currentLevel: number;
  gap: number; // requiredLevel - currentLevel (or 0 if current >= required)
  criticality: SkillCriticality;
  status: GapStatus;
  estimatedHoursToClose: number;
  description: string;
}

export interface GapAnalysisSummary {
  matchScore: number; // 0 - 100%
  totalSkillsCount: number;
  targetMetCount: number;
  minorGapCount: number;
  criticalGapCount: number;
  totalHoursToCloseGaps: number;
  criticalGapsList: SkillGap[];
  priorityTackleList: SkillGap[];
  categoryBreakdown: Record<SkillCategory, { currentAvg: number; requiredAvg: number; matchPct: number }>;
}

export interface RecommendedCourse {
  skill: string;
  courseTitle: string;
  url: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  isFree: boolean;
}

export interface LearningPlatform {
  id: string;
  name: string;
  tagline: string;
  costModel: '100% Free' | 'Free / Audit Option' | 'Freemium' | 'Paid Subscription';
  format: 'Interactive Coding' | 'Video Lectures' | 'Guided Projects' | 'Practice & Drills' | 'Official Docs';
  bestFor: string[];
  pros: string[];
  url: string;
  recommendedCourses: RecommendedCourse[];
}

export interface ResourceItem {
  platform: string;
  title: string;
  type: string;
  url?: string;
}

export interface Milestone {
  week: number;
  title: string;
  learningGoals: string[];
  recommendedResources: ResourceItem[];
  practicalTask: string;
  checkpointQuiz: string;
  completed?: boolean;
}

export interface RoadmapPhase {
  phaseNumber: number;
  name: string;
  weekSpan: string;
  focus: string;
  skillsCovered: string[];
  milestones: Milestone[];
}

export interface CapstoneProjectBlueprint {
  title: string;
  description: string;
  keyFeatures: string[];
  technologies: string[];
  githubReadmeTips: string;
}

export interface PersonalizedRoadmap {
  roadmapTitle: string;
  totalEstimatedHours: number;
  weeklyCommitment: string;
  phases: RoadmapPhase[];
  capstoneProject: CapstoneProjectBlueprint;
  careerReadinessChecklist: string[];
  generatedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

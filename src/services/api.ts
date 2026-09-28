import { CareerProfile, PersonalizedRoadmap, SkillGap, StudentSkill } from '../types';
import { CURATED_CAREERS } from '../data/careers';

export async function checkServerHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline', hasGeminiKey: false };
  }
}

export async function analyzeCustomCareer(
  title: string,
  description?: string
): Promise<CareerProfile> {
  try {
    const res = await fetch('/api/career/analyze-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Server error analyzing career');
    }

    const data = await res.json();
    return {
      ...data,
      id: data.id || `custom-${Date.now()}`,
      isCustom: true,
    };
  } catch (error) {
    console.warn('Falling back to local template analysis:', error);
    // Graceful offline fallback
    return generateFallbackCareer(title, description);
  }
}

export async function extractSkillsFromText(
  text: string,
  targetSkills?: string[]
): Promise<{
  studentSummary: string;
  extractedSkills: StudentSkill[];
  notableStrengths: string[];
  encouragement: string;
}> {
  try {
    const res = await fetch('/api/career/extract-skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetSkills }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Server error extracting skills');
    }

    return await res.json();
  } catch (error) {
    console.warn('Falling back to local heuristic skill extraction:', error);
    return extractSkillsLocally(text, targetSkills);
  }
}

export async function generatePersonalizedRoadmap(params: {
  careerTitle: string;
  identifiedGaps: SkillGap[];
  hoursPerWeek: number;
  totalWeeks: number;
  learningPreference: string;
}): Promise<PersonalizedRoadmap> {
  try {
    const res = await fetch('/api/career/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Server error generating roadmap');
    }

    const data = await res.json();
    return {
      ...data,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Falling back to tailored algorithmic roadmap generator:', error);
    return generateFallbackRoadmap(params);
  }
}

export async function sendAdvisorMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  studentContext: {
    targetCareer: string;
    matchScore: number;
    topGaps: string[];
    hoursPerWeek: number;
  }
): Promise<string> {
  try {
    const res = await fetch('/api/career/advisor-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, studentContext }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Advisor response failed');
    }

    const data = await res.json();
    return data.reply;
  } catch (error) {
    console.warn('Fallback advisor response:', error);
    const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    if (lastUserMsg.includes('project') || lastUserMsg.includes('portfolio')) {
      return `To stand out for ${studentContext.targetCareer}, build an end-to-end project addressing your top gaps: ${studentContext.topGaps.slice(0, 2).join(' and ')}. Instead of another to-do list, build a real-time collaborative tool, an automated data pipeline with scheduled refreshes, or an API with role-based access control and automated integration tests. Document your architecture in your GitHub README with diagrams!`;
    }
    if (lastUserMsg.includes('interview') || lastUserMsg.includes('prep')) {
      return `For technical interviews in ${studentContext.targetCareer}, focus 40% on technical problem solving (NeetCode / LeetCode core patterns), 30% on explaining the tradeoffs in projects you built, and 30% on system architecture fundamentals. When asked about ${studentContext.topGaps[0] || 'newer concepts'}, showcase your ability to rapidly learn by highlighting how you closed previous skill gaps!`;
    }
    return `Great question! Given your target of ${studentContext.targetCareer} and an estimated ${studentContext.hoursPerWeek} hours/week study commitment, prioritize closing your critical gaps (${studentContext.topGaps.slice(0, 3).join(', ')}) first using structured interactive platforms like freeCodeCamp, Coursera, or Exercism before jumping into complex frameworks. Would you like a specific project milestone recommendation or resource recommendation for one of these skills?`;
  }
}

// Fallback Generators
function generateFallbackCareer(title: string, description?: string): CareerProfile {
  return {
    id: `custom-${Date.now()}`,
    title: title || 'Custom Specialist',
    category: 'Technology & Engineering',
    summary:
      description ||
      `Specialized practitioner role focused on ${title}, applying industry best practices, modern developer tools, and scalable architecture.`,
    experienceLevel: 'Entry to Associate (0-2 years)',
    averageSalary: '$85,000 - $125,000 USD',
    marketDemand: 'High',
    topLearningFocus: [
      'Core programming paradigms and modular system architecture',
      'Data persistence, API integrations, and developer tooling',
      'Automated testing, continuous deployment, and performance optimization',
    ],
    typicalInterviewFocus: [
      'Applied technical domain problem solving and live debugging',
      'Architectural tradeoffs and project walkthroughs',
      'Behavioral collaboration and engineering principles',
    ],
    requiredSkills: [
      {
        name: `${title} Core Domain Fundamentals`,
        category: 'Core Technical',
        requiredLevel: 4,
        criticality: 'Critical',
        description: `Foundational theory, protocols, and standard conventions of ${title}.`,
        estimatedHoursToLearn: 80,
      },
      {
        name: 'Modern Programming Language Fluency',
        category: 'Core Technical',
        requiredLevel: 4,
        criticality: 'Critical',
        description: 'Deep familiarity with idiomatic language patterns and asynchronous operations.',
        estimatedHoursToLearn: 70,
      },
      {
        name: 'Database Architecture & Data Persistence',
        category: 'Core Technical',
        requiredLevel: 3,
        criticality: 'Critical',
        description: 'Schema design, querying, normalization, and caching strategies.',
        estimatedHoursToLearn: 50,
      },
      {
        name: 'Developer Tooling & Git Version Control',
        category: 'Tools & Frameworks',
        requiredLevel: 3,
        criticality: 'High',
        description: 'Branching strategies, CI/CD integrations, and command-line automation.',
        estimatedHoursToLearn: 30,
      },
      {
        name: 'System Design & Scalability Principles',
        category: 'Architecture & Concepts',
        requiredLevel: 3,
        criticality: 'High',
        description: 'Modularity, caching, error boundaries, rate limiting, and security.',
        estimatedHoursToLearn: 50,
      },
      {
        name: 'Technical Documentation & Communication',
        category: 'Professional Skills',
        requiredLevel: 4,
        criticality: 'High',
        description: 'Clear pull request authoring, API documentation, and cross-team alignment.',
        estimatedHoursToLearn: 25,
      },
    ],
    isCustom: true,
  };
}

function extractSkillsLocally(
  text: string,
  targetSkills?: string[]
): {
  studentSummary: string;
  extractedSkills: StudentSkill[];
  notableStrengths: string[];
  encouragement: string;
} {
  const lower = text.toLowerCase();
  const commonKeywords: Array<{ name: string; triggers: string[]; defaultLevel: number }> = [
    { name: 'TypeScript & JavaScript', triggers: ['javascript', 'typescript', 'js', 'ts', 'es6', 'node'], defaultLevel: 3 },
    { name: 'React & Modern Frontend', triggers: ['react', 'next.js', 'vue', 'redux', 'tailwind', 'frontend', 'html/css', 'dom'], defaultLevel: 3 },
    { name: 'Python (NumPy, Pandas, Scipy)', triggers: ['python', 'pandas', 'numpy', 'scipy', 'jupyter', 'matplotlib'], defaultLevel: 3 },
    { name: 'Backend API Development (Node/Express/Python)', triggers: ['express', 'backend', 'api', 'rest', 'fastapi', 'flask', 'django', 'crud'], defaultLevel: 2 },
    { name: 'Relational Databases & SQL (PostgreSQL)', triggers: ['sql', 'postgres', 'postgresql', 'mysql', 'database', 'sqlite', 'prisma'], defaultLevel: 2 },
    { name: 'Data Structures & Algorithms', triggers: ['algorithms', 'data structures', 'dsa', 'leetcode', 'binary search', 'recursion', 'sorting'], defaultLevel: 3 },
    { name: 'Git & Collaborative Workflow', triggers: ['git', 'github', 'version control', 'commits', 'pr', 'pull request', 'merge'], defaultLevel: 3 },
    { name: 'Docker & Containerization', triggers: ['docker', 'containers', 'dockerfile', 'compose'], defaultLevel: 2 },
    { name: 'Cloud Deployment (AWS/GCP/Vercel)', triggers: ['aws', 'gcp', 'vercel', 'heroku', 'cloud', 's3', 'ec2'], defaultLevel: 2 },
    { name: 'Figma Mastery & Prototyping', triggers: ['figma', 'ui design', 'ux', 'wireframe', 'prototype', 'user research'], defaultLevel: 3 },
    { name: 'Linux Administration & Shell Scripting', triggers: ['linux', 'bash', 'shell', 'terminal', 'unix', 'ubuntu'], defaultLevel: 2 },
    { name: 'Machine Learning (Scikit-Learn)', triggers: ['machine learning', 'scikit-learn', 'classification', 'regression', 'random forest'], defaultLevel: 2 },
    { name: 'Computer Networking & Protocols (TCP/IP, DNS)', triggers: ['networking', 'tcp/ip', 'dns', 'wireshark', 'http', 'packets'], defaultLevel: 2 },
  ];

  const detected: StudentSkill[] = [];
  const strengths: string[] = [];

  for (const item of commonKeywords) {
    const matched = item.triggers.some((trigger) => lower.includes(trigger));
    if (matched) {
      // Look for indicators of proficiency in text
      let level = item.defaultLevel;
      if (lower.includes('expert') || lower.includes('advanced') || lower.includes('built production') || lower.includes('architected')) {
        level = Math.min(5, level + 1);
      } else if (lower.includes('basic') || lower.includes('learning') || lower.includes('introductory') || lower.includes('beginner')) {
        level = Math.max(1, level - 1);
      }
      detected.push({
        name: item.name,
        currentLevel: level,
        evidence: `Mentioned in submitted background text or coursework experience.`,
      });
      if (level >= 3) {
        strengths.push(`${item.name} (Proficiency Level ${level}/5)`);
      }
    }
  }

  // Also verify against target skills
  if (targetSkills) {
    for (const tSkill of targetSkills) {
      if (!detected.some((d) => d.name.toLowerCase() === tSkill.toLowerCase())) {
        if (lower.includes(tSkill.toLowerCase())) {
          detected.push({
            name: tSkill,
            currentLevel: 2,
            evidence: `Found direct match for target skill "${tSkill}" in your profile.`,
          });
        }
      }
    }
  }

  return {
    studentSummary: `Identified ${detected.length} demonstrated technical skills from your background summary.`,
    extractedSkills: detected.length > 0 ? detected : [
      { name: 'TypeScript & JavaScript', currentLevel: 2, evidence: 'General programming foundation' },
      { name: 'Git & Collaborative Workflow', currentLevel: 2, evidence: 'Basic source control familiarity' },
    ],
    notableStrengths: strengths.length > 0 ? strengths : ['Enthusiasm for continuous technical learning'],
    encouragement: 'You already possess transferable core skills that directly map onto your target career roadmap!',
  };
}

function generateFallbackRoadmap(params: {
  careerTitle: string;
  identifiedGaps: SkillGap[];
  hoursPerWeek: number;
  totalWeeks: number;
}): PersonalizedRoadmap {
  const { careerTitle, identifiedGaps, hoursPerWeek, totalWeeks } = params;
  const criticalGaps = identifiedGaps.filter((g) => g.gap > 0).slice(0, 6);

  const phase1Skills = criticalGaps.slice(0, 2).map((g) => g.skillName);
  const phase2Skills = criticalGaps.slice(2, 4).map((g) => g.skillName);
  const phase3Skills = criticalGaps.slice(4, 6).map((g) => g.skillName);

  return {
    roadmapTitle: `${careerTitle} Accelerated Mastery Roadmap`,
    totalEstimatedHours: hoursPerWeek * totalWeeks,
    weeklyCommitment: `${hoursPerWeek} hrs/week`,
    phases: [
      {
        phaseNumber: 1,
        name: 'Phase 1: High-Deficit Fundamentals & Core Syntax',
        weekSpan: `Weeks 1-${Math.max(1, Math.round(totalWeeks * 0.25))}`,
        focus: `Systematically close your largest foundational gaps in ${phase1Skills.join(' & ') || 'core principles'}.`,
        skillsCovered: phase1Skills.length ? phase1Skills : ['Core Architecture', 'Syntax Fundamentals'],
        milestones: [
          {
            week: 1,
            title: `Foundations of ${phase1Skills[0] || 'Core Mechanics'}`,
            learningGoals: [
              'Understand underlying mental models and syntax primitives',
              'Set up reproducible local development environment and tooling',
              'Build 2 small standalone exploratory scripts or components',
            ],
            recommendedResources: [
              {
                platform: 'freeCodeCamp',
                title: 'Interactive Foundations & Drills',
                type: 'Free Interactive',
                url: 'https://www.freecodecamp.org',
              },
              {
                platform: 'Roadmap.sh',
                title: 'Domain Architecture Guide',
                type: 'Documentation',
                url: 'https://roadmap.sh',
              },
            ],
            practicalTask: 'Write and test a clean, documented module implementing core data transformation logic.',
            checkpointQuiz: 'Can you explain the execution lifecycle and error propagation mechanisms without looking at docs?',
          },
          {
            week: 2,
            title: `Deepening ${phase1Skills[1] || phase1Skills[0] || 'API & Data Persistence'}`,
            learningGoals: [
              'Implement asynchronous handling and error boundaries',
              'Connect module with structured data validation',
              'Write initial automated unit tests for edge cases',
            ],
            recommendedResources: [
              {
                platform: 'Exercism',
                title: 'Language Fluency Track & Mentor Review',
                type: 'Coding Exercises',
                url: 'https://exercism.org',
              },
            ],
            practicalTask: 'Build a miniature CLI or UI widget with robust error handling and input validation.',
            checkpointQuiz: 'How does your implementation handle unexpected null values or network timeouts?',
          },
        ],
      },
      {
        phaseNumber: 2,
        name: 'Phase 2: Framework Integration & Modern Tooling',
        weekSpan: `Weeks ${Math.round(totalWeeks * 0.25) + 1}-${Math.round(totalWeeks * 0.55)}`,
        focus: `Transition from isolated syntax to production-grade integrations with ${phase2Skills.join(' & ') || 'industry toolchains'}.`,
        skillsCovered: phase2Skills.length ? phase2Skills : ['Database Modeling', 'REST/GraphQL APIs'],
        milestones: [
          {
            week: Math.round(totalWeeks * 0.25) + 1,
            title: 'Modern Architecture & Pipeline Wiring',
            learningGoals: [
              'Design normalized schemas and entity relationships',
              'Implement secure authentication and token validation',
              'Containerize service with multi-stage Docker builds',
            ],
            recommendedResources: [
              {
                platform: 'The Odin Project',
                title: 'Full Stack Integration Module',
                type: 'Guided Projects',
                url: 'https://www.theodinproject.com',
              },
            ],
            practicalTask: 'Construct a full CRUD service backed by persistent storage with automated migrations.',
            checkpointQuiz: 'What indexing strategy would you use when database reads grow 100x faster than writes?',
          },
        ],
      },
      {
        phaseNumber: 3,
        name: 'Phase 3: Production Portfolio Capstone Project',
        weekSpan: `Weeks ${Math.round(totalWeeks * 0.55) + 1}-${Math.round(totalWeeks * 0.85)}`,
        focus: 'Unify all acquired skills into a showcase portfolio project that directly proves hiring readiness.',
        skillsCovered: phase3Skills.length ? phase3Skills : ['System Integration', 'Performance Optimization'],
        milestones: [
          {
            week: Math.round(totalWeeks * 0.55) + 1,
            title: 'Capstone Architecture & Core MVP Release',
            learningGoals: [
              'Author comprehensive system architecture diagram and specification',
              'Establish continuous integration test runner on GitHub Actions',
              'Ship end-to-end user flow with responsive UI and verified backend APIs',
            ],
            recommendedResources: [
              {
                platform: 'GitHub Skills',
                title: 'Continuous Integration & Release Workflows',
                type: 'Interactive',
                url: 'https://skills.github.com',
              },
            ],
            practicalTask: 'Deploy live production MVP with custom domain, SSL, and error logging telemetry.',
            checkpointQuiz: 'How do you ensure zero sensitive environment variables or secrets ever leak to clients?',
          },
        ],
      },
      {
        phaseNumber: 4,
        name: 'Phase 4: Interview Readiness & Technical Storytelling',
        weekSpan: `Weeks ${Math.round(totalWeeks * 0.85) + 1}-${totalWeeks}`,
        focus: 'Drill technical coding patterns, system design trade-off explanations, and resume articulation.',
        skillsCovered: ['Technical Communication', 'Problem Solving', 'System Design'],
        milestones: [
          {
            week: totalWeeks,
            title: 'Mock Technical Loops & Portfolio Polish',
            learningGoals: [
              'Complete 15-20 core algorithmic problem patterns (Two Pointers, Hash Maps, BFS)',
              'Prepare 3 deep-dive engineering stories highlighting tradeoffs and troubleshooting',
              'Conduct mock behavioral and technical walkthrough with peer or mentor',
            ],
            recommendedResources: [
              {
                platform: 'NeetCode.io',
                title: 'Core Interview Patterns & Visual Intuition',
                type: 'Practice & Drills',
                url: 'https://neetcode.io',
              },
            ],
            practicalTask: 'Polish GitHub repository README with interactive demo link, architecture diagram, and benchmark metrics.',
            checkpointQuiz: 'Can you succinctly defend why you chose your specific database and framework over the main alternative?',
          },
        ],
      },
    ],
    capstoneProject: {
      title: `${careerTitle} Production Showcase Platform`,
      description: `A fully deployed, resilient application demonstrating all required industry skills for ${careerTitle}. Solves a real problem with live traffic, authentication, caching, and database persistence.`,
      keyFeatures: [
        'Secure user authentication with session management and role-based permissions',
        'Optimized data queries with database indexing and query caching',
        'Resilient client state handling with optimistic UI updates and error boundaries',
        'Automated CI/CD pipeline running linting, formatting, and unit tests on every pull request',
      ],
      technologies: [
        'TypeScript',
        'React / Next.js',
        'PostgreSQL',
        'Docker',
        'GitHub Actions',
      ],
      githubReadmeTips: 'Include an architectural flowchart (Mermaid.js), live deployed demo link, sample API payloads, and a section on "Engineering Tradeoffs & What I Would Do Differently at Scale".',
    },
    careerReadinessChecklist: [
      'Comprehensive GitHub profile with pinned capstone showing clean git commit history',
      'Target career resume tailored to the 8+ key skills identified in this gap analysis',
      'Comfortable solving medium technical coding questions without searching for solutions',
      'Clear 2-minute elevator pitch explaining architectural decisions in your portfolio project',
      'Active presence on professional networks (LinkedIn/GitHub) connecting with practitioners',
    ],
  };
}

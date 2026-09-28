import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with user-agent header as per guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

// Endpoint 1: Analyze custom target career or job description
app.post('/api/career/analyze-custom', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in the environment.',
      });
    }

    const prompt = `You are an expert tech career counselor and industry skills analyst.
Analyze the target career or job posting provided below and extract the standard, current industry skill requirements.

Target Career / Job Posting:
Title: ${title || 'Target Role'}
Description / Details: ${description || 'Standard industry role'}

Return a strictly valid JSON object with the following structure:
{
  "id": "slug-id",
  "title": "Clean Role Title",
  "category": "e.g., Software Engineering, Data & AI, Cloud & Infrastructure, Design, Cybersecurity",
  "summary": "2-3 sentence overview of this role, its daily work and impact.",
  "experienceLevel": "Entry-Level / Junior (0-2 years)",
  "averageSalary": "$85,000 - $125,000 USD",
  "marketDemand": "High / Growing / Emerging",
  "requiredSkills": [
    {
      "name": "Skill Name (e.g., TypeScript, Docker, SQL, System Design)",
      "category": "Core Technical" | "Tools & Frameworks" | "Architecture & Concepts" | "Professional Skills",
      "requiredLevel": 1-5 (where 1=Familiarity, 2=Elementary, 3=Working Competence, 4=Advanced, 5=Mastery),
      "criticality": "Critical" | "High" | "Recommended",
      "description": "Why this skill is needed for this role",
      "estimatedHoursToLearn": number (e.g. 40, 80, 120)
    }
  ],
  "topLearningFocus": [
    "Key area 1 students should focus on",
    "Key area 2",
    "Key area 3"
  ],
  "typicalInterviewFocus": [
    "e.g., Coding challenges on data structures and algorithms",
    "e.g., System architecture & API design discussion",
    "e.g., Behavioral and project walkthrough"
  ]
}

Ensure you provide 8 to 14 realistic, distinct skills covering technical languages, frameworks, developer tools, and fundamental concepts. Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing career:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze career requirements',
    });
  }
});

// Endpoint 2: Extract student skills from resume / coursework / portfolio text
app.post('/api/career/extract-skills', async (req, res) => {
  try {
    const { text, targetSkills } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in the environment.',
      });
    }

    const prompt = `You are an expert technical recruiter and resume evaluator.
Read the following student background text (which may be a resume snippet, list of college courses, GitHub project descriptions, or self-narrative):

"""
${text}
"""

Target skills being compared (if any):
${JSON.stringify(targetSkills || [])}

Extract all demonstrated technical and professional skills, and assign a realistic self-assessment level from 1 to 5:
- Level 1 (Familiar): Read about it, basic syntax, used in 1 simple tutorial
- Level 2 (Elementary): Built small academic exercise or minor script
- Level 3 (Working Competence): Built functional projects, comfortable with core features, used APIs/databases
- Level 4 (Advanced): Built production-grade apps, debugs complex issues, understands internals & optimization
- Level 5 (Expert): Deep specialized mastery, architectural authority, mentor level

Return a strictly valid JSON object:
{
  "studentSummary": "1-2 sentence assessment of the student's current technical background",
  "extractedSkills": [
    {
      "name": "Skill Name (standardized casing, e.g. 'React', 'Python', 'PostgreSQL')",
      "currentLevel": 1 to 5,
      "evidence": "Brief justification from the text, e.g. 'Completed CS106B and built pathfinding visualizer'",
      "category": "Core Technical" | "Tools & Frameworks" | "Architecture & Concepts" | "Professional Skills"
    }
  ],
  "notableStrengths": ["Strength 1", "Strength 2"],
  "encouragement": "Encouraging 1-sentence note for the student"
}

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error extracting skills:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract skills',
    });
  }
});

// Endpoint 3: Generate personalized learning roadmap
app.post('/api/career/generate-roadmap', async (req, res) => {
  try {
    const {
      careerTitle,
      identifiedGaps,
      hoursPerWeek = 10,
      totalWeeks = 12,
      learningPreference = 'hands-on-projects',
    } = req.body;

    if (!careerTitle || !identifiedGaps || !Array.isArray(identifiedGaps)) {
      return res.status(400).json({ error: 'Missing career title or skill gaps' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in the environment.',
      });
    }

    const prompt = `You are a curriculum architect and career transition mentor.
Design an actionable, phased, week-by-week learning roadmap for a student aiming for the role of "${careerTitle}".

Student Context:
- Available study time: ${hoursPerWeek} hours/week
- Target timeframe: ${totalWeeks} weeks total
- Learning style preference: ${learningPreference} (e.g. project-based, video-guided, interactive coding, documentation-first)
- Identified skill gaps:
${JSON.stringify(identifiedGaps, null, 2)}

Create a highly structured roadmap with 4 logical chronological phases:
Phase 1: High-Deficit Core Foundations & Syntax Mastery (Weeks 1 to Math.round(totalWeeks*0.25))
Phase 2: Frameworks, Tooling & Real-World Application (Weeks Math.round(totalWeeks*0.25)+1 to Math.round(totalWeeks*0.55))
Phase 3: Comprehensive Portfolio Capstone Project (Weeks Math.round(totalWeeks*0.55)+1 to Math.round(totalWeeks*0.85))
Phase 4: Interview Readiness, System Design & Technical Storytelling (Weeks Math.round(totalWeeks*0.85)+1 to ${totalWeeks})

For each phase, specify:
- Phase Title and Duration (e.g. "Weeks 1-3: Modern TypeScript & Asynchronous Architecture")
- Objective
- Target skills addressed
- Weekly breakdown with specific tangible milestones
- Recommended platforms / resources (name reputable platforms like freeCodeCamp, Coursera, NeetCode, Odin Project, official documentation, GitHub) with resource URLs or platform names
- Mini-project or practical assignment with acceptance criteria
- Weekly checkpoint questions to test understanding

Also provide a Capstone Project Specification tailored to this target career that will impress hiring managers.

Return a strictly valid JSON object matching:
{
  "roadmapTitle": "Tailored Roadmap Title",
  "totalEstimatedHours": number,
  "weeklyCommitment": "${hoursPerWeek} hrs/week",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "Phase Name",
      "weekSpan": "Weeks 1-3",
      "focus": "Core focus description",
      "skillsCovered": ["Skill A", "Skill B"],
      "milestones": [
        {
          "week": 1,
          "title": "Milestone title",
          "learningGoals": ["Goal 1", "Goal 2"],
          "recommendedResources": [
            {
              "platform": "Platform Name (e.g. freeCodeCamp)",
              "title": "Course/Tutorial Name",
              "type": "Free Interactive" | "Video Course" | "Documentation" | "Practice Problems",
              "url": "https://..."
            }
          ],
          "practicalTask": "Concrete deliverable",
          "checkpointQuiz": "Key conceptual question to test self-readiness"
        }
      ]
    }
  ],
  "capstoneProject": {
    "title": "Impressive Capstone Project Title",
    "description": "Comprehensive description of a portfolio-worthy project that proves target skills",
    "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "technologies": ["Tech 1", "Tech 2", "Tech 3"],
    "githubReadmeTips": "Advice on how to document this project for recruiters"
  },
  "careerReadinessChecklist": [
    "Item 1", "Item 2", "Item 3", "Item 4", "Item 5"
  ]
}

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate roadmap',
    });
  }
});

// Endpoint 4: AI Career Advisor Chat
app.post('/api/career/advisor-chat', async (req, res) => {
  try {
    const { messages, studentContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in the environment.',
      });
    }

    const conversationHistory = messages.map((m: any) => `${m.role === 'user' ? 'Student' : 'Career Advisor'}: ${m.content}`).join('\n\n');

    const prompt = `You are a supportive, knowledgeable, and pragmatic Technical Career Advisor & Learning Coach for college students and career changers.
The student is using SkillBridge to prepare for a career in tech.

Current Student Profile Context:
- Target Career: ${studentContext?.targetCareer || 'Software Development'}
- Current Readiness Score: ${studentContext?.matchScore || 'In progress'}%
- Major Skill Gaps: ${JSON.stringify(studentContext?.topGaps || [])}
- Hours available per week: ${studentContext?.hoursPerWeek || 10} hours

Conversation:
${conversationHistory}

Advisor Guidelines:
- Give concrete, pragmatic advice without fluff or generic buzzwords.
- Mention reputable learning platforms (Coursera, freeCodeCamp, edX, LeetCode, GitHub, documentation).
- Suggest realistic portfolio project ideas that stand out from tutorial clones.
- Explain technical concepts simply if asked.
- Keep the response structured, clear, and encouraging. Maximum 3-4 concise paragraphs or bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in advisor chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to get advisor response',
    });
  }
});

// Mount Vite or static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CareerExplorer } from './components/CareerExplorer';
import { SkillAssessment } from './components/SkillAssessment';
import { GapAnalysisView } from './components/GapAnalysisView';
import { PlatformAdvisor } from './components/PlatformAdvisor';
import { RoadmapView } from './components/RoadmapView';
import { CareerAdvisor } from './components/CareerAdvisor';
import { CURATED_CAREERS } from './data/careers';
import { STUDENT_PRESETS } from './data/studentPresets';
import { CareerProfile, PersonalizedRoadmap, StudentSkill } from './types';
import { computeSkillGaps } from './utils/gapCalculator';
import { checkServerHealth, generatePersonalizedRoadmap } from './services/api';

const STORAGE_KEYS = {
  CAREER_ID: 'sb_career_id',
  CUSTOM_CAREERS: 'sb_custom_careers',
  RATINGS: 'sb_student_ratings',
  CUSTOM_SKILLS: 'sb_custom_skills',
  HOURS: 'sb_hours_per_week',
  ROADMAP: 'sb_roadmap',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'careers' | 'assessment' | 'gaps' | 'platforms' | 'roadmap' | 'advisor'
  >('careers');

  const [customCareers, setCustomCareers] = useState<CareerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CAREERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allCareers = useMemo(() => {
    return [...CURATED_CAREERS, ...customCareers];
  }, [customCareers]);

  const [selectedCareerId, setSelectedCareerId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CAREER_ID) || CURATED_CAREERS[0].id;
    } catch {
      return CURATED_CAREERS[0].id;
    }
  });

  const selectedCareer = useMemo(() => {
    return allCareers.find((c) => c.id === selectedCareerId) || CURATED_CAREERS[0];
  }, [allCareers, selectedCareerId]);

  // Student ratings: seed with a realistic student profile initially so the gap analysis and roadmap are immediately active!
  const [studentRatings, setStudentRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATINGS);
      if (saved) return JSON.parse(saved);
      return { ...STUDENT_PRESETS[0].skills };
    } catch {
      return { ...STUDENT_PRESETS[0].skills };
    }
  });

  const [customSkills, setCustomSkills] = useState<StudentSkill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_SKILLS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hoursPerWeek, setHoursPerWeek] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOURS);
      return saved ? Number(saved) : 12;
    } catch {
      return 12;
    }
  });

  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROADMAP);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [platformInitialSkill, setPlatformInitialSkill] = useState<string>('all');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  // Check backend Gemini readiness
  useEffect(() => {
    checkServerHealth().then((health) => {
      setHasGeminiKey(health.hasGeminiKey);
    });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAREER_ID, selectedCareerId);
    } catch {}
  }, [selectedCareerId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CAREERS, JSON.stringify(customCareers));
    } catch {}
  }, [customCareers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(studentRatings));
    } catch {}
  }, [studentRatings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SKILLS, JSON.stringify(customSkills));
    } catch {}
  }, [customSkills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOURS, String(hoursPerWeek));
    } catch {}
  }, [hoursPerWeek]);

  useEffect(() => {
    if (roadmap) {
      try {
        localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(roadmap));
      } catch {}
    }
  }, [roadmap]);

  // Compute skill gap analysis reactively
  const gapSummary = useMemo(() => {
    return computeSkillGaps(selectedCareer.requiredSkills, studentRatings);
  }, [selectedCareer, studentRatings]);

  // Auto-initialize a default roadmap if none exists
  useEffect(() => {
    if (!roadmap && gapSummary.priorityTackleList.length > 0) {
      generatePersonalizedRoadmap({
        careerTitle: selectedCareer.title,
        identifiedGaps: gapSummary.priorityTackleList,
        hoursPerWeek,
        totalWeeks: 12,
        learningPreference: 'hands-on-projects',
      }).then((newRoadmap) => {
        setRoadmap(newRoadmap);
      });
    }
  }, [selectedCareer.id]);

  const handleUpdateRating = (skillName: string, level: number) => {
    setStudentRatings((prev) => ({
      ...prev,
      [skillName]: level,
    }));
  };

  const handleSetAllRatings = (ratings: Record<string, number>) => {
    setStudentRatings(ratings);
  };

  const handleAddCustomSkill = (skill: StudentSkill) => {
    setCustomSkills((prev) => {
      const exists = prev.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
      if (exists) return prev;
      return [...prev, skill];
    });
    handleUpdateRating(skill.name, skill.currentLevel);
  };

  const handleRemoveCustomSkill = (skillName: string) => {
    setCustomSkills((prev) => prev.filter((s) => s.name !== skillName));
    setStudentRatings((prev) => {
      const next = { ...prev };
      delete next[skillName];
      return next;
    });
  };

  const handleAddCustomCareer = (newCareer: CareerProfile) => {
    setCustomCareers((prev) => [newCareer, ...prev]);
    setSelectedCareerId(newCareer.id);
  };

  const handleReset = () => {
    if (window.confirm('Reset all ratings and target career back to initial state?')) {
      localStorage.clear();
      setStudentRatings({ ...STUDENT_PRESETS[0].skills });
      setSelectedCareerId(CURATED_CAREERS[0].id);
      setCustomSkills([]);
      setRoadmap(null);
      setActiveTab('careers');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCareer={selectedCareer}
        matchScore={gapSummary.matchScore}
        onReset={handleReset}
        onPrint={handlePrint}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'careers' && (
          <CareerExplorer
            careers={allCareers}
            selectedCareer={selectedCareer}
            onSelectCareer={(career) => {
              setSelectedCareerId(career.id);
            }}
            onAddCustomCareer={handleAddCustomCareer}
            onProceedToAssessment={() => setActiveTab('assessment')}
          />
        )}

        {activeTab === 'assessment' && (
          <SkillAssessment
            selectedCareer={selectedCareer}
            studentRatings={studentRatings}
            onUpdateRating={handleUpdateRating}
            onSetAllRatings={handleSetAllRatings}
            customSkills={customSkills}
            onAddCustomSkill={handleAddCustomSkill}
            onRemoveCustomSkill={handleRemoveCustomSkill}
            onProceedToGaps={() => setActiveTab('gaps')}
            matchScore={gapSummary.matchScore}
          />
        )}

        {activeTab === 'gaps' && (
          <GapAnalysisView
            selectedCareer={selectedCareer}
            gapSummary={gapSummary}
            onProceedToPlatforms={(skillName) => {
              setPlatformInitialSkill(skillName || 'all');
              setActiveTab('platforms');
            }}
            onProceedToRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {activeTab === 'platforms' && (
          <PlatformAdvisor
            selectedCareer={selectedCareer}
            priorityGaps={gapSummary.priorityTackleList}
            initialSkillFilter={platformInitialSkill}
            onProceedToRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            selectedCareer={selectedCareer}
            priorityGaps={gapSummary.priorityTackleList}
            roadmap={roadmap}
            onUpdateRoadmap={(r) => setRoadmap(r)}
            hoursPerWeek={hoursPerWeek}
            setHoursPerWeek={setHoursPerWeek}
            onPrint={handlePrint}
          />
        )}

        {activeTab === 'advisor' && (
          <CareerAdvisor
            selectedCareer={selectedCareer}
            matchScore={gapSummary.matchScore}
            priorityGaps={gapSummary.priorityTackleList}
            hoursPerWeek={hoursPerWeek}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">SkillBridge</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Career Skills Analysis & Adaptive Learning Roadmap Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('careers')}
              className="hover:text-slate-800 transition-colors"
            >
              Careers
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('platforms')}
              className="hover:text-slate-800 transition-colors"
            >
              Platforms
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('advisor')}
              className="hover:text-slate-800 transition-colors"
            >
              AI Mentor
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

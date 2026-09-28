import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  CheckCircle,
  Filter,
  DollarSign,
  Monitor,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CareerProfile, LearningPlatform, SkillGap } from '../types';
import { LEARNING_PLATFORMS } from '../data/platforms';

interface PlatformAdvisorProps {
  selectedCareer: CareerProfile;
  priorityGaps: SkillGap[];
  initialSkillFilter?: string;
  onProceedToRoadmap: () => void;
}

export const PlatformAdvisor: React.FC<PlatformAdvisorProps> = ({
  selectedCareer,
  priorityGaps,
  initialSkillFilter = 'all',
  onProceedToRoadmap,
}) => {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>(initialSkillFilter);
  const [costFilter, setCostFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const platforms = LEARNING_PLATFORMS;

  // Filter logic
  const filteredPlatforms = platforms.filter((p) => {
    // Cost filter
    const matchesCost =
      costFilter === 'all' ||
      (costFilter === 'free' && (p.costModel === '100% Free' || p.costModel === 'Free / Audit Option')) ||
      p.costModel === costFilter;

    // Format filter
    const matchesFormat = formatFilter === 'all' || p.format === formatFilter;

    // Skill filter
    let matchesSkill = true;
    if (selectedSkillFilter !== 'all') {
      matchesSkill = p.recommendedCourses.some(
        (c) => c.skill.toLowerCase() === selectedSkillFilter.toLowerCase()
      ) || p.bestFor.some((b) => b.toLowerCase().includes(selectedSkillFilter.toLowerCase()));
    }

    return matchesCost && matchesFormat && matchesSkill;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Introduction */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
            <span>Step 4 of 5</span>
            <span aria-hidden="true">·</span>
            <span>Curated Learning Platforms & Courses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Advice on Verified Platforms to Learn Missing Skills
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Avoid tutorial paralysis. Below are curated, high-reputation educational platforms
            categorized by learning format, cost model, and recommended courses mapped to your target career gaps.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          {/* Skill Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter by Skill:</span>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Skills ({selectedCareer.requiredSkills.length})</option>
              {priorityGaps.map((g) => (
                <option key={g.skillName} value={g.skillName}>
                  ⚠️ {g.skillName} (Deficit: -{g.gap})
                </option>
              ))}
              {selectedCareer.requiredSkills
                .filter((s) => !priorityGaps.some((p) => p.skillName === s.name))
                .map((s) => (
                  <option key={s.name} value={s.name}>
                    ✓ {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Cost Filter */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="all">All Pricing</option>
              <option value="free">100% Free / Free Audit Only</option>
              <option value="100% Free">100% Free Forever</option>
              <option value="Freemium">Freemium</option>
            </select>

            {/* Format Filter */}
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="all">All Formats</option>
              <option value="Interactive Coding">Interactive Coding Sandbox</option>
              <option value="Guided Projects">Guided Real-World Projects</option>
              <option value="Video Lectures">Video Lectures</option>
              <option value="Practice & Drills">Practice & Interview Drills</option>
              <option value="Official Docs">Official Architecture Docs</option>
            </select>

            {(selectedSkillFilter !== 'all' || costFilter !== 'all' || formatFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedSkillFilter('all');
                  setCostFilter('all');
                  setFormatFilter('all');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Gap Shortcuts */}
      {priorityGaps.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-amber-900 mb-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Quick-filter by your detected critical skill gaps:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {priorityGaps.slice(0, 5).map((gap) => (
              <button
                key={gap.skillName}
                onClick={() => setSelectedSkillFilter(gap.skillName)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedSkillFilter.toLowerCase() === gap.skillName.toLowerCase()
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span>{gap.skillName}</span>
                <span className="text-[10px] opacity-80">(-{gap.gap})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Learning Platforms Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlatforms.map((platform) => (
          <div
            key={platform.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">{platform.format}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-medium ${
                        platform.costModel === '100% Free'
                          ? 'text-emerald-700'
                          : platform.costModel === 'Free / Audit Option'
                          ? 'text-teal-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {platform.costModel}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{platform.name}</h3>
                </div>

                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Visit Platform</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {platform.tagline}
              </p>

              {/* Best For Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {platform.bestFor.map((item) => (
                  <span
                    key={item}
                    className="text-[11px] bg-slate-50 border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Pros */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Platform Strengths:
                </span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {platform.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Courses for this platform */}
              {platform.recommendedCourses.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-800 block mb-2">
                    Recommended Course Tracks:
                  </span>
                  <div className="space-y-2">
                    {platform.recommendedCourses.map((c, i) => (
                      <a
                        key={i}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 transition-colors group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900">
                            {c.courseTitle}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span className="text-indigo-600 font-medium">{c.skill}</span>
                          <span aria-hidden="true">·</span>
                          <span>{c.level}</span>
                          <span aria-hidden="true">·</span>
                          <span className={c.isFree ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                            {c.isFree ? 'Free Access' : 'Paid / Freemium'}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{platform.recommendedCourses.length} Curated Courses listed</span>
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Go to {platform.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredPlatforms.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No platforms match your active filters.</p>
          <button
            onClick={() => {
              setSelectedSkillFilter('all');
              setCostFilter('all');
              setFormatFilter('all');
            }}
            className="mt-3 text-xs text-indigo-600 underline font-medium cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Student Strategy Playbook */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strategic Learning Playbook</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          The 3 Golden Rules to Master Tech Skills Efficiently
        </h3>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="font-bold text-white text-sm mb-1">1. The 1:1 Build Ratio</div>
            <p className="text-indigo-200/90 leading-relaxed text-xs">
              For every 1 hour spent watching tutorial videos, spend at least 1 hour writing your own code from scratch with the video paused. Never just copy and paste code without typing it out and breaking it intentionally.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="font-bold text-white text-sm mb-1">2. Audit University Depth</div>
            <p className="text-indigo-200/90 leading-relaxed text-xs">
              Platforms like Coursera and edX allow you to audit courses from Stanford, MIT, and Google for $0. You receive 100% of the video material, quizzes, and lecture slides without paying for the certificate.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="font-bold text-white text-sm mb-1">3. Document Publicly on GitHub</div>
            <p className="text-indigo-200/90 leading-relaxed text-xs">
              Recruiters care 10x more about active GitHub repositories with thoughtful README architecture breakdowns than completion badges. Push code daily to build tangible proof of your learning velocity.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-indigo-300">
            Ready to convert these platforms into a customized weekly schedule?
          </span>
          <button
            onClick={onProceedToRoadmap}
            className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Proceed to Step 5: Personalized Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

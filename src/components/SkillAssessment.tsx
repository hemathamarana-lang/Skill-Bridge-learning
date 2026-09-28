import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  UserCheck,
  Plus,
  Trash2,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { CareerProfile, SkillCategory, StudentSkill } from '../types';
import { STUDENT_PRESETS, StudentPreset } from '../data/studentPresets';
import { extractSkillsFromText } from '../services/api';

interface SkillAssessmentProps {
  selectedCareer: CareerProfile;
  studentRatings: Record<string, number>;
  onUpdateRating: (skillName: string, level: number) => void;
  onSetAllRatings: (ratings: Record<string, number>) => void;
  customSkills: StudentSkill[];
  onAddCustomSkill: (skill: StudentSkill) => void;
  onRemoveCustomSkill: (skillName: string) => void;
  onProceedToGaps: () => void;
  matchScore: number;
}

const PROFICIENCY_LEVELS = [
  { level: 0, label: '0: None', desc: 'No prior exposure or knowledge.' },
  { level: 1, label: '1: Beginner', desc: 'Theoretical awareness or basic syntax. Followed 1 simple tutorial.' },
  { level: 2, label: '2: Elementary', desc: 'Can build small scripts or academic homework exercises with guidance.' },
  { level: 3, label: '3: Competent', desc: 'Can build independent functional applications, use APIs, and debug standard issues.' },
  { level: 4, label: '4: Advanced', desc: 'Production experience, understands architecture, internals, testing, and optimization.' },
  { level: 5, label: '5: Expert', desc: 'Deep architectural mastery, mentor-level, design tradeoffs authority.' },
];

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  selectedCareer,
  studentRatings,
  onUpdateRating,
  onSetAllRatings,
  customSkills,
  onAddCustomSkill,
  onRemoveCustomSkill,
  onProceedToGaps,
  matchScore,
}) => {
  const [resumeText, setResumeText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{
    summary?: string;
    strengths?: string[];
    encouragement?: string;
  } | null>(null);
  const [showExtractor, setShowExtractor] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Core Technical');
  const [newSkillLevel, setNewSkillLevel] = useState(2);

  const categories: string[] = [
    'All',
    'Core Technical',
    'Tools & Frameworks',
    'Architecture & Concepts',
    'Professional Skills',
  ];

  const handleApplyPreset = (preset: StudentPreset) => {
    onSetAllRatings({ ...preset.skills });
    setResumeText(preset.narrativeText);
  };

  const handleClearRatings = () => {
    onSetAllRatings({});
    setExtractionResult(null);
  };

  const handleExtractWithAI = async () => {
    if (!resumeText.trim()) return;
    setIsExtracting(true);
    try {
      const targetSkillNames = selectedCareer.requiredSkills.map((s) => s.name);
      const res = await extractSkillsFromText(resumeText, targetSkillNames);

      const newRatings: Record<string, number> = { ...studentRatings };
      res.extractedSkills.forEach((s) => {
        newRatings[s.name] = s.currentLevel;
      });
      onSetAllRatings(newRatings);

      setExtractionResult({
        summary: res.studentSummary,
        strengths: res.notableStrengths,
        encouragement: res.encouragement,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    onAddCustomSkill({
      name: newSkillName.trim(),
      currentLevel: newSkillLevel,
      category: newSkillCategory,
    });
    onUpdateRating(newSkillName.trim(), newSkillLevel);
    setNewSkillName('');
    setNewSkillLevel(2);
  };

  const filteredRequiredSkills = selectedCareer.requiredSkills.filter(
    (s) => activeCategoryFilter === 'All' || s.category === activeCategoryFilter
  );

  const ratedCount = selectedCareer.requiredSkills.filter(
    (s) => (studentRatings[s.name] ?? 0) > 0
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Step Introduction */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
              <span>Step 2 of 5</span>
              <span aria-hidden="true">·</span>
              <span>Self-Assessment & Experience Input</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Rate Your Current Skills for {selectedCareer.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Rate your current capability honestly on a 0 to 5 scale. You can load a realistic student profile,
              paste your resume/coursework for AI extraction, or adjust each skill manually.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center min-w-[180px]">
            <span className="text-xs text-slate-500 font-medium block">Assessment Progress</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {ratedCount} / {selectedCareer.requiredSkills.length}
            </span>
            <span className="text-xs text-indigo-600 font-semibold block mt-0.5">
              Estimated Readiness: {matchScore}%
            </span>
          </div>
        </div>

        {/* Preset Student Profile Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>Quick Test with Student Presets:</span>
            </span>
            <button
              onClick={handleClearRatings}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer self-start sm:self-auto"
            >
              Reset all to zero
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STUDENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 transition-all text-xs cursor-pointer group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-900 flex items-center justify-between">
                  <span>{preset.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {preset.avatarRole}
                  </span>
                </div>
                <p className="text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {preset.backgroundDescription}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* AI Skill Extraction Trigger */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setShowExtractor(!showExtractor)}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>
              {showExtractor ? 'Hide Resume / Syllabus Text Extractor' : 'Or: Paste Resume / Coursework to Extract Skills with AI'}
            </span>
          </button>

          {showExtractor && (
            <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-start gap-2 text-xs text-indigo-950">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Paste your resume text, GitHub project descriptions, or completed college course titles.
                  Gemini will analyze your background and populate your skill ratings automatically.
                </span>
              </div>

              <textarea
                rows={5}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Example: '2nd year CS major. Completed Java Data Structures, Web Development with React and Node. Built a weather app with Tailwind CSS and deployed on Vercel. Basic Git usage. Looking for internships.'"
                className="w-full text-xs sm:text-sm p-3 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {resumeText.length > 0 ? `${resumeText.length} characters` : 'No text entered'}
                </span>
                <button
                  onClick={handleExtractWithAI}
                  disabled={isExtracting || !resumeText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Skills...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract & Rate Skills with AI</span>
                    </>
                  )}
                </button>
              </div>

              {extractionResult && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200 text-xs space-y-2">
                  <div className="font-semibold text-indigo-900">AI Background Evaluation:</div>
                  <p className="text-slate-700">{extractionResult.summary}</p>
                  {extractionResult.strengths && extractionResult.strengths.length > 0 && (
                    <div>
                      <span className="font-medium text-slate-800">Detected Strengths: </span>
                      <span className="text-slate-600">{extractionResult.strengths.join(' · ')}</span>
                    </div>
                  )}
                  {extractionResult.encouragement && (
                    <p className="text-emerald-700 font-medium italic">{extractionResult.encouragement}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter and Level Guide */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Filter Skills:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>Scale: 0 (None) → 3 (Working Competence) → 5 (Expert Mastery)</span>
        </div>
      </div>

      {/* Skills Assessment Grid */}
      <div className="space-y-4">
        {filteredRequiredSkills.map((skill) => {
          const currentLevel = studentRatings[skill.name] ?? 0;
          const requiredLevel = skill.requiredLevel;
          const gap = Math.max(0, requiredLevel - currentLevel);

          let statusColor = 'text-slate-600';
          let statusText = 'Not Rated';
          if (currentLevel >= requiredLevel + 1) {
            statusColor = 'text-emerald-600 font-semibold';
            statusText = 'Exceeds Target (+1)';
          } else if (currentLevel >= requiredLevel) {
            statusColor = 'text-emerald-700 font-medium';
            statusText = 'Target Met';
          } else if (gap === 1) {
            statusColor = 'text-amber-600 font-medium';
            statusText = 'Minor Gap (-1 level)';
          } else if (gap >= 2) {
            statusColor = 'text-rose-600 font-semibold';
            statusText = `Critical Gap (-${gap} levels)`;
          }

          return (
            <div
              key={skill.name}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Skill metadata */}
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{skill.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        skill.criticality === 'Critical'
                          ? 'text-rose-600'
                          : skill.criticality === 'High'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {skill.criticality} Priority
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Target: Lvl {requiredLevel}/5</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{skill.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                {/* Right: Interactive 0-5 Level Buttons */}
                <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {PROFICIENCY_LEVELS.map(({ level, label, desc }) => {
                      const isSelected = currentLevel === level;
                      const isRequired = level === requiredLevel;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => onUpdateRating(skill.name, level)}
                          title={`${label}: ${desc}`}
                          className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{level}</span>
                          {isRequired && (
                            <span
                              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                                isSelected ? 'bg-emerald-400' : 'bg-indigo-500'
                              }`}
                              title="Target Benchmark Level"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Level explanation feedback */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Your Level: {currentLevel}/5</span>
                    <span aria-hidden="true">·</span>
                    <span className={statusColor}>{statusText}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Student Skills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Add Custom Skills or Additional Tooling
        </h3>
        <p className="text-xs text-slate-600 mb-4">
          Do you have experience in other languages or frameworks (e.g. C++, Go, Flutter, GraphQL, Rust, AWS)?
          Add them to your profile to enrich your total capability picture.
        </p>

        <form onSubmit={handleAddCustom} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name</label>
            <input
              type="text"
              placeholder="e.g. C++, Flutter, GraphQL, Rust..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              <option value="Core Technical">Core Technical</option>
              <option value="Tools & Frameworks">Tools & Frameworks</option>
              <option value="Architecture & Concepts">Architecture & Concepts</option>
              <option value="Professional Skills">Professional Skills</option>
            </select>
          </div>

          <div className="w-full sm:w-32">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Level (0-5)</label>
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              <option value={1}>1: Beginner</option>
              <option value={2}>2: Elementary</option>
              <option value={3}>3: Competent</option>
              <option value={4}>4: Advanced</option>
              <option value={5}>5: Expert</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </form>

        {customSkills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            {customSkills.map((cs) => (
              <div
                key={cs.name}
                className="bg-indigo-50 border border-indigo-200 text-xs px-2.5 py-1 rounded-md flex items-center gap-2"
              >
                <span className="font-semibold text-indigo-900">{cs.name}</span>
                <span className="text-indigo-600 font-mono">(Lvl {cs.currentLevel}/5)</span>
                <button
                  type="button"
                  onClick={() => onRemoveCustomSkill(cs.name)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Remove skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Next Step Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
            {matchScore}%
          </div>
          <div>
            <div className="text-xs text-slate-400">Readiness Score for {selectedCareer.title}</div>
            <div className="text-sm font-semibold text-white">
              {ratedCount} of {selectedCareer.requiredSkills.length} skills evaluated
            </div>
          </div>
        </div>

        <button
          onClick={onProceedToGaps}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Identify Skill Gaps & Action Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

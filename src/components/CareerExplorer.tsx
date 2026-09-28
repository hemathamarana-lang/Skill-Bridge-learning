import React, { useState } from 'react';
import { Search, Sparkles, Check, ArrowRight, DollarSign, TrendingUp, Briefcase, Plus, Loader2 } from 'lucide-react';
import { CareerProfile } from '../types';
import { analyzeCustomCareer } from '../services/api';

interface CareerExplorerProps {
  careers: CareerProfile[];
  selectedCareer: CareerProfile;
  onSelectCareer: (career: CareerProfile) => void;
  onAddCustomCareer: (career: CareerProfile) => void;
  onProceedToAssessment: () => void;
}

export const CareerExplorer: React.FC<CareerExplorerProps> = ({
  careers,
  selectedCareer,
  onSelectCareer,
  onAddCustomCareer,
  onProceedToAssessment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'All',
    'Software Engineering',
    'Data & AI',
    'Cloud & Infrastructure',
    'Design',
    'Cybersecurity',
    'Product & Strategy',
  ];

  const filteredCareers = careers.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.requiredSkills.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setErrorMsg('Please enter a target career title or role name.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    try {
      const newCareer = await analyzeCustomCareer(customTitle.trim(), customDescription.trim());
      onAddCustomCareer(newCareer);
      onSelectCareer(newCareer);
      setShowCustomModal(false);
      setCustomTitle('');
      setCustomDescription('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to analyze custom career.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro hero banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
            <span>Step 1 of 5</span>
            <span aria-hidden="true">·</span>
            <span>Target Role Specification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Understand the Industry Skills for Your Dream Career
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Every tech role has explicit technical prerequisites, toolchains, and mental models.
            Select a verified career benchmark below, or use AI to analyze any custom job description or niche specialization.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pt-6 border-t border-slate-100">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search careers, skills (e.g. Docker, React, ML)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Action to create custom role */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Analyze Custom Job / Role with AI</span>
          </button>
        </div>

        {/* Category Filter Buttons */}
        <div className="mt-4 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-slate-400 mr-2 font-medium">Domain:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Career Callout / Next Step Action */}
      <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-200 font-medium">
            <span>Currently Selected Career</span>
            <span aria-hidden="true">·</span>
            <span>{selectedCareer.category}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight text-white">
            {selectedCareer.title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-100/90 max-w-2xl line-clamp-2">
            {selectedCareer.summary}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-300" />
              <span>{selectedCareer.averageSalary}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demand: {selectedCareer.marketDemand}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{selectedCareer.requiredSkills.length} Core Skill Benchmarks</span>
          </div>
        </div>

        <button
          onClick={onProceedToAssessment}
          className="self-start md:self-center px-5 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Compare With My Skills</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Careers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCareers.map((career) => {
          const isSelected = selectedCareer.id === career.id;
          return (
            <div
              key={career.id}
              className={`bg-white rounded-2xl border transition-all p-6 flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{career.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{career.experienceLevel}</span>
                      {career.isCustom && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-600 font-medium">Custom AI Profile</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{career.title}</h3>
                  </div>

                  <button
                    onClick={() => onSelectCareer(career)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Target</span>
                      </>
                    ) : (
                      <span>Select Role</span>
                    )}
                  </button>
                </div>

                {/* Summary */}
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {career.summary}
                </p>

                {/* Market metadata */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Salary Range</span>
                    <span className="font-semibold text-slate-800">{career.averageSalary}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Industry Demand</span>
                    <span className="font-semibold text-slate-800">{career.marketDemand}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[11px]">Skills Assessed</span>
                    <span className="font-semibold text-slate-800">{career.requiredSkills.length} Competencies</span>
                  </div>
                </div>

                {/* Required Skills breakdown preview */}
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Key Benchmark Skills Required:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {career.requiredSkills.slice(0, 7).map((skill) => (
                      <span
                        key={skill.name}
                        className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-md flex items-center gap-1"
                      >
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (Lvl {skill.requiredLevel}/5)
                        </span>
                      </span>
                    ))}
                    {career.requiredSkills.length > 7 && (
                      <span className="text-xs text-slate-500 self-center px-1">
                        +{career.requiredSkills.length - 7} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Top Learning focus preview */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Core Learning Focus:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {career.topLearningFocus.slice(0, 2).map((focus, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">›</span>
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {career.typicalInterviewFocus.length} Interview Topics mapped
                </span>
                <button
                  onClick={() => {
                    onSelectCareer(career);
                    onProceedToAssessment();
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Evaluate Gaps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Career Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 relative">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-900">Analyze Custom Role with Gemini</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Enter any specialized job title or paste a full job description from LinkedIn/Indeed.
              Gemini will extract required skills, proficiency levels, and salary expectations.
            </p>

            <form onSubmit={handleCreateCustom} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Job Title / Career *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Game Engine Programmer, Embedded IoT Engineer, Prompt Engineer"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description or Syllabus Details (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste snippet from job posting, requirements bullet points, or specific technologies..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  disabled={isAnalyzing}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Role Requirements...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze & Generate Benchmark</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

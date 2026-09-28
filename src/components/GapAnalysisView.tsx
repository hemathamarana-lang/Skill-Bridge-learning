import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CareerProfile, GapAnalysisSummary, GapStatus, SkillCategory, SkillGap } from '../types';

interface GapAnalysisViewProps {
  selectedCareer: CareerProfile;
  gapSummary: GapAnalysisSummary;
  onProceedToPlatforms: (filterSkill?: string) => void;
  onProceedToRoadmap: () => void;
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  selectedCareer,
  gapSummary,
  onProceedToPlatforms,
  onProceedToRoadmap,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | GapStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const {
    matchScore,
    targetMetCount,
    minorGapCount,
    criticalGapCount,
    totalHoursToCloseGaps,
    priorityTackleList,
    categoryBreakdown,
  } = gapSummary;

  // Derive all gaps list from priorityTackleList and met skills
  const allGaps = [
    ...priorityTackleList,
    ...selectedCareer.requiredSkills
      .filter((s) => !priorityTackleList.some((p) => p.skillName === s.name))
      .map((s) => ({
        skillName: s.name,
        category: s.category,
        requiredLevel: s.requiredLevel,
        currentLevel: s.requiredLevel, // met
        gap: 0,
        criticality: s.criticality,
        status: 'target-met' as GapStatus,
        estimatedHoursToClose: 0,
        description: s.description,
      })),
  ];

  const filteredGaps = allGaps.filter((g) => {
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesCat = categoryFilter === 'all' || g.category === categoryFilter;
    return matchesStatus && matchesCat;
  });

  const getReadinessVerdict = (score: number) => {
    if (score >= 80) return { title: 'Interview Ready / Advanced Candidate', desc: 'You satisfy the core technical thresholds. Focus on portfolio polish and mock interviews.' };
    if (score >= 60) return { title: 'Solid Foundation / Target Sprints Needed', desc: 'You have good fundamental literacy. Closing 2-3 critical gaps will make you interview competitive.' };
    if (score >= 35) return { title: 'Developing Competency / Phased Growth', desc: 'You have initial exposure. A structured 12-week roadmap will systematically bridge missing competencies.' };
    return { title: 'Early Stage / Foundational Curriculum', desc: 'Great time to start! Follow our step-by-step roadmap to build your technical base without feeling overwhelmed.' };
  };

  const verdict = getReadinessVerdict(matchScore);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Step Introduction */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
            <span>Step 3 of 5</span>
            <span aria-hidden="true">·</span>
            <span>Skill Gap Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Skill Gap Analysis for {selectedCareer.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            By comparing your current proficiency against industry hiring requirements, we identify
            where your largest deficits exist, estimate study hours required, and prioritize what to learn first.
          </p>
        </div>

        {/* Executive Scorecard */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Match Score Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Career Match Score</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">{matchScore}%</span>
                <span className="text-xs text-emerald-400 font-medium">Weighted Readiness</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
              {verdict.title}
            </div>
          </div>

          {/* Critical Gaps Card */}
          <div className="bg-white border border-rose-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-rose-700 font-semibold">
                <span>Critical Gaps</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-950 mt-2">
                {criticalGapCount}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Must-have competencies with $\ge 2$ levels deficit.
            </p>
          </div>

          {/* Minor Gaps Card */}
          <div className="bg-white border border-amber-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
                <span>Minor Gaps</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-950 mt-2">
                {minorGapCount}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              1 level deficit from target benchmark.
            </p>
          </div>

          {/* Study Time Estimate */}
          <div className="bg-white border border-indigo-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold">
                <span>Est. Time to Close</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-950 mt-2">
                ~{totalHoursToCloseGaps} <span className="text-base font-normal text-slate-500">hrs</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              ~{Math.ceil(totalHoursToCloseGaps / 12)} weeks at 12 hrs/week study.
            </p>
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 block mb-3">
            Domain Category Match Breakdown:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(categoryBreakdown) as SkillCategory[]).map((cat) => {
              const stat = categoryBreakdown[cat];
              return (
                <div key={cat} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{cat}</span>
                    <span className="font-bold text-indigo-700">{stat.matchPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, stat.matchPct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                    <span>Avg Current: {stat.currentAvg}/5</span>
                    <span>Required: {stat.requiredAvg}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Tackle List - What to learn first */}
      {priorityTackleList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Priority Action Sequence</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Top Priority Skills to Bridge First
              </h2>
            </div>
            <button
              onClick={onProceedToRoadmap}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Build Roadmap for These Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            Ranked by impact on hiring decisions. These represent your highest risk shortfalls during technical screens.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityTackleList.slice(0, 4).map((gap, index) => (
              <div
                key={gap.skillName}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-bold text-indigo-600">#{index + 1} Priority</span>
                        <span aria-hidden="true">·</span>
                        <span>{gap.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{gap.skillName}</h3>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        gap.criticality === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {gap.criticality}
                    </span>
                  </div>

                  {/* Level Deficit visualization */}
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Current: Lvl {gap.currentLevel}/5</span>
                        <span className="font-semibold text-slate-900">Target: Lvl {gap.requiredLevel}/5</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className="bg-indigo-600 h-full"
                          style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                        />
                        <div
                          className="bg-rose-400/80 h-full"
                          style={{ width: `${(gap.gap / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {gap.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{gap.estimatedHoursToClose} hrs to bridge</span>
                  </span>
                  <button
                    onClick={() => onProceedToPlatforms(gap.skillName)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Recommended Platforms</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Skills Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Complete Skill Gap Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive side-by-side comparison of all {selectedCareer.requiredSkills.length} competencies.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="all">All Statuses ({allGaps.length})</option>
              <option value="critical-gap">Critical Gaps ({criticalGapCount})</option>
              <option value="minor-gap">Minor Gaps ({minorGapCount})</option>
              <option value="target-met">Target Met ({targetMetCount})</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="Core Technical">Core Technical</option>
              <option value="Tools & Frameworks">Tools & Frameworks</option>
              <option value="Architecture & Concepts">Architecture & Concepts</option>
              <option value="Professional Skills">Professional Skills</option>
            </select>
          </div>
        </div>

        {/* Responsive Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Skill & Category</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Current vs Target Level</th>
                <th className="py-3 px-4 font-semibold">Gap Status</th>
                <th className="py-3 px-4 font-semibold">Est. Study Time</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGaps.map((item) => (
                <tr key={item.skillName} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.skillName}</div>
                    <div className="text-[11px] text-slate-500">{item.category}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-medium ${
                        item.criticality === 'Critical'
                          ? 'text-rose-600'
                          : item.criticality === 'High'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.criticality}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 min-w-[180px]">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                      <span>Lvl {item.currentLevel}/5</span>
                      <span className="font-medium text-slate-900">Target: {item.requiredLevel}/5</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full"
                        style={{ width: `${(item.currentLevel / 5) * 100}%` }}
                      />
                      {item.gap > 0 && (
                        <div
                          className="bg-rose-400 h-full"
                          style={{ width: `${(item.gap / 5) * 100}%` }}
                        />
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {item.status === 'target-met' || item.status === 'exceeded' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    ) : item.status === 'minor-gap' ? (
                      <span className="text-amber-700 font-medium">-1 Level</span>
                    ) : (
                      <span className="text-rose-700 font-bold">-{item.gap} Levels Deficit</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {item.gap > 0 ? `~${item.estimatedHoursToClose} hrs` : '0 hrs (Met)'}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onProceedToPlatforms(item.skillName)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Find Courses →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Step Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">Next Step: Close Your Skill Gaps</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Discover the best free and verified platforms (freeCodeCamp, Coursera, NeetCode, Odin Project)
            or generate your personalized week-by-week learning roadmap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onProceedToPlatforms()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Learning Platforms</span>
          </button>

          <button
            onClick={onProceedToRoadmap}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Generate Action Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Printer,
  Download,
  Share2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Award,
  Loader2,
  CheckSquare,
  Square,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CareerProfile, PersonalizedRoadmap, SkillGap } from '../types';
import { generatePersonalizedRoadmap } from '../services/api';

interface RoadmapViewProps {
  selectedCareer: CareerProfile;
  priorityGaps: SkillGap[];
  roadmap: PersonalizedRoadmap | null;
  onUpdateRoadmap: (newRoadmap: PersonalizedRoadmap) => void;
  hoursPerWeek: number;
  setHoursPerWeek: (hrs: number) => void;
  onPrint: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  selectedCareer,
  priorityGaps,
  roadmap,
  onUpdateRoadmap,
  hoursPerWeek,
  setHoursPerWeek,
  onPrint,
}) => {
  const [totalWeeks, setTotalWeeks] = useState<number>(12);
  const [learningPreference, setLearningPreference] = useState<string>('hands-on-projects');
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [completedChecklist, setCompletedChecklist] = useState<Record<number, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generatePersonalizedRoadmap({
        careerTitle: selectedCareer.title,
        identifiedGaps: priorityGaps,
        hoursPerWeek,
        totalWeeks,
        learningPreference,
      });
      onUpdateRoadmap(generated);
    } catch (err) {
      console.error('Roadmap generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMilestone = (key: string) => {
    const nextState = !completedMilestones[key];
    setCompletedMilestones((prev) => ({ ...prev, [key]: nextState }));
    if (nextState) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const toggleChecklist = (index: number) => {
    const nextState = !completedChecklist[index];
    setCompletedChecklist((prev) => ({ ...prev, [index]: nextState }));
    if (nextState) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseNumber]: !prev[phaseNumber] }));
  };

  // Calculate overall milestone completion
  const totalMilestonesCount = roadmap
    ? roadmap.phases.reduce((acc, p) => acc + p.milestones.length, 0)
    : 0;
  const completedCount = Object.values(completedMilestones).filter(Boolean).length;
  const progressPercent = totalMilestonesCount > 0 ? Math.round((completedCount / totalMilestonesCount) * 100) : 0;

  const exportToJson = () => {
    if (!roadmap) return;
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCareer.id}-learning-roadmap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
      {/* Introduction Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs print:border-none print:p-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
              <span>Step 5 of 5</span>
              <span aria-hidden="true">·</span>
              <span>Personalized Learning Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Action Roadmap for {selectedCareer.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              A phased, milestone-based curriculum engineered specifically to close your identified skill gaps.
              Customize your weekly study commitment and generate a synchronized plan with practical deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center no-print">
            <button
              onClick={onPrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={exportToJson}
              disabled={!roadmap}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="mt-6 pt-6 border-t border-slate-100 no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Weekly Study Commitment
            </label>
            <select
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              <option value={5}>5 hrs/week (Casual & Steady)</option>
              <option value={10}>10 hrs/week (Part-Time Student)</option>
              <option value={15}>15 hrs/week (Accelerated Pace)</option>
              <option value={25}>25 hrs/week (Intensive Bootcamp)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Duration
            </label>
            <select
              value={totalWeeks}
              onChange={(e) => setTotalWeeks(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              <option value={8}>8 Weeks (Rapid Bridge)</option>
              <option value={12}>12 Weeks (Recommended Quarter)</option>
              <option value={16}>16 Weeks (Semester Length)</option>
              <option value={24}>24 Weeks (Comprehensive Mastery)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Learning Style
            </label>
            <select
              value={learningPreference}
              onChange={(e) => setLearningPreference(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              <option value="hands-on-projects">Hands-On Projects First</option>
              <option value="video-guided">Video Lectures & Structured Courses</option>
              <option value="interactive-code">Interactive Coding & Sandbox Drills</option>
              <option value="docs-and-books">Official Documentation & Reading</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        {roadmap && totalMilestonesCount > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Roadmap Milestone Progress</span>
                <span className="font-bold text-indigo-700">
                  {completedCount} of {totalMilestonesCount} Milestones Completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Roadmap Content */}
      {roadmap ? (
        <div className="space-y-6">
          {/* Phases Accordion */}
          {roadmap.phases.map((phase) => {
            const isExpanded = expandedPhases[phase.phaseNumber] ?? true;
            return (
              <div
                key={phase.phaseNumber}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all print:border-slate-300"
              >
                {/* Phase Header */}
                <div
                  onClick={() => togglePhase(phase.phaseNumber)}
                  className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                      <span>{phase.weekSpan}</span>
                      <span aria-hidden="true">·</span>
                      <span>Phase {phase.phaseNumber}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{phase.name}</h2>
                    <p className="text-xs text-slate-600 mt-1">{phase.focus}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {phase.skillsCovered.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-100 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-slate-400 no-print">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Phase Milestones */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6">
                    {phase.milestones.map((m, mIndex) => {
                      const mKey = `p${phase.phaseNumber}-m${m.week || mIndex}`;
                      const isCompleted = completedMilestones[mKey] ?? false;

                      return (
                        <div
                          key={mKey}
                          className={`p-4 sm:p-5 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleMilestone(mKey)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer no-print shrink-0"
                                title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                                )}
                              </button>

                              <div>
                                <div className="text-xs text-slate-500 font-medium">
                                  Week {m.week || mIndex + 1} Milestone
                                </div>
                                <h3
                                  className={`text-base font-bold mt-0.5 ${
                                    isCompleted ? 'text-emerald-950 line-through' : 'text-slate-900'
                                  }`}
                                >
                                  {m.title}
                                </h3>
                              </div>
                            </div>

                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </div>

                          {/* Learning Goals */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-700 block mb-1">
                              Key Learning Objectives:
                            </span>
                            <ul className="text-xs text-slate-600 space-y-1">
                              {m.learningGoals.map((g, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-indigo-500 font-bold">›</span>
                                  <span>{g}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommended Resources */}
                          {m.recommendedResources && m.recommendedResources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                                Recommended Study Materials:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {m.recommendedResources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={res.url || '#'}
                                    target={res.url ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    className="text-xs p-2 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-lg flex items-center gap-1.5 text-slate-800 hover:text-indigo-900 transition-colors"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="font-semibold">{res.platform}:</span>
                                    <span>{res.title}</span>
                                    {res.url && <ExternalLink className="w-3 h-3 text-slate-400" />}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practical Task */}
                          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 p-3 rounded-lg text-xs">
                            <div className="font-semibold text-slate-800 mb-0.5">
                              Deliverable / Practical Task:
                            </div>
                            <p className="text-slate-700">{m.practicalTask}</p>
                          </div>

                          {/* Checkpoint Quiz */}
                          {m.checkpointQuiz && (
                            <div className="mt-2 text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                              <span className="font-semibold">Self-Evaluation Checkpoint: </span>
                              <span>{m.checkpointQuiz}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Portfolio Capstone Project Blueprint Card */}
          {roadmap.capstoneProject && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Hiring Manager Portfolio Showcase</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Capstone Project Blueprint: {roadmap.capstoneProject.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
                {roadmap.capstoneProject.description}
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block mb-2">
                    Key Features to Implement:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {roadmap.capstoneProject.keyFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block mb-2">
                    Core Technologies:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {roadmap.capstoneProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-md font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block mb-1">
                    GitHub README Advice:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    {roadmap.capstoneProject.githubReadmeTips}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Career Readiness Checklist */}
          {roadmap.careerReadinessChecklist && roadmap.careerReadinessChecklist.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Final Career Readiness Checklist
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Before sending out applications for {selectedCareer.title}, check off these essential items.
              </p>

              <div className="space-y-2.5">
                {roadmap.careerReadinessChecklist.map((item, index) => {
                  const isChecked = completedChecklist[index] ?? false;
                  return (
                    <div
                      key={index}
                      onClick={() => toggleChecklist(index)}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <button type="button" className="text-slate-400 shrink-0 mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <span className={`text-xs ${isChecked ? 'line-through opacity-80' : ''}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <MilestoneIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Roadmap Generated Yet</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-4">
            Click the button below to generate a tailored, week-by-week learning plan based on your current skill gaps.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Roadmap...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Roadmap Now</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

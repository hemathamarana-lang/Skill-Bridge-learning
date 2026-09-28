import React from 'react';
import { Compass, Sparkles, Printer, RotateCcw, Target, BookOpen, Layers, Milestone as MilestoneIcon, MessageSquare } from 'lucide-react';
import { CareerProfile } from '../types';

interface HeaderProps {
  activeTab: 'careers' | 'assessment' | 'gaps' | 'platforms' | 'roadmap' | 'advisor';
  setActiveTab: (tab: 'careers' | 'assessment' | 'gaps' | 'platforms' | 'roadmap' | 'advisor') => void;
  selectedCareer: CareerProfile;
  matchScore: number;
  onReset: () => void;
  onPrint: () => void;
  hasGeminiKey: boolean;
}

interface TabItem {
  id: 'careers' | 'assessment' | 'gaps' | 'platforms' | 'roadmap' | 'advisor';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isAi?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCareer,
  matchScore,
  onReset,
  onPrint,
  hasGeminiKey,
}) => {
  const tabs: TabItem[] = [
    { id: 'careers', label: '1. Target Career', icon: Target },
    { id: 'assessment', label: '2. My Skills', icon: Layers },
    { id: 'gaps', label: '3. Gap Analysis', icon: Compass, badge: `${matchScore}%` },
    { id: 'platforms', label: '4. Learning Platforms', icon: BookOpen },
    { id: 'roadmap', label: '5. Action Roadmap', icon: MilestoneIcon },
    { id: 'advisor', label: 'AI Advisor', icon: MessageSquare, isAi: true },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top utility row */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">SkillBridge</span>
                <span className="text-xs text-slate-400 font-mono">v2.6</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 hidden sm:inline">Career Skills & Personalized Learning Roadmap</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active career pill-less indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-400">Target Role:</span>
              <button
                onClick={() => setActiveTab('careers')}
                className="font-semibold text-indigo-700 hover:underline max-w-[200px] truncate text-left"
                title={selectedCareer.title}
              >
                {selectedCareer.title}
              </button>
              <span className="text-slate-300">·</span>
              <span className="font-medium text-emerald-700">{matchScore}% Match</span>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onPrint}
              title="Print or Save PDF of Roadmap & Gap Report"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print / PDF</span>
            </button>

            <button
              onClick={onReset}
              title="Reset profile data"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset</span>
            </button>

            {hasGeminiKey && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium">Gemini 3.8 Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.isAi ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive ? 'bg-slate-800 text-emerald-300' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

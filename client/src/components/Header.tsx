import React from 'react';
import { Utensils, BookOpen, User, Sparkles, Camera, LogOut, Flame, Trophy, Bike } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scan' | 'journal' | 'goals' | 'streaks' | 'leaderboard' | 'activity';
  setActiveTab: (tab: 'scan' | 'journal' | 'goals' | 'streaks' | 'leaderboard' | 'activity') => void;
  savedCount: number;
  todayCalories: number;
  dailyGoalCalories: number;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  todayCalories,
  dailyGoalCalories,
  userName = 'User',
  onLogout,
}) => {
  const caloriePercent = Math.min(100, Math.round((todayCalories / Math.max(1, dailyGoalCalories)) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('scan')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-800">Smart Bite</span>
                <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> EXPERT MODE
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">All-Item Food & Accompaniment Nutrition AI</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              id="tab-scanner"
              onClick={() => setActiveTab('scan')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'scan'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>AI Scan</span>
            </button>

            <button
              id="tab-journal"
              onClick={() => setActiveTab('journal')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'journal'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              id="tab-streaks"
              onClick={() => setActiveTab('streaks')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'streaks'
                  ? 'bg-orange-500 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-100/60'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Streaks</span>
            </button>

            <button
              id="tab-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-yellow-500 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-yellow-600 hover:bg-yellow-100/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Ranks</span>
            </button>

            <button
              id="tab-activity"
              onClick={() => setActiveTab('activity')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-100/60'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Activity</span>
            </button>

            <button
              id="tab-profile"
              onClick={() => setActiveTab('goals')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'goals'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right side Today Calorie Badge & Logout */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => setActiveTab('goals')}
              className="hidden md:flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm"
            >
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase">{userName}</div>
                <div className="text-sm font-bold text-slate-800">
                  {todayCalories} <span className="text-xs font-normal text-slate-400 uppercase">/ {dailyGoalCalories} kcal</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-[10px] font-black text-emerald-700 relative overflow-hidden bg-white">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-emerald-100 transition-all"
                  style={{ height: `${caloriePercent}%` }}
                />
                <span className="relative z-10">{caloriePercent}%</span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out / Logout"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useMemo } from 'react';
import { Flame, Award, Lock, Trophy, Target, Sparkles } from 'lucide-react';
import { SavedMeal } from '../types';
import { CalendarView } from './CalendarView';

interface StreaksPageProps {
  savedMeals: SavedMeal[];
  dailyGoalCalories: number;
}

export const StreaksPage: React.FC<StreaksPageProps> = ({ savedMeals, dailyGoalCalories }) => {
  const { currentStreak, longestStreak, todayStatus, todayCalories, streakDates, exceededDates } = useMemo(() => {
    const map = new Map<string, number>();
    savedMeals.forEach(meal => {
      // Use the raw date string (YYYY-MM-DD) as the key to avoid timezone parsing issues
      const dateStr = meal.date;
      const current = map.get(dateStr) || 0;
      map.set(dateStr, current + meal.analysis.totalCalories);
    });

    // 15% threshold for hitting the goal
    const threshold = dailyGoalCalories * 0.15;
    const isTargetMet = (cals: number) => Math.abs(cals - dailyGoalCalories) <= threshold;

    let maxStreak = 0;
    let currentTempStreak = 0;
    let lastDateStr: string | null = null;
    
    // Sort all unique dates that have meals
    const sortedDatesStr = Array.from(map.keys()).sort(); // YYYY-MM-DD sorts correctly alphabetically
    
    for (const dStr of sortedDatesStr) {
      const cals = map.get(dStr)!;
      
      if (isTargetMet(cals)) {
        if (!lastDateStr) {
          currentTempStreak = 1;
        } else {
          const dObj = new Date(dStr);
          const lastObj = new Date(lastDateStr);
          const diffTime = Math.abs(dObj.getTime() - lastObj.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentTempStreak++;
          } else {
            currentTempStreak = 1;
          }
        }
      } else {
         currentTempStreak = 0;
      }
      
      if (currentTempStreak > maxStreak) {
        maxStreak = currentTempStreak;
      }
      
      if (isTargetMet(cals)) {
        lastDateStr = dStr;
      } else {
        lastDateStr = null;
      }
    }
    
    // Get today and yesterday in the exact same format (YYYY-MM-DD) that was saved
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const todayCals = map.get(todayStr) || 0;
    const yesterdayCals = map.get(yesterdayStr) || 0;
    
    let cStreak = 0;
    
    const todayMet = todayCals > 0 && isTargetMet(todayCals);
    const yesterdayMet = yesterdayCals > 0 && isTargetMet(yesterdayCals);
    
    if (todayMet || yesterdayMet) {
       let checkDate = todayMet ? new Date(todayStr) : new Date(yesterdayStr);
       while(true) {
         const ds = checkDate.toISOString().split('T')[0];
         const cal = map.get(ds) || 0;
         if (cal > 0 && isTargetMet(cal)) {
           cStreak++;
           // Step back one day
           checkDate.setDate(checkDate.getDate() - 1);
         } else {
           break;
         }
       }
    }

    const streakDates: string[] = [];
    const exceededDates: string[] = [];
    
    for (const [dStr, cals] of Array.from(map.entries())) {
      if (isTargetMet(cals)) {
        streakDates.push(dStr);
      } else if (cals > dailyGoalCalories + threshold) {
        exceededDates.push(dStr);
      }
    }

    return { 
      currentStreak: cStreak, 
      longestStreak: Math.max(cStreak, maxStreak), 
      todayStatus: todayMet ? 'achieved' : (todayCals > 0 ? (todayCals > dailyGoalCalories + threshold ? 'exceeded' : 'pending') : 'pending'),
      todayCalories: todayCals,
      streakDates,
      exceededDates
    };
  }, [savedMeals, dailyGoalCalories]);

  const milestones = [10, 50, 70, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
  const progressPercent = Math.min(100, Math.round((currentStreak / nextMilestone) * 100));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Flame className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-extrabold tracking-wider mb-6">
            <Flame className="w-4 h-4" />
            STREAK TRACKER
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 justify-between">
            <div>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight flex items-baseline gap-2">
                {currentStreak}
                <span className="text-2xl sm:text-3xl text-slate-400 font-bold">Days</span>
              </h1>
              <p className="text-slate-300 mt-2 font-medium">Current Active Streak</p>
            </div>
            
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Longest Streak</p>
                <p className="text-2xl font-black text-white">{longestStreak} Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Target Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Today's Target
          </h2>
          {todayStatus === 'achieved' && (
             <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Achieved</span>
          )}
          {todayStatus === 'exceeded' && (
             <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">Exceeded Target</span>
          )}
          {todayStatus === 'pending' && (
             <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">In Progress</span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-slate-600 bg-slate-100">
                  Calories Logged
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-slate-600">
                  {todayCalories} / {dailyGoalCalories} kcal
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100">
              <div 
                style={{ width: `${Math.min(100, (todayCalories / dailyGoalCalories) * 100)}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${todayStatus === 'exceeded' ? 'bg-rose-500' : 'bg-emerald-500'}`}
              ></div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Hit within ±15% of your target ({Math.round(dailyGoalCalories * 0.85)} - {Math.round(dailyGoalCalories * 1.15)} kcal) to extend your streak.
            </p>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Monthly Activity</h2>
        </div>
        <CalendarView
          type="streaks"
          markedDates={streakDates}
          exceededDates={exceededDates}
        />
      </div>

      {/* Rewards & Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Milestone Badges
            </h2>
            <p className="text-sm text-slate-500 mt-1">Unlock badges by maintaining consistent streaks.</p>
          </div>
        </div>

        {/* Next Milestone Progress */}
        <div className="mb-10 bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span>Next Milestone: {nextMilestone} Days</span>
            <span className="text-orange-600">{currentStreak} / {nextMilestone}</span>
          </div>
          <div className="overflow-hidden h-2.5 flex rounded-full bg-slate-200">
            <div 
              style={{ width: `${progressPercent}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-400 to-orange-500"
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {milestones.map((milestone, idx) => {
            const isUnlocked = longestStreak >= milestone;
            
            return (
              <div 
                key={milestone} 
                className={`relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                  isUnlocked 
                    ? 'bg-gradient-to-b from-orange-50 to-white border border-orange-200 shadow-sm hover:-translate-y-1' 
                    : 'bg-slate-50 border border-slate-100 opacity-70 grayscale'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-3 right-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${
                  isUnlocked ? 'bg-orange-100 text-orange-500' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Award className={`w-8 h-8 ${isUnlocked ? 'fill-orange-500' : ''}`} />
                </div>
                
                <h3 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                  {milestone} Days
                </h3>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {isUnlocked ? 'Unlocked!' : 'Locked'}
                </p>
                
                {isUnlocked && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-5 w-5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500 text-white items-center justify-center">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

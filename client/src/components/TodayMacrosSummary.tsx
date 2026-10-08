import React from 'react';
import { Dumbbell, Wheat, Droplets, Target, Activity } from 'lucide-react';

interface TodayMacrosSummaryProps {
  dailyGoalCalories: number;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  todayBurned?: number;
}

export const TodayMacrosSummary: React.FC<TodayMacrosSummaryProps> = ({
  dailyGoalCalories = 2000,
  todayCalories = 0,
  todayProtein = 0,
  todayCarbs = 0,
  todayFat = 0,
  todayBurned = 0,
}) => {
  const safeGoal = Math.max(100, Number(dailyGoalCalories) || 2000);
  const safeCal = Math.max(0, Number(todayCalories) || 0);
  const safeProt = Math.max(0, Number(todayProtein) || 0);
  const safeCarb = Math.max(0, Number(todayCarbs) || 0);
  const safeFatVal = Math.max(0, Number(todayFat) || 0);
  const safeBurned = Math.max(0, Number(todayBurned) || 0);

  const netCalories = Math.max(0, safeCal - safeBurned);

  // Estimated macro targets based on standard 25% Protein, 50% Carbs, 25% Fat balance
  const targetProteinGrams = Math.round((safeGoal * 0.25) / 4);
  const targetCarbsGrams = Math.round((safeGoal * 0.50) / 4);
  const targetFatGrams = Math.round((safeGoal * 0.25) / 9);

  const calPercent = Math.min(100, Math.round((netCalories / safeGoal) * 100));
  const proteinPercent = Math.min(100, Math.round((safeProt / Math.max(1, targetProteinGrams)) * 100));
  const carbsPercent = Math.min(100, Math.round((safeCarb / Math.max(1, targetCarbsGrams)) * 100));
  const fatPercent = Math.min(100, Math.round((safeFatVal / Math.max(1, targetFatGrams)) * 100));

  const remainingCalories = Math.max(0, safeGoal - netCalories);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Today's Macro Tracking
            </h3>
            <p className="text-xs text-slate-500">
              Real-time daily nutrition & activity overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <Target className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-600">Daily Goal:</span>
          <span className="text-slate-900 font-extrabold">{safeGoal} kcal</span>
        </div>
      </div>

      {/* Main Calorie Progress Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 relative z-10">
          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Net Calories (In - Burned)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{netCalories}</span>
              <span className="text-sm font-semibold text-slate-300">/ {safeGoal} kcal</span>
            </div>
            {safeBurned > 0 && (
              <div className="text-[10px] text-emerald-400 font-bold mt-1">
                🔥 {safeBurned} kcal burned from exercise
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Remaining
            </span>
            <span className={`text-xl font-extrabold ${remainingCalories > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {remainingCalories} kcal
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700/80 rounded-full h-3 overflow-hidden relative z-10">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${calPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-300 font-medium mt-2 relative z-10">
          <span>0 kcal</span>
          <span>{calPercent}% of Daily Goal</span>
          <span>{safeGoal} kcal</span>
        </div>
      </div>

      {/* 3 Macro Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Protein */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" /> Protein
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {proteinPercent}%
            </span>
          </div>
          <div className="flex items-baseline justify-between text-slate-800">
            <span className="text-lg font-black text-emerald-800">{Math.round(safeProt)}g</span>
            <span className="text-xs font-semibold text-slate-500">/ {targetProteinGrams}g target</span>
          </div>
          <div className="w-full bg-emerald-200/70 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5 text-blue-600" /> Carbs
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {carbsPercent}%
            </span>
          </div>
          <div className="flex items-baseline justify-between text-slate-800">
            <span className="text-lg font-black text-blue-800">{Math.round(safeCarb)}g</span>
            <span className="text-xs font-semibold text-slate-500">/ {targetCarbsGrams}g target</span>
          </div>
          <div className="w-full bg-blue-200/70 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-amber-600" /> Fat
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {fatPercent}%
            </span>
          </div>
          <div className="flex items-baseline justify-between text-slate-800">
            <span className="text-lg font-black text-amber-800">{Math.round(safeFatVal)}g</span>
            <span className="text-xs font-semibold text-slate-500">/ {targetFatGrams}g target</span>
          </div>
          <div className="w-full bg-amber-200/70 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

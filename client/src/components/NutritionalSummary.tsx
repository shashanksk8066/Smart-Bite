import React from 'react';
import { Flame, Activity, ShieldCheck, HeartPulse, Save, RotateCcw, Check, Sparkles } from 'lucide-react';
import { FoodAnalysisResult } from '../types';

interface NutritionalSummaryProps {
  analysis: FoodAnalysisResult;
  onSaveMeal: () => void;
  isSaved: boolean;
  onReset: () => void;
}

export const NutritionalSummary: React.FC<NutritionalSummaryProps> = ({
  analysis,
  onSaveMeal,
  isSaved,
  onReset,
}) => {
  const {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber = 0,
    totalSugar = 0,
    description,
    mealType,
    healthScore = 75,
    dietaryInsights = [],
  } = analysis;

  // Calorie breakdown percentages
  const proteinCals = totalProtein * 4;
  const carbsCals = totalCarbs * 4;
  const fatCals = totalFat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals || 1;

  const pPct = Math.round((proteinCals / totalMacroCals) * 100);
  const cPct = Math.round((carbsCals / totalMacroCals) * 100);
  const fPct = Math.round((fatCals / totalMacroCals) * 100);

  // Health score badge style
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-rose-700 bg-rose-100 border-rose-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {mealType}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detected Meal Overview</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nutritional Breakdown</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-reanalyze"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Scan New Meal</span>
          </button>

          <button
            id="btn-save-journal"
            onClick={onSaveMeal}
            disabled={isSaved}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
              isSaved
                ? 'bg-slate-100 text-emerald-700 border border-emerald-300 cursor-default'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved to Journal' : 'Save Meal'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Total Calories & Health Score + Macro Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 my-6">
        {/* Total Calories Highlight Card */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              Total Energy
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              {totalCalories}
              <span className="text-sm font-normal text-slate-400 ml-1 uppercase">kcal</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Based on visual portion estimates</div>
          </div>

          <div className="w-14 h-14 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <Flame className="w-7 h-7 stroke-[2]" />
          </div>
        </div>

        {/* Protein Tile */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Protein</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">{pPct}%</span>
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-blue-600">{totalProtein}</span>
            <span className="text-xs font-normal text-slate-500 ml-1">g</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pPct}%` }} />
          </div>
        </div>

        {/* Carbs Tile */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Net Carbs</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-200">{cPct}%</span>
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-orange-600">{totalCarbs}</span>
            <span className="text-xs font-normal text-slate-500 ml-1">g</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${cPct}%` }} />
          </div>
        </div>

        {/* Fat Tile */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-yellow-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Healthy Fats</span>
            <span className="px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-800 text-[10px] font-bold border border-yellow-200">{fPct}%</span>
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-yellow-600">{totalFat}</span>
            <span className="text-xs font-normal text-slate-500 ml-1">g</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${fPct}%` }} />
          </div>
        </div>

        {/* Health Score Tile */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
            <span>Meal Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-1 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-600">{healthScore}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getHealthScoreColor(healthScore)}`}>
              {healthScore >= 80 ? 'Optimal' : healthScore >= 60 ? 'Moderate' : 'Watch'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${healthScore}%` }} />
          </div>
        </div>
      </div>

      {/* Secondary Micronutrients & Insights High-Contrast Panel */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-6 w-full md:w-auto justify-around">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dietary Fiber</span>
            <span className="text-base font-black text-emerald-400">{totalFiber}g</span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sugars</span>
            <span className="text-base font-black text-amber-400">{totalSugar}g</span>
          </div>
        </div>

        {/* AI Nutritionist Insights */}
        {(dietaryInsights.length > 0 || analysis.mealFeedback) && (
          <div className="flex items-start gap-2 border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-4 text-xs text-slate-300 flex-1">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-3 w-full">
              {analysis.mealFeedback && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-white font-medium italic">{analysis.mealFeedback}</p>
                </div>
              )}
              
              {dietaryInsights.length > 0 && (
                <div className="space-y-0.5 pt-1">
                  {dietaryInsights.map((insight, idx) => (
                    <p key={idx}>• {insight}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, Target, Flame, RefreshCw, CheckCircle2, Utensils, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import { MealSuggestion } from '../types';
import { DEFAULT_MEAL_SUGGESTIONS } from '../data/sampleFoods';

interface AIMealSuggestionsProps {
  dailyGoalCalories: number;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  todayBurned?: number;
  onSelectSuggestion: (sampleUrl: string, customPrompt?: string) => void;
  isLoadingAnalysis: boolean;
}

export const AIMealSuggestions: React.FC<AIMealSuggestionsProps> = ({
  dailyGoalCalories,
  todayCalories,
  todayProtein,
  todayCarbs,
  todayFat,
  todayBurned = 0,
  onSelectSuggestion,
  isLoadingAnalysis,
}) => {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>(DEFAULT_MEAL_SUGGESTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietaryPreference, setDietaryPreference] = useState<'Balanced' | 'High Protein' | 'Low Carb' | 'Vegetarian'>('Balanced');
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const netCalories = Math.max(0, todayCalories - todayBurned);
  const remainingCalories = Math.max(0, dailyGoalCalories - netCalories);
  const percentComplete = Math.min(100, Math.round((netCalories / Math.max(1, dailyGoalCalories)) * 100));

  // Call Gemini API to generate tailored suggestions
  const handleGenerateAISuggestions = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/suggest-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyGoalCalories,
          todayCalories,
          remainingCalories,
          todayProtein,
          todayCarbs,
          todayFat,
          dietaryPreference,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch AI meal suggestions.');
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error('No suggestions returned from AI model.');
      }
    } catch (err: any) {
      console.error('Error generating AI suggestions:', err);
      setError(err.message || 'Could not fetch AI suggestions. Displaying curated recommendations.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardClick = (suggestion: MealSuggestion) => {
    setSelectedId(suggestion.id);
    onSelectSuggestion(
      suggestion.url,
      suggestion.customPrompt || `Analyze this meal: ${suggestion.title}. Identify all main food items and accompaniments.`
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Target Status Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Target Planner
            </div>
            <h3 className="text-xl font-extrabold text-slate-800">
              AI Meal Suggestions to Hit Your Daily Goal
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Tailored food recommendations specifically balanced to complete your remaining calorie & macro budget for today.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-xl p-3 shadow-xs shrink-0">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Target</span>
              <span className="text-sm font-extrabold text-slate-800">{dailyGoalCalories} <span className="text-[10px] font-medium text-slate-500">kcal</span></span>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Eaten Today</span>
              <span className="text-sm font-extrabold text-emerald-700">{todayCalories} <span className="text-[10px] font-medium text-slate-500">kcal</span></span>
            </div>
            <div className="text-center px-3">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Remaining</span>
              <span className={`text-sm font-extrabold ${remainingCalories > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {remainingCalories} <span className="text-[10px] font-medium text-slate-500">kcal</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-slate-600 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-emerald-600" /> Daily Target Progress: {percentComplete}%
            </span>
            <span className="text-emerald-700">
              {remainingCalories > 0
                ? `${remainingCalories} kcal left to reach ${dailyGoalCalories} target`
                : '🎉 Target reached!'}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Preference:</span>
          {(['Balanced', 'High Protein', 'Low Carb', 'Vegetarian'] as const).map((pref) => (
            <button
              key={pref}
              onClick={() => setDietaryPreference(pref)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                dietaryPreference === pref
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerateAISuggestions}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'AI Is Planning...' : '✨ Generate Fresh AI Suggestions'}
        </button>
      </div>

      {/* Error Notice if any */}
      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={`group cursor-pointer bg-slate-50 border rounded-2xl p-3.5 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-slate-700 flex items-center gap-1 shadow-sm">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {item.category}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm">
                    {item.calories} kcal
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-snug">
                  {item.description}
                </p>

                {/* Macros Chips */}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    P: {item.protein}g
                  </span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    C: {item.carbs}g
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    F: {item.fat}g
                  </span>
                </div>

                {/* Accompaniment items preview */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Items & Sides:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.itemsPreview.slice(0, 3).map((subItem, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-medium line-clamp-1"
                      >
                        {subItem}
                      </span>
                    ))}
                    {item.itemsPreview.length > 3 && (
                      <span className="text-[9px] text-emerald-700 font-bold px-1 py-0.5">
                        +{item.itemsPreview.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Reason Badge */}
                {item.whySuggested && (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 mb-3 text-[10px] text-emerald-900 leading-tight">
                    <span className="font-extrabold text-emerald-700 block mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Why AI Recommends This:
                    </span>
                    {item.whySuggested}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                disabled={isLoadingAnalysis}
                className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs group-hover:bg-emerald-600"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Scan / Test Meal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

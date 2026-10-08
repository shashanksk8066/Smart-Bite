import React, { useState } from 'react';
import { SavedMeal } from '../types';
import { BookOpen, Calendar, Trash2, Flame, Utensils, Download, ChevronRight, Sparkles } from 'lucide-react';
import { CalendarView } from './CalendarView';
interface MealJournalProps {
  savedMeals: SavedMeal[];
  onDeleteMeal: (id: string) => void;
  dailyGoalCalories: number;
}

export const MealJournal: React.FC<MealJournalProps> = ({
  savedMeals,
  onDeleteMeal,
  dailyGoalCalories,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  // Group dates available
  const dates = Array.from(new Set(savedMeals.map((m) => m.date)));

  // Filtered meals
  const filteredMeals = selectedDate === 'all'
    ? savedMeals
    : savedMeals.filter((m) => m.date === selectedDate);

  // Compute today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const displayDate = selectedDate === 'all' ? todayStr : selectedDate;
  const displayMeals = savedMeals.filter((m) => m.date === displayDate);

  const displayCalories = displayMeals.reduce((sum, m) => sum + m.analysis.totalCalories, 0);
  const displayProtein = displayMeals.reduce((sum, m) => sum + m.analysis.totalProtein, 0);
  const displayCarbs = displayMeals.reduce((sum, m) => sum + m.analysis.totalCarbs, 0);
  const displayFat = displayMeals.reduce((sum, m) => sum + m.analysis.totalFat, 0);

  // Export Journal to JSON
  const handleExportJournal = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedMeals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nutriscan-journal-export-${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Today Stats Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Meal Journal & Intake History
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Recorded meal analyses, total daily calories, and macronutrient trends.
            </p>
          </div>

          {savedMeals.length > 0 && (
            <button
              onClick={handleExportJournal}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Journal JSON</span>
            </button>
          )}
        </div>

        {/* Date Calorie Progress Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {displayDate === todayStr ? "Today's Log" : "Log for"} ({displayDate})
            </span>
            <span className="font-bold text-emerald-700">
              {displayCalories} / {dailyGoalCalories} kcal
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (displayCalories / dailyGoalCalories) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Protein</span>
              <span className="font-black text-blue-600">{displayProtein.toFixed(1)}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Carbs</span>
              <span className="font-black text-orange-600">{displayCarbs.toFixed(1)}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Fat</span>
              <span className="font-black text-yellow-600">{displayFat.toFixed(1)}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Browse by Date</h3>
          <button
            onClick={() => setSelectedDate('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
              selectedDate === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            All ({savedMeals.length})
          </button>
        </div>
        <CalendarView 
          type="history" 
          markedDates={dates} 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />
      </div>

      {/* List of Saved Meals */}
      {filteredMeals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Saved Meals Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Analyze a food photo using AI Scan and click "Save Meal" to log it in your journal.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMeals.map((meal) => {
            const isExpanded = expandedMealId === meal.id;
            const { totalCalories, totalProtein, totalCarbs, totalFat, foods, description, mealType } = meal.analysis;

            return (
              <div
                key={meal.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt="Meal thumbnail"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 border border-slate-200 shrink-0">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {mealType}
                        </span>
                        <span className="text-xs text-slate-500">
                          {meal.date} at {meal.time}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-800 line-clamp-1">
                        {description}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                        <span className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {totalCalories} kcal
                        </span>
                        <span>
                          <strong className="text-blue-600 font-bold">P:</strong> {totalProtein}g
                        </span>
                        <span>
                          <strong className="text-orange-600 font-bold">C:</strong> {totalCarbs}g
                        </span>
                        <span>
                          <strong className="text-yellow-600 font-bold">F:</strong> {totalFat}g
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>{isExpanded ? 'Hide Items' : `View ${foods.length} Items`}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    <button
                      onClick={() => onDeleteMeal(meal.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Itemized Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Identified Items & Accompaniments ({foods.length})
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {foods.map((food, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-sm"
                        >
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{food.name}</span>
                              {food.isAccompaniment && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                                  Side / Sauce
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Qty: {food.quantity} ({food.servingSize})
                            </div>
                          </div>

                          <div className="text-right font-black text-slate-800">
                            {food.calories * food.quantity} kcal
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

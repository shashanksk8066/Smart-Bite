import React, { useState, useMemo } from 'react';
import {
  INGREDIENT_CATEGORIES,
  BUILD_MEAL_INGREDIENTS,
  IngredientItem,
  IngredientCategory
} from '../data/buildMealIngredients';
import { FoodAnalysisResult, FoodItem } from '../types';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Flame,
  Utensils,
  CheckCircle2,
  RotateCcw,
  ChefHat,
  ChevronRight
} from 'lucide-react';

interface BuildYourMealProps {
  onCompleteMeal: (analysis: FoodAnalysisResult) => void;
  dailyGoalCalories?: number;
  todayCalories?: number;
  todayProtein?: number;
  todayCarbs?: number;
  todayFat?: number;
}

export const BuildYourMeal: React.FC<BuildYourMealProps> = ({
  onCompleteMeal,
  dailyGoalCalories = 2000,
  todayCalories = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [mealTitle, setMealTitle] = useState('Custom Healthy Bowl');

  // Map of ingredient id -> quantity (number of servings)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    return BUILD_MEAL_INGREDIENTS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.servingSize.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Selected items list with calculated values
  const selectedItemsWithDetails = useMemo(() => {
    return Object.entries(selectedQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = BUILD_MEAL_INGREDIENTS.find((i) => i.id === id);
        if (!item) return null;
        return {
          ...item,
          quantity: qty,
          totalCalories: Math.round(item.calories * qty),
          totalProtein: Math.round(item.protein * qty * 10) / 10,
          totalCarbs: Math.round(item.carbs * qty * 10) / 10,
          totalFat: Math.round(item.fat * qty * 10) / 10,
          totalFiber: Math.round(item.fiber * qty * 10) / 10,
        };
      })
      .filter(Boolean) as (IngredientItem & {
        quantity: number;
        totalCalories: number;
        totalProtein: number;
        totalCarbs: number;
        totalFat: number;
        totalFiber: number;
      })[];
  }, [selectedQuantities]);

  // Live Totals
  const totals = useMemo(() => {
    return selectedItemsWithDetails.reduce(
      (acc, item) => ({
        calories: acc.calories + item.totalCalories,
        protein: Math.round((acc.protein + item.totalProtein) * 10) / 10,
        carbs: Math.round((acc.carbs + item.totalCarbs) * 10) / 10,
        fat: Math.round((acc.fat + item.totalFat) * 10) / 10,
        fiber: Math.round((acc.fiber + item.totalFiber) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [selectedItemsWithDetails]);

  // Handlers for quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleSetExactQuantity = (id: string, qty: number) => {
    setSelectedQuantities((prev) => {
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: qty };
    });
  };

  const handleClearAll = () => {
    setSelectedQuantities({});
  };

  // Convert custom meal to FoodAnalysisResult
  const handleLogCustomMeal = () => {
    if (selectedItemsWithDetails.length === 0) {
      alert('Please add at least one item to your meal tray.');
      return;
    }

    const foods: FoodItem[] = selectedItemsWithDetails.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      servingSize: item.servingSize,
      confidence: 1.0,
      category: item.category,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber,
      sugar: item.sugar,
      isAccompaniment: item.category === 'snacks' || item.category === 'vegetables' && item.totalCalories < 30,
    }));

    // Calculate a scientific health score based on macro distribution and fiber
    let healthScore = 75;
    if (totals.calories > 0) {
      const proteinRatio = (totals.protein * 4) / totals.calories;
      if (proteinRatio >= 0.25) healthScore += 10;
      if (proteinRatio < 0.12) healthScore -= 8;
      if (totals.fiber >= 8) healthScore += 10;
      else if (totals.fiber >= 4) healthScore += 5;
    }
    healthScore = Math.min(99, Math.max(45, healthScore));

    const finalDescription = `${mealTitle} featuring ${selectedItemsWithDetails.map((i) => i.name).slice(0, 3).join(', ')}${selectedItemsWithDetails.length > 3 ? ' and more' : ''}.`;

    const result: FoodAnalysisResult = {
      foods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalFiber: totals.fiber,
      description: finalDescription,
      mealType,
      healthScore,
      dietaryInsights: [
        `Custom handcrafted meal with ${selectedItemsWithDetails.length} clean ingredients.`,
        `Provides ${totals.protein}g protein and ${totals.fiber}g dietary fiber.`,
        totals.calories <= 500
          ? 'Calorie-conscious plate optimal for sustained fat loss.'
          : 'High-energy nourishing plate for recovery and stamina.',
      ],
      mealFeedback: `Well-balanced custom plate built with whole, nutrient-dense ingredients. Excellent portion control!`,
      alternatives: [],
      analyzedAt: new Date().toISOString(),
    };

    onCompleteMeal(result);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <ChefHat className="w-3.5 h-3.5" /> Subway-Style Meal Builder
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Build Your Own Meal
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Pick your vegetables, grains, proteins, healthy dairy, and snacks with precise portion control. We calculate your macros in real-time.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Goal</span>
              <span className="text-xl font-black text-emerald-400">
                {Math.max(0, dailyGoalCalories - todayCalories)} <span className="text-xs text-slate-400 font-normal">kcal</span>
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Items In Tray</span>
              <span className="text-xl font-black text-white">
                {selectedItemsWithDetails.length} <span className="text-xs text-slate-400 font-normal">items</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Ingredients Selection, Right side Subway Tray */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Food Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search & Category Pills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search healthy ingredients (e.g., Chicken, Brown Rice, Spinach, Avocado)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🍽️</span> All Foods ({BUILD_MEAL_INGREDIENTS.length})
              </button>

              {INGREDIENT_CATEGORIES.map((cat) => {
                const count = BUILD_MEAL_INGREDIENTS.filter((i) => i.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span> {cat.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredIngredients.map((item) => {
              const qty = selectedQuantities[item.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 bg-slate-100 rounded-xl">{item.icon}</span>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {item.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Portion: {item.servingSize}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          {item.calories} <span className="text-[10px] font-normal text-slate-500">kcal</span>
                        </span>
                      </div>
                    </div>

                    {/* Macro pill summary */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 rounded-lg py-1 px-1.5 border border-slate-100">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Protein</span>
                        <span className="text-xs font-extrabold text-emerald-600">{item.protein}g</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-1 px-1.5 border border-slate-100">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Carbs</span>
                        <span className="text-xs font-extrabold text-blue-600">{item.carbs}g</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-1 px-1.5 border border-slate-100">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Fat</span>
                        <span className="text-xs font-extrabold text-amber-600">{item.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {isSelected ? `${qty} serving${qty > 1 ? 's' : ''}` : 'Not added'}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-8 text-center font-black text-xs text-emerald-950">
                          {qty}
                        </span>

                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredIngredients.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <span className="text-4xl block mb-2">🔍</span>
              <h4 className="font-bold text-slate-800 text-sm">No matching ingredients found</h4>
              <p className="text-xs text-slate-500 mt-1">Try another search keyword or switch categories.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Subway Live Tray & Summary (5 cols - Sticky) */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md relative overflow-hidden">
            {/* Header of Tray */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">Your Meal Plate</h2>
                  <span className="text-xs text-slate-500">{selectedItemsWithDetails.length} items added</span>
                </div>
              </div>

              {selectedItemsWithDetails.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Plate
                </button>
              )}
            </div>

            {/* Meal Metadata inputs */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Meal Name
                </label>
                <input
                  type="text"
                  value={mealTitle}
                  onChange={(e) => setMealTitle(e.target.value)}
                  placeholder="e.g. Protein Lunch Bowl"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Meal Time
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 capitalize"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            {/* Plate Items List */}
            <div className="mt-5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedItemsWithDetails.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <span className="text-3xl block mb-2">🥗</span>
                  <p className="text-xs font-bold text-slate-700">Your plate is empty</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click "+ Add" on any food item to build your plate Subway-style!
                  </p>
                </div>
              ) : (
                selectedItemsWithDetails.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{item.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                        <span className="text-[10px] text-slate-500 block">
                          {item.totalCalories} kcal • {item.totalProtein}g P
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center font-black text-xs text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleSetExactQuantity(item.id, 0)}
                        className="p-1 text-slate-400 hover:text-rose-600 ml-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Macro Totals Breakdown Card */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Meal Calories</span>
                  <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1.5">
                    {totals.calories}
                    <span className="text-xs font-bold text-slate-500">kcal</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fiber</span>
                  <span className="text-base font-extrabold text-emerald-600">{totals.fiber}g</span>
                </div>
              </div>

              {/* 3 Macro Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Protein</span>
                  <span className="text-sm font-black text-emerald-950">{totals.protein}g</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">Carbs</span>
                  <span className="text-sm font-black text-blue-950">{totals.carbs}g</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Fat</span>
                  <span className="text-sm font-black text-amber-950">{totals.fat}g</span>
                </div>
              </div>

              {/* Log Meal Button */}
              <button
                onClick={handleLogCustomMeal}
                disabled={selectedItemsWithDetails.length === 0}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm transition-all shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Save & Log This Meal ({totals.calories} kcal)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

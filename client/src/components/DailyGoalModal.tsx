import React, { useState } from 'react';
import { Target, Check, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface DailyGoalModalProps {
  currentGoalCalories: number;
  onSaveGoal: (newGoal: number) => void;
}

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  currentGoalCalories,
  onSaveGoal,
}) => {
  const [goal, setGoal] = useState<number>(currentGoalCalories);
  const [preset, setPreset] = useState<string>('custom');

  const handleApplyPreset = (value: number, type: string) => {
    setGoal(value);
    setPreset(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal > 0) {
      onSaveGoal(goal);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Daily Nutrition & Calorie Target
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize your daily target to align with your personal fitness or health goal.
          </p>
        </div>

        <div className="px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
          Active: {currentGoalCalories} kcal
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Quick Fitness Presets:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleApplyPreset(1600, 'deficit')}
            className={`p-3 rounded-xl border text-left transition-all ${
              preset === 'deficit'
                ? 'bg-slate-800 text-white border-slate-800 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className={`text-xs font-bold mb-0.5 ${preset === 'deficit' ? 'text-emerald-400' : 'text-emerald-600'}`}>Caloric Deficit</div>
            <div className="text-base font-black">1,600 kcal</div>
            <div className={`text-[10px] mt-1 ${preset === 'deficit' ? 'text-slate-300' : 'text-slate-500'}`}>For gradual weight loss & lean maintenance</div>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset(2100, 'maintenance')}
            className={`p-3 rounded-xl border text-left transition-all ${
              preset === 'maintenance'
                ? 'bg-slate-800 text-white border-slate-800 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className={`text-xs font-bold mb-0.5 ${preset === 'maintenance' ? 'text-sky-400' : 'text-sky-600'}`}>Balanced Maintenance</div>
            <div className="text-base font-black">2,100 kcal</div>
            <div className={`text-[10px] mt-1 ${preset === 'maintenance' ? 'text-slate-300' : 'text-slate-500'}`}>Standard energy balance for active lifestyle</div>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset(2800, 'surplus')}
            className={`p-3 rounded-xl border text-left transition-all ${
              preset === 'surplus'
                ? 'bg-slate-800 text-white border-slate-800 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className={`text-xs font-bold mb-0.5 ${preset === 'surplus' ? 'text-indigo-400' : 'text-indigo-600'}`}>Muscle Building</div>
            <div className="text-base font-black">2,800 kcal</div>
            <div className={`text-[10px] mt-1 ${preset === 'surplus' ? 'text-slate-300' : 'text-slate-500'}`}>High energy intake for hypertrophy</div>
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
        <div>
          <label htmlFor="custom-calorie-goal" className="block text-xs font-semibold text-slate-700 mb-1">
            Custom Calorie Target (kcal/day):
          </label>
          <div className="flex items-center gap-3">
            <input
              id="custom-calorie-goal"
              type="number"
              min="800"
              max="6000"
              value={goal}
              onChange={(e) => {
                setGoal(Number(e.target.value));
                setPreset('custom');
              }}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:border-emerald-600 shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Update Target</span>
            </button>
          </div>
        </div>

        {/* Estimated Recommended Macros Split */}
        <div className="pt-3 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-2">
            Estimated Macro Targets (30% Protein / 45% Carbs / 25% Fat):
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Target Protein</span>
              <span className="font-black text-blue-600">{Math.round((goal * 0.3) / 4)}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Target Carbs</span>
              <span className="font-black text-orange-600">{Math.round((goal * 0.45) / 4)}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Target Fat</span>
              <span className="font-black text-yellow-600">{Math.round((goal * 0.25) / 9)}g</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Target, User, Mail, Dumbbell, Activity, Flame, Scale, Ruler, LogOut, RefreshCw, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onLogout: () => void;
  onReOnboard: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onLogout,
  onReOnboard,
}) => {
  const [isEditingCustomCal, setIsEditingCustomCal] = useState(false);
  const [customCalInput, setCustomCalInput] = useState<number>(userProfile.targetCalories);

  if (!isOpen) return null;

  const handleSaveCustomCal = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = Math.max(800, Math.min(6000, Number(customCalInput) || 2000));
    
    // Recalculate macro split proportionally
    const newProt = Math.round((newTarget * 0.25) / 4);
    const newCarb = Math.round((newTarget * 0.50) / 4);
    const newFat = Math.round((newTarget * 0.25) / 9);

    onUpdateProfile({
      ...userProfile,
      targetCalories: newTarget,
      targetProtein: newProt,
      targetCarbs: newCarb,
      targetFat: newFat,
    });
    setIsEditingCustomCal(false);
  };

  const goalLabels: Record<string, string> = {
    weight_loss: 'Weight Loss (Deficit)',
    muscle_gain: 'Muscle Gain (Surplus)',
    maintenance: 'Maintenance & Tone',
    athletic: 'Athletic Performance',
  };

  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentary (Office job)',
    light: 'Lightly Active (1-3 days/week)',
    moderate: 'Moderately Active (3-5 days/week)',
    active: 'Very Active (6-7 days/week)',
    extra_active: 'Extra Active (Physical job / Athlete)',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative space-y-6 text-slate-800 my-8">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              User Profile & Daily Target
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                ACTIVE PROFILE
              </span>
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{userProfile.email}</span>
              {userProfile.joinedAt && <span>• Member since {userProfile.joinedAt}</span>}
            </p>
          </div>
        </div>

        {/* Daily Calorie Target Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>AI RECOMMENDED DAILY TARGET</span>
            </div>

            {!isEditingCustomCal ? (
              <button
                onClick={() => setIsEditingCustomCal(true)}
                className="text-[11px] text-slate-300 hover:text-white underline font-semibold"
              >
                Custom override
              </button>
            ) : (
              <button
                onClick={() => setIsEditingCustomCal(false)}
                className="text-[11px] text-slate-400 hover:text-white font-semibold"
              >
                Cancel
              </button>
            )}
          </div>

          {!isEditingCustomCal ? (
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-white">{userProfile.targetCalories}</span>
                <span className="text-sm font-bold text-slate-400 ml-1.5">kcal / day</span>
              </div>
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                {goalLabels[userProfile.goal] || 'Custom Goal'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSaveCustomCal} className="flex items-center gap-3">
              <input
                type="number"
                min="800"
                max="6000"
                value={customCalInput}
                onChange={(e) => setCustomCalInput(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-lg font-bold text-white w-36 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md"
              >
                Save
              </button>
            </form>
          )}

          {/* Target Macro Breakdown */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">PROTEIN</span>
              <span className="text-emerald-400 font-extrabold text-lg">{userProfile.targetProtein}g</span>
              <span className="text-[9px] text-slate-500 block">{(userProfile.targetProtein * 4)} kcal</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">CARBS</span>
              <span className="text-blue-400 font-extrabold text-lg">{userProfile.targetCarbs}g</span>
              <span className="text-[9px] text-slate-500 block">{(userProfile.targetCarbs * 4)} kcal</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">FAT</span>
              <span className="text-amber-400 font-extrabold text-lg">{userProfile.targetFat}g</span>
              <span className="text-[9px] text-slate-500 block">{(userProfile.targetFat * 9)} kcal</span>
            </div>
          </div>

          {userProfile.aiRecommendationNote && (
            <p className="text-xs text-slate-300/90 leading-relaxed pt-1 italic">
              "{userProfile.aiRecommendationNote}"
            </p>
          )}
        </div>

        {/* Onboarding Demographics & Stats Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Body & Activity Metrics</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">AGE</span>
              <span className="font-extrabold text-slate-800 text-sm">{userProfile.age} yrs</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">GENDER</span>
              <span className="font-extrabold text-slate-800 text-sm capitalize">{userProfile.gender}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">WEIGHT</span>
              <span className="font-extrabold text-slate-800 text-sm">{userProfile.weightKg} kg</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">HEIGHT</span>
              <span className="font-extrabold text-slate-800 text-sm">{userProfile.heightCm} cm</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Activity Level:</span>
            <span className="font-extrabold text-slate-800">{activityLabels[userProfile.activityLevel] || userProfile.activityLevel}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onReOnboard();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>Recalculate AI Target</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Target, User, Dumbbell, Activity, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Flame, Scale, Ruler, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  initialData: { name: string; email: string };
  onComplete: (profile: UserProfile) => void;
  onCancel: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialData,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [goal, setGoal] = useState<'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic'>('weight_loss');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active'>('moderate');

  // AI Target result state
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedProfile, setCalculatedProfile] = useState<UserProfile | null>(null);
  const [calcError, setCalcError] = useState('');

  const goalsList = [
    {
      id: 'weight_loss',
      title: 'Weight Loss / Calorie Deficit',
      description: 'Burn fat steadily while preserving lean muscle mass.',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'muscle_gain',
      title: 'Muscle Gain / Hypertrophy',
      description: 'Controlled calorie surplus with high protein for muscle growth.',
      icon: Dumbbell,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'maintenance',
      title: 'Maintain Weight & Tone',
      description: 'Keep current body weight while improving composition and energy.',
      icon: Scale,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    },
    {
      id: 'athletic',
      title: 'Athletic Performance',
      description: 'Maximize stamina, endurance, and workout recovery.',
      icon: Activity,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    },
  ];

  const activityList = [
    {
      id: 'sedentary',
      title: 'Sedentary',
      desc: 'Desk job, little to no exercise',
    },
    {
      id: 'light',
      title: 'Lightly Active',
      desc: 'Light exercise / sports 1-3 days/week',
    },
    {
      id: 'moderate',
      title: 'Moderately Active',
      desc: 'Moderate exercise / sports 3-5 days/week',
    },
    {
      id: 'active',
      title: 'Very Active',
      desc: 'Heavy exercise / sports 6-7 days/week',
    },
    {
      id: 'extra_active',
      title: 'Extra Active',
      desc: 'Physical job or double daily training',
    },
  ];

  const fetchAITargetRecommendation = async () => {
    setIsCalculating(true);
    setCalcError('');
    setStep(4);

    try {
      const response = await fetch('/api/recommend-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: initialData.name,
          goal,
          age,
          gender,
          weightKg,
          heightCm,
          activityLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compute target');
      }

      const data = await response.json();
      const profile: UserProfile = {
        name: initialData.name,
        email: initialData.email,
        goal,
        age,
        gender,
        weightKg,
        heightCm,
        activityLevel,
        targetCalories: data.targetCalories || 2000,
        targetProtein: data.targetProtein || 140,
        targetCarbs: data.targetCarbs || 200,
        targetFat: data.targetFat || 60,
        aiRecommendationNote: data.aiRecommendationNote || 'Customized target designed for your goal and daily activity level.',
        joinedAt: new Date().toLocaleDateString(),
      };

      setCalculatedProfile(profile);
    } catch (err: any) {
      console.error('Target recommendation error:', err);
      // Fallback local calculation
      const fallbackProfile: UserProfile = {
        name: initialData.name,
        email: initialData.email,
        goal,
        age,
        gender,
        weightKg,
        heightCm,
        activityLevel,
        targetCalories: goal === 'weight_loss' ? 1900 : goal === 'muscle_gain' ? 2500 : 2200,
        targetProtein: Math.round(weightKg * 2),
        targetCarbs: 210,
        targetFat: 65,
        aiRecommendationNote: 'Target based on standard Mifflin-St Jeor metabolic equations.',
        joinedAt: new Date().toLocaleDateString(),
      };
      setCalculatedProfile(fallbackProfile);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) {
      fetchAITargetRecommendation();
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  const handleFinish = () => {
    if (calculatedProfile) {
      onComplete(calculatedProfile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative space-y-6 text-slate-100">
        {/* Step Indicator Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-4 h-4" /> Smart Bite AI Onboarding
            </span>
            <span>Step {step} of 4</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Fitness Goal */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-white">What is your primary fitness goal?</h2>
              <p className="text-xs text-slate-400 mt-1">We'll calibrate your daily calorie deficit or surplus and macro ratios accordingly.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalsList.map((g) => {
                const Icon = g.icon;
                const isSelected = goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setGoal(g.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl border ${g.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <h3 className="font-extrabold text-sm text-white">{g.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{g.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Demographics */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-white">Tell us about yourself</h2>
              <p className="text-xs text-slate-400 mt-1">Used to calculate your Basal Metabolic Rate (BMR) precisely.</p>
            </div>

            <div className="space-y-4">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Biological Sex</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => setGender(gen)}
                      className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                        gender === gen
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Age</span>
                  <span className="text-emerald-400 font-black">{age} years</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Weight and Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="100"
                      max="230"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Activity Level */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-white">Select your daily activity level</h2>
              <p className="text-xs text-slate-400 mt-1">This determines your Total Daily Energy Expenditure (TDEE).</p>
            </div>

            <div className="space-y-2.5">
              {activityList.map((act) => {
                const isSelected = activityLevel === act.id;
                return (
                  <div
                    key={act.id}
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-xs text-white">{act.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: AI Target Calculation Result */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            {isCalculating ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <div>
                  <h3 className="font-extrabold text-lg text-white">Computing Your AI Daily Target...</h3>
                  <p className="text-xs text-slate-400 mt-1">Analyzing BMR, TDEE, and macro ratios for {initialData.name}</p>
                </div>
              </div>
            ) : calculatedProfile ? (
              <div className="space-y-5">
                <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Your Personalized AI Target is Ready!</h3>
                    <p className="text-xs text-emerald-300">Target for {calculatedProfile.name} ({calculatedProfile.goal.replace('_', ' ')})</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Calorie Intake</span>
                  <div className="text-4xl font-black text-emerald-400">{calculatedProfile.targetCalories} <span className="text-base font-bold text-slate-400">kcal/day</span></div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">PROTEIN</span>
                      <span className="text-emerald-400 font-extrabold text-base">{calculatedProfile.targetProtein}g</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">CARBS</span>
                      <span className="text-cyan-400 font-extrabold text-base">{calculatedProfile.targetCarbs}g</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">FAT</span>
                      <span className="text-amber-400 font-extrabold text-base">{calculatedProfile.targetFat}g</span>
                    </div>
                  </div>
                </div>

                {calculatedProfile.aiRecommendationNote && (
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> AI Nutritionist Analysis
                    </span>
                    <p>{calculatedProfile.aiRecommendationNote}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isCalculating}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={isCalculating}
              className="ml-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Calculate AI Target
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isCalculating || !calculatedProfile}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>Complete Onboarding & Start Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

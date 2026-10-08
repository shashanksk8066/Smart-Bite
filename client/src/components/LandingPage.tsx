import React, { useState } from 'react';
import { Utensils, Sparkles, Camera, ArrowRight, ShieldCheck, Dumbbell, Target, CheckCircle2, UserCheck, LogIn, UserPlus, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onStartRegistration: (initialUser: { name: string; email: string }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  onStartRegistration,
}) => {
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'register'>('none');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in both email and password.');
      return;
    }

    // Default demo user check
    if (
      (loginEmail.toLowerCase() === 'user@smartbite.ai' || loginEmail.toLowerCase() === 'demo@smartbite.ai') &&
      loginPassword === 'password123'
    ) {
      const demoUser: UserProfile = {
        name: 'Alex Rivera',
        email: loginEmail,
        goal: 'weight_loss',
        age: 28,
        gender: 'male',
        weightKg: 75,
        heightCm: 178,
        activityLevel: 'moderate',
        targetCalories: 2100,
        targetProtein: 150,
        targetCarbs: 210,
        targetFat: 60,
        aiRecommendationNote: 'Targeting a 500 kcal deficit to promote steady 0.5kg/week fat loss while maintaining muscle mass.',
        joinedAt: new Date().toLocaleDateString(),
      };
      onLoginSuccess(demoUser);
      return;
    }

    try {
      const res = await fetch(`/api/users/${loginEmail}`);
      if (res.ok) {
        const user = await res.json();
        onLoginSuccess(user);
      } else {
        setLoginError('Invalid email or user not found. Try demo: user@smartbite.ai / password123');
      }
    } catch (e) {
      console.error(e);
      setLoginError('Failed to connect to server.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please complete all registration fields.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password should be at least 6 characters.');
      return;
    }

    // Trigger multi-step onboarding
    onStartRegistration({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
    });
  };

  const fillDemoLogin = () => {
    setLoginEmail('user@smartbite.ai');
    setLoginPassword('password123');
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Utensils className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-white">Smart Bite</span>
              <span className="ml-2 text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full uppercase">
                AI NUTRITION
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAuthMode('login')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => setAuthMode('register')}
              className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Instant AI Meal Recognition & Accompaniment Detection</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Snap a Photo. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Know Every Calorie & Macro.
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Smart Bite automatically detects every single food item, side dish, sauce, garnish, and beverage on your plate. Get AI-recommended daily targets customized to your goal, height, weight, and activity.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => setAuthMode('register')}
                className="px-8 py-4 rounded-2xl text-base font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 group"
              >
                <span>Register & Onboard Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setAuthMode('login');
                  fillDemoLogin();
                }}
                className="px-6 py-4 rounded-2xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Try Demo Account</span>
              </button>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-slate-300 text-xs font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Item Plate Recognition</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Daily Target Recommendation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live Floating AI Coach</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Smart AI Target Calculation</h3>
                    <p className="text-[11px] text-slate-400">Tailored to your goal & demographics</p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  AI PRECISION
                </span>
              </div>

              {/* Mock Target Preview Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Recommended Calorie Goal</span>
                  <span className="text-emerald-400 font-extrabold text-lg">2,100 kcal/day</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Protein</span>
                    <span className="text-emerald-400 font-bold text-sm">150g</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Carbs</span>
                    <span className="text-cyan-400 font-bold text-sm">210g</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Fat</span>
                    <span className="text-amber-400 font-bold text-sm">60g</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-200/90 leading-relaxed">
                  💡 <strong>AI Coach Note:</strong> Target is optimized for moderate weight loss with high protein to preserve lean muscle tissue.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {authMode !== 'none' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setAuthMode('none')}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 text-xs font-bold"
            >
              ✕
            </button>

            {authMode === 'login' ? (
              <>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <LogIn className="w-6 h-6 text-emerald-400" /> Sign In to Smart Bite
                  </h3>
                  <p className="text-xs text-slate-400">Access your food logs, daily target, and AI nutrition assistant</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 font-medium">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all text-sm"
                  >
                    Sign In
                  </button>
                </form>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Need demo access?</span>
                  <button
                    type="button"
                    onClick={fillDemoLogin}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Fill Demo Credentials
                  </button>
                </div>

                <div className="text-center text-xs text-slate-400 pt-2">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setLoginError('');
                    }}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Register here
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-emerald-400" /> Create Account
                  </h3>
                  <p className="text-xs text-slate-400">Step 1 of 2: Create your credentials to start onboarding</p>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 font-medium">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center text-xs text-slate-400 pt-2">
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setRegError('');
                    }}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Smart Bite AI Nutrition & Daily Target Coach • Powered by Gemini AI
      </footer>
    </div>
  );
};

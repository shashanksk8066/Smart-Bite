import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ScanProgress } from './components/ScanProgress';
import { NutritionalSummary } from './components/NutritionalSummary';
import { FoodItemsList } from './components/FoodItemsList';
import { MealJournal } from './components/MealJournal';
import { ProfileModal } from './components/ProfileModal';
import { LandingPage } from './components/LandingPage';
import { OnboardingModal } from './components/OnboardingModal';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { StreaksPage } from './components/StreaksPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { ActivityPage } from './components/ActivityPage';
import { BuildYourMeal } from './components/BuildYourMeal';
import { VoiceMealLogger } from './components/VoiceMealLogger';
import { FoodAnalysisResult, FoodItem, SavedMeal, UserProfile, ExerciseLog } from './types';
import { AlertTriangle, RefreshCw, ShieldCheck, Utensils, Sparkles, Camera, ChefHat, Mic } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'journal' | 'goals' | 'streaks' | 'leaderboard' | 'activity'>('scan');
  
  // Onboarding modal state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingInitialData, setOnboardingInitialData] = useState<{ name: string; email: string } | null>(null);

  // Scanner & App states
  const [mealLogMode, setMealLogMode] = useState<'scan' | 'build' | 'voice'>('scan');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [dailyGoalCalories, setDailyGoalCalories] = useState<number>(2100);
  const [isCurrentMealSaved, setIsCurrentMealSaved] = useState(false);

  // Load session & saved state on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedEmail = localStorage.getItem('smartbite_session_email');
        if (storedEmail) {
          const res = await fetch(`/api/users/${storedEmail}`);
          if (res.ok) {
            const parsedUser: UserProfile = await res.json();
            setCurrentUser(parsedUser);
            if (parsedUser.targetCalories) {
              setDailyGoalCalories(parsedUser.targetCalories);
            }
            
            // Load meals from API
            const mealsRes = await fetch(`/api/meals?email=${storedEmail}`);
            if (mealsRes.ok) {
              setSavedMeals(await mealsRes.json());
            }

            // Load exercises from API
            const exerciseRes = await fetch(`/api/exercises?email=${storedEmail}`);
            if (exerciseRes.ok) {
              setExerciseLogs(await exerciseRes.json());
            }
          }
        }
      } catch (e) {
        console.error('Failed to load state from API:', e);
      }
    }
    loadData();
  }, [activeTab]);

  // Save user profile state
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    setDailyGoalCalories(updatedProfile.targetCalories);
    try {
      localStorage.setItem('smartbite_session_email', updatedProfile.email); // Keep session email locally just to know who is logged in
      
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
    } catch (e) {
      console.error('Failed to persist user profile:', e);
    }
  };

  // Login handler
  const handleLoginSuccess = (user: UserProfile) => {
    handleUpdateProfile(user);
    setActiveTab('scan');
  };

  // Start registration -> triggers onboarding
  const handleStartRegistration = (initial: { name: string; email: string }) => {
    setOnboardingInitialData(initial);
    setIsOnboardingOpen(true);
  };

  // Onboarding completion
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setIsOnboardingOpen(false);
    setOnboardingInitialData(null);
    handleUpdateProfile(newProfile);
    setActiveTab('scan');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setSavedMeals([]);
    localStorage.removeItem('smartbite_session_email');
    setActiveTab('scan');
  };

  // Fetch latest meals from DB
  const refreshMeals = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/meals?email=${currentUser.email}`);
      if (res.ok) setSavedMeals(await res.json());
    } catch (e) {
      console.error('Failed to load meals from API:', e);
    }
  };

  // Analyze image via server API
  const handleAnalyzeFood = async (base64Image: string, customPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentImage(base64Image);
    setIsCurrentMealSaved(false);

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          customPrompt: customPrompt,
          userProfile: currentUser,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data: FoodAnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Error analyzing food image:', err);
      setError(err.message || 'An unexpected error occurred while analyzing the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate totals when foods change
  const recalculateAnalysisTotals = (foods: FoodItem[]): FoodAnalysisResult => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;

    foods.forEach((item) => {
      const q = item.quantity || 1;
      totalCalories += Math.round(item.calories * q);
      totalProtein += item.protein * q;
      totalCarbs += item.carbs * q;
      totalFat += item.fat * q;
      totalFiber += (item.fiber || 0) * q;
      totalSugar += (item.sugar || 0) * q;
    });

    totalProtein = Math.round(totalProtein * 10) / 10;
    totalCarbs = Math.round(totalCarbs * 10) / 10;
    totalFat = Math.round(totalFat * 10) / 10;
    totalFiber = Math.round(totalFiber * 10) / 10;
    totalSugar = Math.round(totalSugar * 10) / 10;

    let healthScore = 75;
    if (foods.length > 0 && totalCalories > 0) {
      const proteinCalPct = (totalProtein * 4) / totalCalories;
      const fiberBonus = Math.min(15, totalFiber * 2);
      const sugarPenalty = Math.min(20, totalSugar * 0.8);

      if (proteinCalPct >= 0.2) healthScore += 10;
      if (proteinCalPct < 0.1) healthScore -= 10;
      healthScore += fiberBonus - sugarPenalty;
      healthScore = Math.max(30, Math.min(98, Math.round(healthScore)));
    }

    return {
      ...(analysisResult || {
        description: 'Meal analysis',
        mealType: 'lunch',
      }),
      foods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSugar,
      healthScore,
    };
  };

  // Item quantity update
  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (!analysisResult) return;
    const updatedFoods = [...analysisResult.foods];
    updatedFoods[index] = { ...updatedFoods[index], quantity: newQty };
    setAnalysisResult(recalculateAnalysisTotals(updatedFoods));
    setIsCurrentMealSaved(false);
  };

  // Item remove
  const handleRemoveItem = (index: number) => {
    if (!analysisResult) return;
    const updatedFoods = analysisResult.foods.filter((_, idx) => idx !== index);
    setAnalysisResult(recalculateAnalysisTotals(updatedFoods));
    setIsCurrentMealSaved(false);
  };

  // Add custom item
  const handleAddItem = (newItem: FoodItem) => {
    if (!analysisResult) return;
    const updatedFoods = [...analysisResult.foods, newItem];
    setAnalysisResult(recalculateAnalysisTotals(updatedFoods));
    setIsCurrentMealSaved(false);
  };

  // Save current meal
  const handleSaveMeal = async () => {
    if (!analysisResult || !currentUser) return;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSavedMeal = {
      id: `meal-${Date.now()}`,
      user_email: currentUser.email,
      date: dateStr,
      time: timeStr,
      imageUrl: currentImage || undefined,
      analysis: analysisResult,
    };

    try {
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSavedMeal)
      });
      await refreshMeals();
      setIsCurrentMealSaved(true);
    } catch (e) {
      console.error('Failed to save meal to DB:', e);
    }
  };

  // Delete saved meal
  const handleDeleteMeal = async (id: string) => {
    try {
      await fetch(`/api/meals/${id}`, { method: 'DELETE' });
      await refreshMeals();
    } catch (e) {
      console.error('Failed to delete meal from DB:', e);
    }
  };

  // Reset current scan
  const handleResetScan = () => {
    setAnalysisResult(null);
    setCurrentImage(null);
    setError(null);
    setIsCurrentMealSaved(false);
  };

  // Calculate today's totals
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = savedMeals.filter((m) => m.date === todayStr);
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.analysis.totalCalories || 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.analysis.totalProtein || 0), 0);
  const todayCarbs = todayMeals.reduce((sum, m) => sum + (m.analysis.totalCarbs || 0), 0);
  const todayFat = todayMeals.reduce((sum, m) => sum + (m.analysis.totalFat || 0), 0);

  const todayExercises = exerciseLogs.filter((e) => e.date === todayStr);
  const todayBurned = todayExercises.reduce((sum, e) => sum + (e.calories_burned || 0), 0);

  // IF NOT LOGGED IN -> Show Landing Page & Onboarding
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onLoginSuccess={handleLoginSuccess}
          onStartRegistration={handleStartRegistration}
        />

        {isOnboardingOpen && onboardingInitialData && (
          <OnboardingModal
            initialData={onboardingInitialData}
            onComplete={handleOnboardingComplete}
            onCancel={() => setIsOnboardingOpen(false)}
          />
        )}
      </>
    );
  }

  // IF LOGGED IN -> Show Main Application Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedMeals.length}
        todayCalories={todayCalories}
        dailyGoalCalories={dailyGoalCalories}
        userName={currentUser.name}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: SCANNER & MEAL BUILDER */}
        {activeTab === 'scan' && (
          <div className="space-y-8">
            {!isLoading && !analysisResult && (
              <div className="flex p-1.5 bg-slate-200/80 backdrop-blur-sm rounded-2xl max-w-lg mx-auto shadow-inner border border-slate-300/60">
                <button
                  onClick={() => setMealLogMode('scan')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mealLogMode === 'scan'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Photo Scan</span>
                </button>
                <button
                  onClick={() => setMealLogMode('build')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mealLogMode === 'build'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Build Meal</span>
                </button>
                <button
                  onClick={() => setMealLogMode('voice')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mealLogMode === 'voice'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Speak / Voice</span>
                </button>
              </div>
            )}

            {!isLoading && !analysisResult && mealLogMode === 'scan' && (
              <ImageUploader
                onImageSelected={handleAnalyzeFood}
                isLoading={isLoading}
                dailyGoalCalories={dailyGoalCalories}
                todayCalories={todayCalories}
                todayProtein={todayProtein}
                todayCarbs={todayCarbs}
                todayFat={todayFat}
                todayBurned={todayBurned}
              />
            )}

            {!isLoading && !analysisResult && mealLogMode === 'build' && (
              <BuildYourMeal
                onCompleteMeal={(customAnalysis) => {
                  setAnalysisResult(customAnalysis);
                  setCurrentImage(null);
                  setIsCurrentMealSaved(false);
                }}
                dailyGoalCalories={dailyGoalCalories}
                todayCalories={todayCalories}
                todayProtein={todayProtein}
                todayCarbs={todayCarbs}
                todayFat={todayFat}
              />
            )}

            {!isLoading && !analysisResult && mealLogMode === 'voice' && (
              <VoiceMealLogger
                onAnalysisComplete={(voiceAnalysis) => {
                  setAnalysisResult(voiceAnalysis);
                  setCurrentImage(null);
                  setIsCurrentMealSaved(false);
                }}
                userProfile={currentUser}
                dailyGoalCalories={dailyGoalCalories}
                todayCalories={todayCalories}
              />
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-800 flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-rose-900">Analysis Failed</h4>
                  <p className="text-xs text-rose-700 mt-1">{error}</p>
                  <button
                    onClick={handleResetScan}
                    className="mt-3 px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold rounded-lg transition-colors border border-rose-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <ScanProgress imagePreviewUrl={currentImage || undefined} />
            )}

            {!isLoading && analysisResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {currentImage ? (
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 group h-64 sm:h-72">
                        <img
                          src={currentImage}
                          alt="Analyzed food dish"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5" /> AI Verified
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Analyzed plate layout</span>
                        <button
                          onClick={handleResetScan}
                          className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Change Photo
                        </button>
                      </div>

                      {/* Healthy Alternatives Section Below Image */}
                      {analysisResult.alternatives && analysisResult.alternatives.length > 0 && (
                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner">
                          <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Healthy Alternatives
                          </h4>
                          <div className="space-y-2">
                            {analysisResult.alternatives.map((alt, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
                                <p className="text-sm font-medium text-slate-800">
                                  <span className="line-through text-slate-400 mr-2">{alt.original}</span>
                                  <span className="text-emerald-600">→ {alt.alternative}</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{alt.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="lg:col-span-1 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="space-y-4 relative z-10">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit border border-emerald-500/30">
                          {mealLogMode === 'voice' ? (
                            <Mic className="w-8 h-8 text-teal-300" />
                          ) : (
                            <ChefHat className="w-8 h-8 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-1">
                            {mealLogMode === 'voice' ? 'AI Voice Recognition' : 'Custom Handcrafted Meal'}
                          </span>
                          <h3 className="text-lg font-black text-white leading-tight">
                            {analysisResult.description}
                          </h3>
                        </div>
                        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meal Type</span>
                          <span className="text-xs font-extrabold text-emerald-400 capitalize bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            {analysisResult.mealType}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
                        <span>{mealLogMode === 'voice' ? 'Spoken speech estimation' : 'Subway-style portion tray'}</span>
                        <button
                          onClick={handleResetScan}
                          className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Log Another Meal
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="lg:col-span-2">
                    <NutritionalSummary
                      analysis={analysisResult}
                      onSaveMeal={handleSaveMeal}
                      isSaved={isCurrentMealSaved}
                      onReset={handleResetScan}
                    />
                  </div>
                </div>

                <FoodItemsList
                  foods={analysisResult.foods}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onAddItem={handleAddItem}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEAL JOURNAL */}
        {activeTab === 'journal' && (
          <MealJournal
            savedMeals={savedMeals}
            onDeleteMeal={handleDeleteMeal}
            dailyGoalCalories={dailyGoalCalories}
          />
        )}

        {/* TAB 3: PROFILE & DAILY TARGET */}
        {activeTab === 'goals' && (
          <ProfileModal
            isOpen={true}
            onClose={() => setActiveTab('scan')}
            userProfile={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onReOnboard={() => {
              setOnboardingInitialData({ name: currentUser.name, email: currentUser.email });
              setIsOnboardingOpen(true);
            }}
          />
        )}
        {/* TAB 4: STREAKS */}
        {activeTab === 'streaks' && (
          <StreaksPage
            savedMeals={savedMeals}
            dailyGoalCalories={dailyGoalCalories}
          />
        )}
        {/* TAB 5: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <LeaderboardPage
            currentUserEmail={currentUser?.email || ''}
          />
        )}
        {/* TAB 6: ACTIVITY */}
        {activeTab === 'activity' && (
          <ActivityPage
            currentUserEmail={currentUser?.email || ''}
            weightKg={currentUser?.weightKg || 70}
          />
        )}
      </main>

      {/* Re-Onboarding Modal inside app if triggered */}
      {isOnboardingOpen && onboardingInitialData && (
        <OnboardingModal
          initialData={onboardingInitialData}
          onComplete={(profile) => {
            setIsOnboardingOpen(false);
            handleUpdateProfile(profile);
          }}
          onCancel={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">Smart Bite</span>
            <span>— Precision Food Item & Accompaniment Nutrition Recognition</span>
          </div>
          <div className="text-slate-400">
            Logged in as <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.email})
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant
        dailyGoalCalories={dailyGoalCalories}
        todayCalories={todayCalories}
        todayProtein={todayProtein}
        todayCarbs={todayCarbs}
        todayFat={todayFat}
        savedMeals={savedMeals}
      />
    </div>
  );
}

export interface FoodItem {
  id?: string;
  name: string;
  quantity: number;
  servingSize: string;
  confidence: number;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  isAccompaniment?: boolean;
}

export interface FoodAnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number;
  totalSugar?: number;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage' | 'unknown';
  healthScore?: number;
  dietaryInsights?: string[];
  mealFeedback?: string;
  alternatives?: { original: string; alternative: string; reason: string }[];
  analyzedAt?: string;
  imageUrl?: string;
}

export interface SavedMeal {
  id: string;
  date: string;
  time: string;
  imageUrl?: string;
  analysis: FoodAnalysisResult;
  customNotes?: string;
}

export interface SampleFoodImage {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  itemsPreview: string[];
}

export interface MealSuggestion {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  itemsPreview: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  whySuggested?: string;
  customPrompt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic';
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  aiRecommendationNote?: string;
  joinedAt?: string;
}

export interface ExerciseLog {
  id: string;
  user_email?: string;
  date: string;
  time: string;
  type: string;
  duration_minutes: number;
  intensity: 'light' | 'moderate' | 'high';
  calories_burned: number;
}


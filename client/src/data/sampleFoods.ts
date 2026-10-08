import { SampleFoodImage, MealSuggestion } from '../types';

export const DEFAULT_MEAL_SUGGESTIONS: MealSuggestion[] = [
  {
    id: 'mediterranean-thali',
    title: 'Healthy Salmon & Quinoa Grain Bowl',
    category: 'High Protein',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    description: 'Seared Atlantic salmon fileted over fluffy quinoa, sliced avocado, cherry tomatoes, steamed broccoli, and lemon tahini dressing.',
    itemsPreview: ['Seared Salmon Filet', 'Fluffy Quinoa', 'Sliced Fresh Avocado', 'Roasted Cherry Tomatoes', 'Steamed Broccoli', 'Tahini Lemon Dressing'],
    calories: 520,
    protein: 38,
    carbs: 45,
    fat: 18,
    whySuggested: 'Optimal high-protein dinner plate that delivers 38g protein with clean complex carbs to close your remaining budget without sugar spikes.',
    customPrompt: 'Seared Atlantic salmon over fluffy quinoa, sliced avocado, cherry tomatoes, steamed broccoli, and lemon tahini dressing'
  },
  {
    id: 'biryani-combo',
    title: 'Chicken Dum Biryani Plate with Raita',
    category: 'Balanced Dinner',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop',
    description: 'Aromatic Chicken Dum Biryani served with cucumber raita, spicy mirchi ka salan, and sliced raw onion with lemon wedge.',
    itemsPreview: ['Chicken Dum Biryani', 'Cucumber Raita', 'Mirchi Salan', 'Sliced Raw Red Onion', 'Lemon Wedge'],
    calories: 680,
    protein: 34,
    carbs: 72,
    fat: 22,
    whySuggested: 'Filling, nutrient-dense meal option to fulfill energy requirements while supplying essential lean protein and soothing probiotics from raita.',
    customPrompt: 'Chicken Dum Biryani plate with cucumber raita, spicy mirchi ka salan, and sliced raw onion with lemon'
  },
  {
    id: 'sushi-platter',
    title: 'Deluxe Salmon & Tuna Sushi Platter',
    category: 'Lean & Clean',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop',
    description: 'Assorted Salmon Nigiri, Spicy Tuna Roll, Edamame, Pickled Ginger (Gari), Wasabi Paste, and Low-sodium Soy Sauce.',
    itemsPreview: ['Salmon Nigiri (4 pcs)', 'Spicy Tuna Roll (6 pcs)', 'Steamed Edamame Pods', 'Pickled Ginger', 'Wasabi Paste'],
    calories: 450,
    protein: 32,
    carbs: 52,
    fat: 10,
    whySuggested: 'Low-fat, heart-healthy omega-3 source perfect for a light evening meal that keeps you comfortably under calorie limits.',
    customPrompt: 'Salmon Nigiri, Spicy Tuna Roll, Edamame, Pickled Ginger, Wasabi Paste, and Soy Sauce'
  },
  {
    id: 'pancake-breakfast',
    title: 'Berry Pancake & Bacon Power Breakfast',
    category: 'Morning Energy',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop',
    description: 'Stack of 3 buttermilk pancakes topped with butter pat, fresh blueberries, strawberries, maple syrup drizzle, and crispy bacon strips.',
    itemsPreview: ['Buttermilk Pancakes (3)', 'Pure Maple Syrup Drizzle', 'Fresh Strawberries & Blueberries', 'Crispy Bacon Strips (2)'],
    calories: 580,
    protein: 18,
    carbs: 78,
    fat: 20,
    whySuggested: 'High-energy breakfast feast with antioxidant-rich berries to jumpstart your daily calorie target with fast-acting fuel.',
    customPrompt: 'Buttermilk pancakes with maple syrup, fresh blueberries, strawberries, and crispy bacon strips'
  }
];

export const SAMPLE_FOOD_IMAGES: SampleFoodImage[] = DEFAULT_MEAL_SUGGESTIONS;


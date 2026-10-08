import { Router } from "express";
import { getGeminiClient, callGeminiWithRetryAndFallback } from "../gemini.ts";

export const suggestMealsRouter = Router();

suggestMealsRouter.post("/suggest-meals", async (req, res) => {
  try {
    const {
      dailyGoalCalories = 2000,
      todayCalories = 0,
      remainingCalories = 800,
      todayProtein = 0,
      todayCarbs = 0,
      todayFat = 0,
      dietaryPreference = "Balanced",
    } = req.body;

    const ai = getGeminiClient();

    const promptText = `The user's daily target is ${dailyGoalCalories} kcal. Current intake today: ${todayCalories} kcal (Protein: ${todayProtein}g, Carbs: ${todayCarbs}g, Fat: ${todayFat}g).
They have ${remainingCalories} kcal remaining for today. Dietary preference: ${dietaryPreference}.

Generate 4 realistic, appetizing meal or snack options that fit well within their remaining target of ${remainingCalories} kcal and help balance their daily macros.

CRITICAL INSTRUCTIONS:
1. Return 4 distinct options (e.g., High Protein Bowl, Balanced Meal, Quick Light Snack, Protein Power Plate).
2. For each option, provide realistic calories (close to or less than ${remainingCalories} kcal), protein(g), carbs(g), fat(g).
3. Include specific food items and accompaniments (e.g. garnishes, dips, sides).
4. Provide a 'whySuggested' string explaining why this meal fits their remaining target (e.g., "Provides 35g protein to hit your daily goal while staying under your remaining 600 kcal limit.").
5. Use high quality, relevant Unsplash food images from standard food photo categories.

Return JSON strictly in this structure:
{
  "suggestions": [
    {
      "id": "suggest-1",
      "title": "Seared Salmon & Quinoa Grain Bowl",
      "category": "High Protein",
      "calories": 480,
      "protein": 36,
      "carbs": 42,
      "fat": 16,
      "description": "Grilled salmon over quinoa, avocado, steamed broccoli, and lemon tahini dressing.",
      "itemsPreview": ["Grilled Salmon Filet", "Fluffy Quinoa", "Steamed Broccoli", "Avocado Slices", "Lemon Tahini Dressing"],
      "whySuggested": "Delivers 36g protein to meet your muscle needs while filling 60% of your remaining 800 kcal budget.",
      "url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
      "customPrompt": "Seared Atlantic Salmon over fluffy quinoa with avocado and steamed broccoli"
    }
  ]
}`;

    const response = await callGeminiWithRetryAndFallback(ai, {
      contents: {
        parts: [{ text: promptText }],
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const rawText = response.text || "";
    let parsedData;

    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/suggest-meals:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI meal suggestions.",
    });
  }
});

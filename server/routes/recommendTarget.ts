import { Router } from "express";
import { getGeminiClient, callGeminiWithRetryAndFallback } from "../gemini.ts";

export const recommendTargetRouter = Router();

recommendTargetRouter.post("/recommend-target", async (req, res) => {
  try {
    const { name, goal, age, gender, weightKg, heightCm, activityLevel } = req.body;

    // Calculate BMR using Mifflin-St Jeor Formula
    let bmr = 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra_active: 1.9,
    };

    const multiplier = activityMultipliers[activityLevel] || 1.375;
    let tdee = Math.round(bmr * multiplier);

    // Goal adjustment
    let recommendedCalories = tdee;
    if (goal === 'weight_loss') {
      recommendedCalories = Math.round(tdee - 500); // ~0.5kg/week loss
    } else if (goal === 'muscle_gain') {
      recommendedCalories = Math.round(tdee + 350); // lean gain surplus
    } else if (goal === 'athletic') {
      recommendedCalories = Math.round(tdee + 150);
    }
    // ensure safe floor
    recommendedCalories = Math.max(1200, recommendedCalories);

    // Macro breakdown
    // Protein: weightLoss (2.0g/kg), muscleGain (2.2g/kg), athletic (1.8g/kg), maintenance (1.6g/kg)
    let proteinPerKg = 1.6;
    if (goal === 'muscle_gain') proteinPerKg = 2.2;
    if (goal === 'weight_loss') proteinPerKg = 2.0;
    if (goal === 'athletic') proteinPerKg = 1.8;

    const targetProtein = Math.round(Number(weightKg) * proteinPerKg);
    const proteinCalories = targetProtein * 4;

    // Fat: ~25% of total calories
    const targetFat = Math.round((recommendedCalories * 0.25) / 9);
    const fatCalories = targetFat * 9;

    // Carbs: remaining calories
    const carbCalories = Math.max(200, recommendedCalories - proteinCalories - fatCalories);
    const targetCarbs = Math.round(carbCalories / 4);

    let aiExplanation = "";
    try {
      const ai = getGeminiClient();
      const prompt = `You are an expert AI nutritionist creating a personalized target summary for ${name || 'User'}.
User Profile:
- Goal: ${goal}
- Age: ${age}, Gender: ${gender}
- Weight: ${weightKg} kg, Height: ${heightCm} cm
- Activity Level: ${activityLevel}
- Calculated BMR: ${Math.round(bmr)} kcal, TDEE: ${tdee} kcal
- Recommended Daily Target: ${recommendedCalories} kcal
- Target Macros: Protein ${targetProtein}g, Carbs ${targetCarbs}g, Fat ${targetFat}g

Provide a warm, encouraging 2-3 sentence personalized AI note explaining why this ${recommendedCalories} kcal target and macro ratio is optimal for their goal.`;

      const response = await callGeminiWithRetryAndFallback(ai, {
        contents: { parts: [{ text: prompt }] },
        config: { temperature: 0.4 },
      });

      aiExplanation = response.text || "";
    } catch (err) {
      console.warn("AI explanation fallback used:", err);
      aiExplanation = `Based on your ${goal.replace('_', ' ')} goal and ${activityLevel} activity level, this target provides optimal energy while ensuring sufficient protein for recovery.`;
    }

    res.json({
      targetCalories: recommendedCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      bmr: Math.round(bmr),
      tdee,
      aiRecommendationNote: aiExplanation.trim(),
    });
  } catch (error: any) {
    console.error("Error in /api/recommend-target:", error);
    res.status(500).json({ error: error.message || "Failed to calculate daily target." });
  }
});

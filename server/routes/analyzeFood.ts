import { Router } from "express";
import { getGeminiClient, callGeminiWithRetryAndFallback } from "../gemini.ts";

export const analyzeFoodRouter = Router();

analyzeFoodRouter.post("/analyze-food", async (req, res) => {
  try {
    const { image, customPrompt, userProfile } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided for analysis." });
    }

    // Extract base64 data and mimeType
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.startsWith("data:")) {
      const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      }
    }

    const ai = getGeminiClient();

    const promptText =
      customPrompt ||
      `Analyze this food image in detail. Identify EVERY food item, accompaniment, side dish, sauce, garnish, and beverage. Return accurate portion sizes and precise nutritional estimates per item according to the instructions.`;

    let userContext = "";
    if (userProfile) {
      userContext = `
USER PROFILE CONTEXT:
The user's goal is: ${userProfile.goal} (Target: ${userProfile.targetCalories} kcal/day). 
They weigh ${userProfile.weightKg}kg, height ${userProfile.heightCm}cm, age ${userProfile.age}, gender ${userProfile.gender}, activity level: ${userProfile.activityLevel}.
Their macro targets are: ${userProfile.targetProtein}g Protein, ${userProfile.targetCarbs}g Carbs, ${userProfile.targetFat}g Fat.

IMPORTANT: Provide a personalized 'mealFeedback' string (2-3 sentences) analyzing this specific meal against their goals. Suggest small tweaks or praise their choices based on their profile.
`;
    }

    const systemInstruction = `You are an expert food nutritionist and recognition AI. Your job is to accurately identify ALL food items in an image and provide precise nutritional estimates.
${userContext}
CRITICAL INSTRUCTIONS:
1. Identify EVERY SINGLE food item visible in the image - DO NOT MISS ANYTHING.
2. Include ALL accompaniments: side dishes, garnishes, dips, sauces, onion slices, lemon wedges, chutneys, raita, pickles, condiments, breads, drinks, etc.
3. For combo meals/plates with multiple items, list EACH item separately (e.g., burger, fries, and soda separately).
4. Be SPECIFIC about the food type (e.g., "Chicken Dum Biryani" not just "Biryani", "Mint Coriander Chutney" not just "Green Sauce").
5. Estimate portion sizes based on visual cues.
6. Provide accurate calorie and macro estimates based on typical serving sizes.
7. Count quantities correctly (e.g., 3 onion rings = quantity: 3).

NUTRITIONAL ACCURACY GUIDELINES (per typical serving):
- Provide highly realistic estimates for Calories, Protein (g), Carbs (g), Fat (g), Fiber (g), and Sugar (g).
- If an item is a low-calorie garnish (like a mint leaf or single slice of onion), accurately report the negligible calories (e.g., 2-5 calories).
- If you detect unhealthy, fried, highly processed, or high-sugar foods, provide healthier alternative suggestions in the 'alternatives' array.

Return your response as a JSON object with this EXACT structure:
{
  "foods": [
    {
      "name": "Specific Food Name",
      "quantity": 1,
      "servingSize": "1 medium bowl (150g)",
      "confidence": 0.95,
      "category": "fast food/fruit/vegetable/meat/dairy/grain/beverage/dessert",
      "calories": 250,
      "protein": 12,
      "carbs": 30,
      "fat": 8,
      "fiber": 3,
      "sugar": 5
    }
  ],
  "totalCalories": 250,
  "totalProtein": 12,
  "totalCarbs": 30,
  "totalFat": 8,
  "description": "Description of the meal/plate including all identified items",
  "mealType": "breakfast/lunch/dinner/snack/beverage",
  "mealFeedback": "Personalized feedback analyzing this meal against the user's goals (if available). Provide 2-3 sentences of actionable advice or encouragement.",
  "alternatives": [
    {
      "original": "French Fries",
      "alternative": "Baked potato wedges",
      "reason": "Lower in fat and calories"
    }
  ]
}

If no food is detected, return:
{
  "foods": [],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "description": "No food detected in the image",
  "mealType": "unknown",
  "mealFeedback": "I couldn't detect any food. Please try uploading a clearer image."
}`;

    const response = await callGeminiWithRetryAndFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
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

    let foods = parsedData.foods || [];

    let computedCalories = 0;
    let computedProtein = 0;
    let computedCarbs = 0;
    let computedFat = 0;
    let computedFiber = 0;
    let computedSugar = 0;

    foods = foods.map((item: any, idx: number) => {
      const qty = item.quantity || 1;
      const cals = Math.round(item.calories || 0);
      const p = Math.round((item.protein || 0) * 10) / 10;
      const c = Math.round((item.carbs || 0) * 10) / 10;
      const f = Math.round((item.fat || 0) * 10) / 10;
      const fib = Math.round((item.fiber || 0) * 10) / 10;
      const sug = Math.round((item.sugar || 0) * 10) / 10;

      computedCalories += cals;
      computedProtein += p;
      computedCarbs += c;
      computedFat += f;
      computedFiber += fib;
      computedSugar += sug;

      const lowerCat = (item.category || "").toLowerCase();
      const lowerName = (item.name || "").toLowerCase();
      const isAccompaniment =
        cals < 40 ||
        lowerCat.includes("condiment") ||
        lowerName.includes("sauce") ||
        lowerName.includes("dip") ||
        lowerName.includes("garnish") ||
        lowerName.includes("slice") ||
        lowerName.includes("wedge") ||
        lowerName.includes("chutney") ||
        lowerName.includes("pickle") ||
        lowerName.includes("raita");

      return {
        id: `food-${Date.now()}-${idx}`,
        name: item.name || "Unknown Item",
        quantity: qty,
        servingSize: item.servingSize || "1 portion",
        confidence: item.confidence ? Math.min(1, Math.max(0.5, item.confidence)) : 0.92,
        category: item.category || "other",
        calories: cals,
        protein: p,
        carbs: c,
        fat: f,
        fiber: fib,
        sugar: sug,
        isAccompaniment: Boolean(isAccompaniment),
      };
    });

    let healthScore = 75;
    if (foods.length > 0 && computedCalories > 0) {
      const proteinCalPct = (computedProtein * 4) / computedCalories;
      const fiberBonus = Math.min(15, computedFiber * 2);
      const sugarPenalty = Math.min(20, computedSugar * 0.8);

      if (proteinCalPct >= 0.20) healthScore += 10;
      if (proteinCalPct < 0.10) healthScore -= 10;
      healthScore += fiberBonus - sugarPenalty;
      healthScore = Math.max(30, Math.min(98, Math.round(healthScore)));
    } else {
      healthScore = 0;
    }

    const dietaryInsights: string[] = [];
    if (foods.length === 0) {
      dietaryInsights.push("No food items detected in the image. Try taking a clearer photo.");
    } else {
      if (computedProtein >= 25) {
        dietaryInsights.push("High protein content — excellent for muscle synthesis and satiety.");
      } else if (computedProtein < 10) {
        dietaryInsights.push("Low protein content — consider pairing with a protein source.");
      }

      if (computedFiber >= 6) {
        dietaryInsights.push("Rich in dietary fiber — supports healthy digestion and steady blood sugar.");
      }

      if (computedSugar >= 25) {
        dietaryInsights.push("Higher in simple sugars — keep an eye on overall daily sugar intake.");
      }

      const accompanimentsCount = foods.filter((f: any) => f.isAccompaniment).length;
      if (accompanimentsCount > 0) {
        dietaryInsights.push(`Detected ${accompanimentsCount} accompaniment/side item(s) (dips, garnishes, or salads).`);
      }
    }

    const responsePayload = {
      foods: foods,
      totalCalories: Math.round(parsedData.totalCalories || computedCalories),
      totalProtein: Math.round((parsedData.totalProtein || computedProtein) * 10) / 10,
      totalCarbs: Math.round((parsedData.totalCarbs || computedCarbs) * 10) / 10,
      totalFat: Math.round((parsedData.totalFat || computedFat) * 10) / 10,
      totalFiber: Math.round(computedFiber * 10) / 10,
      totalSugar: Math.round(computedSugar * 10) / 10,
      description: parsedData.description || "Food meal plate analysis",
      mealType: parsedData.mealType || "lunch",
      healthScore: healthScore,
      dietaryInsights: dietaryInsights,
      mealFeedback: parsedData.mealFeedback,
      alternatives: parsedData.alternatives || [],
      analyzedAt: new Date().toISOString(),
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error("Error in /api/analyze-food:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze food image with Gemini AI.",
    });
  }
});

// Analyze spoken / natural language text meal description
analyzeFoodRouter.post("/analyze-text", async (req, res) => {
  try {
    const { text, userProfile } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No food description provided." });
    }

    const ai = getGeminiClient();

    let userContext = "";
    if (userProfile) {
      userContext = `
USER PROFILE CONTEXT:
The user's goal is: ${userProfile.goal} (Target: ${userProfile.targetCalories} kcal/day). 
They weigh ${userProfile.weightKg}kg, height ${userProfile.heightCm}cm, age ${userProfile.age}, gender ${userProfile.gender}, activity level: ${userProfile.activityLevel}.
Their macro targets are: ${userProfile.targetProtein}g Protein, ${userProfile.targetCarbs}g Carbs, ${userProfile.targetFat}g Fat.

IMPORTANT: Provide a personalized 'mealFeedback' string (2-3 sentences) analyzing this specific meal against their goals. Suggest small tweaks or praise their choices based on their profile.
`;
    }

    const systemInstruction = `You are an expert food nutritionist and dietitian AI. Your job is to analyze spoken or written natural language meal descriptions and extract precise food items, quantities, portion sizes, calories, and macronutrient breakdowns.
${userContext}
CRITICAL INSTRUCTIONS:
1. Parse the user's spoken or written meal description carefully: "${text}".
2. Identify EVERY SINGLE food item, ingredient, drink, sauce, or condiment mentioned or implied.
3. If quantities or portions are mentioned (e.g. "2 eggs", "1 cup oatmeal", "a handful of almonds", "300g chicken"), use them accurately.
4. If no specific quantity is mentioned, assume standard single-serving realistic portions.
5. Provide accurate calorie and macro estimates (protein, carbs, fat, fiber, sugar in grams).
6. Detect meal type (breakfast, lunch, dinner, snack, beverage) based on the items and time of day implied.
7. If any unhealthy, fried, or excessive sugar items are mentioned, provide healthy alternative swaps in the 'alternatives' array.

Return your response as a JSON object with this EXACT structure:
{
  "foods": [
    {
      "name": "Specific Food Name",
      "quantity": 1,
      "servingSize": "1 medium bowl (150g)",
      "confidence": 0.98,
      "category": "fast food/fruit/vegetable/meat/dairy/grain/beverage/dessert",
      "calories": 250,
      "protein": 12,
      "carbs": 30,
      "fat": 8,
      "fiber": 3,
      "sugar": 5
    }
  ],
  "totalCalories": 250,
  "totalProtein": 12,
  "totalCarbs": 30,
  "totalFat": 8,
  "description": "Comprehensive description of the meal",
  "mealType": "breakfast/lunch/dinner/snack/beverage",
  "mealFeedback": "Personalized feedback analyzing this meal against the user's goals. 2-3 sentences.",
  "alternatives": [
    {
      "original": "White Sugar",
      "alternative": "Monk fruit sweetener or Stevia",
      "reason": "Eliminates sugar spike and empty calories"
    }
  ]
}

If no food can be identified from the description, return:
{
  "foods": [],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "description": "No recognizable food items found in description",
  "mealType": "unknown",
  "mealFeedback": "I couldn't identify any food items from your description. Please try describing what you ate with items and portions (e.g., '2 boiled eggs and a slice of toast')."
}`;

    const response = await callGeminiWithRetryAndFallback(ai, {
      contents: {
        parts: [
          {
            text: `Analyze this spoken/written meal description and extract all nutrition data: "${text}"`,
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
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

    let foods = parsedData.foods || [];

    let computedCalories = 0;
    let computedProtein = 0;
    let computedCarbs = 0;
    let computedFat = 0;
    let computedFiber = 0;
    let computedSugar = 0;

    foods = foods.map((item: any, idx: number) => {
      const qty = item.quantity || 1;
      const cals = Math.round(item.calories || 0);
      const p = Math.round((item.protein || 0) * 10) / 10;
      const c = Math.round((item.carbs || 0) * 10) / 10;
      const f = Math.round((item.fat || 0) * 10) / 10;
      const fib = Math.round((item.fiber || 0) * 10) / 10;
      const sug = Math.round((item.sugar || 0) * 10) / 10;

      computedCalories += cals;
      computedProtein += p;
      computedCarbs += c;
      computedFat += f;
      computedFiber += fib;
      computedSugar += sug;

      const lowerCat = (item.category || "").toLowerCase();
      const lowerName = (item.name || "").toLowerCase();
      const isAccompaniment =
        cals < 40 ||
        lowerCat.includes("condiment") ||
        lowerName.includes("sauce") ||
        lowerName.includes("dip") ||
        lowerName.includes("garnish") ||
        lowerName.includes("slice") ||
        lowerName.includes("wedge") ||
        lowerName.includes("chutney") ||
        lowerName.includes("pickle") ||
        lowerName.includes("raita");

      return {
        id: `food-voice-${Date.now()}-${idx}`,
        name: item.name || "Unknown Item",
        quantity: qty,
        servingSize: item.servingSize || "1 portion",
        confidence: 0.96,
        category: item.category || "other",
        calories: cals,
        protein: p,
        carbs: c,
        fat: f,
        fiber: fib,
        sugar: sug,
        isAccompaniment: Boolean(isAccompaniment),
      };
    });

    let healthScore = 75;
    if (foods.length > 0 && computedCalories > 0) {
      const proteinCalPct = (computedProtein * 4) / computedCalories;
      const fiberBonus = Math.min(15, computedFiber * 2);
      const sugarPenalty = Math.min(20, computedSugar * 0.8);

      if (proteinCalPct >= 0.20) healthScore += 10;
      if (proteinCalPct < 0.10) healthScore -= 10;
      healthScore += fiberBonus - sugarPenalty;
      healthScore = Math.max(30, Math.min(98, Math.round(healthScore)));
    } else {
      healthScore = 0;
    }

    const dietaryInsights: string[] = [];
    if (foods.length === 0) {
      dietaryInsights.push("No food items recognized in your voice description. Try including specific food names and quantities.");
    } else {
      if (computedProtein >= 25) {
        dietaryInsights.push("High protein meal — great for supporting muscle tissue and satiety.");
      } else if (computedProtein < 10) {
        dietaryInsights.push("Lower protein content — consider adding an egg, tofu, or protein shake.");
      }

      if (computedFiber >= 6) {
        dietaryInsights.push("Excellent fiber content — promotes gut health and steady energy levels.");
      }

      if (computedSugar >= 25) {
        dietaryInsights.push("Higher in simple sugars — balance with complex carbohydrates.");
      }
    }

    const responsePayload = {
      foods: foods,
      totalCalories: Math.round(parsedData.totalCalories || computedCalories),
      totalProtein: Math.round((parsedData.totalProtein || computedProtein) * 10) / 10,
      totalCarbs: Math.round((parsedData.totalCarbs || computedCarbs) * 10) / 10,
      totalFat: Math.round((parsedData.totalFat || computedFat) * 10) / 10,
      totalFiber: Math.round(computedFiber * 10) / 10,
      totalSugar: Math.round(computedSugar * 10) / 10,
      description: parsedData.description || `Spoken meal: "${text}"`,
      mealType: parsedData.mealType || "lunch",
      healthScore: healthScore,
      dietaryInsights: dietaryInsights,
      mealFeedback: parsedData.mealFeedback,
      alternatives: parsedData.alternatives || [],
      analyzedAt: new Date().toISOString(),
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error("Error in /api/analyze-text:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze voice description with Gemini AI.",
    });
  }
});

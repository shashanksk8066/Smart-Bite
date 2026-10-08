import { Router } from "express";
import { getGeminiClient, callGeminiWithRetryAndFallback } from "../gemini.ts";

export const chatRouter = Router();

chatRouter.post("/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      dailyGoalCalories = 2000,
      todayCalories = 0,
      todayProtein = 0,
      todayCarbs = 0,
      todayFat = 0,
      recentMeals = [],
    } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required." });
    }

    const ai = getGeminiClient();

    const remainingCalories = Math.max(0, dailyGoalCalories - todayCalories);
    const targetProtein = Math.round((dailyGoalCalories * 0.25) / 4);
    const targetCarbs = Math.round((dailyGoalCalories * 0.50) / 4);
    const targetFat = Math.round((dailyGoalCalories * 0.25) / 9);

    const mealsContext =
      recentMeals.length > 0
        ? recentMeals
            .map(
              (m: any) =>
                `- ${m.analysis?.dishName || "Meal"}: ${m.analysis?.totalCalories || 0} kcal (P: ${
                  m.analysis?.totalProtein || 0
                }g, C: ${m.analysis?.totalCarbs || 0}g, F: ${m.analysis?.totalFat || 0}g)`
            )
            .join("\n")
        : "No meals logged yet today.";

    const systemContext = `You are "Smart Bite Assistant", an expert AI Nutritionist & Diet Coach.
You are embedded directly in the Smart Bite food tracking app.

CURRENT USER METRICS TODAY:
- Daily Calorie Target: ${dailyGoalCalories} kcal
- Calories Consumed Today: ${todayCalories} kcal
- Calories Remaining Today: ${remainingCalories} kcal
- Protein Consumed: ${todayProtein}g / ${targetProtein}g target
- Carbs Consumed: ${todayCarbs}g / ${targetCarbs}g target
- Fat Consumed: ${todayFat}g / ${targetFat}g target

MEALS LOGGED TODAY:
${mealsContext}

INSTRUCTIONS:
1. Provide concise, friendly, highly practical nutrition guidance.
2. Directly answer questions about their remaining calories, macros, specific food recommendations, and daily target strategies.
3. Keep formatting clean with bullet points and bold highlights where appropriate.
4. Keep answers under 150-200 words unless detailed meal breakdown is requested.`;

    const contentsParts: any[] = [
      { role: "user", parts: [{ text: systemContext }] },
      {
        role: "model",
        parts: [
          {
            text: "Understood! I'm ready to answer any questions about the user's daily targets, logged meals, and macro balance.",
          },
        ],
      },
    ];

    if (Array.isArray(history)) {
      for (const h of history) {
        if (h.sender === "user") {
          contentsParts.push({ role: "user", parts: [{ text: h.text }] });
        } else if (h.sender === "ai") {
          contentsParts.push({ role: "model", parts: [{ text: h.text }] });
        }
      }
    }

    contentsParts.push({ role: "user", parts: [{ text: message }] });

    const response = await callGeminiWithRetryAndFallback(ai, {
      contents: contentsParts,
      config: {
        temperature: 0.5,
      },
    });

    const replyText =
      response.text ||
      "I'm sorry, I couldn't process your request right now. Please try again!";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Failed to communicate with AI Assistant.",
    });
  }
});

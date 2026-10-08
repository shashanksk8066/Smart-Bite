import { GoogleGenAI } from "@google/genai";

// Helper to get Gemini Client safely
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to get all available API keys
function getAvailableApiKeys(): string[] {
  const keys: string[] = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_API_KEY1) keys.push(process.env.GEMINI_API_KEY1);
  if (process.env.GEMINI_API_KEY2) keys.push(process.env.GEMINI_API_KEY2);
  if (process.env.GEMINI_API_KEY3) keys.push(process.env.GEMINI_API_KEY3);
  if (process.env.GEMINI_API_KEY4) keys.push(process.env.GEMINI_API_KEY4);
  
  // Deduplicate keys
  return Array.from(new Set(keys));
}

// Helper to call Gemini with parallel race pattern and API Key rotation
export async function callGeminiWithRetryAndFallback(
  _ai: GoogleGenAI, // kept for backwards compatibility in existing routes
  params: {
    contents: any;
    config?: any;
  }
) {
  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-lite",
  ];

  const apiKeys = getAvailableApiKeys();
  
  if (apiKeys.length === 0) {
    throw new Error("No GEMINI_API_KEYs are configured in environment variables.");
  }

  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const key = apiKeys[keyIndex];
    
    // Initialize a client for the current API key
    const aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    console.log(`[Gemini API] Starting parallel race using API Key #${keyIndex + 1}/${apiKeys.length} with models: ${modelsToTry.join(', ')}`);

    const promises = modelsToTry.map(async (model) => {
      try {
        const response = await aiClient.models.generateContent({
          model,
          ...params,
        });
        console.log(`[Gemini API] Race won by model: ${model} on Key #${keyIndex + 1} 🏆`);
        return response;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini API] Model ${model} failed on Key #${keyIndex + 1}: ${errMsg}`);
        throw err;
      }
    });

    try {
      // Return the very first successful response
      return await Promise.any(promises);
    } catch (error: any) {
      // If we get here, it means ALL models failed for THIS API KEY.
      console.error(`[Gemini API] All models failed in parallel race for API Key #${keyIndex + 1}.`);
      
      // If there are more keys, we continue the loop and try the next key
      if (keyIndex < apiKeys.length - 1) {
         console.log(`[Gemini API] Switching to next API Key...`);
         continue;
      }
    }
  }

  // If we exhaust all keys and all models fail:
  throw new Error(
    "Gemini AI models are currently experiencing high demand or quota exceeded on all provided keys. Please try again later."
  );
}

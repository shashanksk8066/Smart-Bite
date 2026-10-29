# Smart Bite 🍏

Smart Bite is an intelligent AI-powered nutrition and fitness tracking application. It helps users track their meals with a simple photo, monitor their macro and calorie goals, log daily activities, and build healthy habits through streaks and leaderboards.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL
- **AI Integration:** Google Gemini API (Vision & Text models) with Parallel Race API Key Fallback

---

## Key Features

1. **AI Food Scanner & Dashboard**
   - Upload a photo of your meal and Gemini Vision AI instantly estimates calories, protein, carbs, and fats.
   - Automatically detects unhealthy items and provides healthier alternatives.
   - Real-time dashboard showing `Calories Consumed - Calories Burned` against your daily target.

2. **Build Your Own Meal (Subway-Style Builder)**
   - Select and customize ingredients and portion sizes from a curated database covering vegetables, fruits, rice & grains, proteins, dairy, and healthy snacks.
   - Live interactive plate tray calculates total calories, protein, carbs, fat, and fiber in real-time.

3. **Speech-to-Nutrition (AI Voice Meal Logging)**
   - Speak naturally into your microphone detailing what you ate and portions (e.g., *"2 boiled eggs, a cup of oatmeal with blueberries, and black coffee"*).
   - Real-time speech transcription converted into detailed nutritional estimation via Gemini AI.

4. **Smart Onboarding**
   - Collects your body metrics and fitness goals (Weight Loss, Muscle Gain, Maintenance).
   - Uses AI to calculate personalized, scientifically-grounded daily caloric and macronutrient targets.

3. **Activity & Exercise Tracking**
   - Log exercises (Walking, Running, Cycling, Swimming, Yoga, Gym).
   - Automatically calculates `Calories Burned` based on your weight, activity duration, intensity, and MET values.

4. **AI Meal Suggestions**
   - Recommends personalized meals to perfectly fit your *remaining* daily calorie target.

5. **Gamification (Streaks & Leaderboards)**
   - Earn a "Streak" day if your net calories are within ±15% of your daily target.
   - Global leaderboard ranks all users based on their longest successful streak.
   - Premium calendar view to review your historic logs.

6. **Floating AI Nutritionist Assistant**
   - A built-in chat widget where users can ask general fitness, health, and recipe questions anytime.

---

## Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** (v18+)
- **MySQL** (set root password to `root1234`)

### 2. Setup Database & API Keys
You do not need to manually create the database. The backend server will automatically create the `smartbite` database and all required tables on startup.

Inside the `server` directory, create a `.env` file with your Gemini API Keys (the app uses a fallback system, so you can provide multiple keys):
```env
GEMINI_API_KEY="your_api_key_here"
GEMINI_API_KEY1="your_backup_key_here"
```

### 3. Installation & Running
Start the Backend:
```bash
cd server
npm install
npm run dev
```

Start the Frontend (in a new terminal):
```bash
cd client
npm install
npm run dev
```

Open your browser to `http://localhost:5173` to start tracking!

import express from "express";
import path from "path";
import dotenv from "dotenv";

import { analyzeFoodRouter } from "./routes/analyzeFood.ts";
import { suggestMealsRouter } from "./routes/suggestMeals.ts";
import { chatRouter } from "./routes/chat.ts";
import { recommendTargetRouter } from "./routes/recommendTarget.ts";
import { usersRouter } from "./routes/users.ts";
import { mealsRouter } from "./routes/meals.ts";
import { leaderboardRouter } from "./routes/leaderboard.ts";
import { exercisesRouter } from "./routes/exercises.ts";
import { initializeDatabase } from "./db.ts";

dotenv.config();

const PORT = 3000;

export async function startServer() {
  await initializeDatabase();
  
  const app = express();

  // Support up to 50mb payload for high-res image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS should be added if frontend and backend run on different ports
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mount API Routers
  app.use("/api", analyzeFoodRouter);
  app.use("/api", suggestMealsRouter);
  app.use("/api", chatRouter);
  app.use("/api", recommendTargetRouter);
  app.use("/api", usersRouter);
  app.use("/api", mealsRouter);
  app.use("/api", leaderboardRouter);
  app.use("/api", exercisesRouter);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Smart Bite Server] Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

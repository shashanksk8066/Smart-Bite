import { Router } from 'express';
import db from '../db.ts';

export const usersRouter = Router();

usersRouter.get('/users/:email', async (req, res) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [req.params.email]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

usersRouter.post('/users', async (req, res) => {
  const user = req.body;
  try {
    const query = `
      INSERT INTO users (email, name, goal, age, gender, weightKg, heightCm, activityLevel, targetCalories, targetProtein, targetCarbs, targetFat, aiRecommendationNote)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name), goal = VALUES(goal), age = VALUES(age), gender = VALUES(gender), weightKg = VALUES(weightKg), heightCm = VALUES(heightCm), activityLevel = VALUES(activityLevel), targetCalories = VALUES(targetCalories), targetProtein = VALUES(targetProtein), targetCarbs = VALUES(targetCarbs), targetFat = VALUES(targetFat), aiRecommendationNote = VALUES(aiRecommendationNote)
    `;
    const values = [
      user.email, user.name, user.goal, user.age, user.gender, user.weightKg, user.heightCm, user.activityLevel, user.targetCalories, user.targetProtein, user.targetCarbs, user.targetFat, user.aiRecommendationNote
    ];
    await db.query(query, values);
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

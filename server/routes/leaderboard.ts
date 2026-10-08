import { Router } from 'express';
import db from '../db.ts';

export const leaderboardRouter = Router();

// Helper: compute current active streak for a sorted list of YYYY-MM-DD date strings
function computeCurrentStreak(successDates: string[]): number {
  if (successDates.length === 0) return 0;

  const sorted = [...successDates].sort(); // ascending
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  // Streak only counts if today or yesterday has a success
  const lastSuccess = sorted[sorted.length - 1];
  if (lastSuccess !== todayStr && lastSuccess !== yesterdayStr) return 0;

  let streak = 0;
  let checkDate = new Date(lastSuccess);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const ds = `${checkDate.getFullYear()}-${pad(checkDate.getMonth() + 1)}-${pad(checkDate.getDate())}`;
    if (sorted[i] === ds) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

leaderboardRouter.get('/leaderboard', async (req, res) => {
  try {
    // Fetch all users
    const [users]: any = await db.query('SELECT email, name, targetCalories FROM users');

    // Fetch all meals grouped by user and date with total calories
    const [mealRows]: any = await db.query(`
      SELECT user_email, date, SUM(JSON_EXTRACT(analysis, '$.totalCalories')) AS totalCals
      FROM saved_meals
      GROUP BY user_email, date
      ORDER BY user_email, date ASC
    `);

    // Group meals by user
    const mealsByUser: Record<string, { date: string; totalCals: number }[]> = {};
    for (const row of mealRows) {
      if (!mealsByUser[row.user_email]) mealsByUser[row.user_email] = [];
      mealsByUser[row.user_email].push({ date: row.date, totalCals: parseFloat(row.totalCals) });
    }

    // Compute streaks for each user
    const leaderboard = users.map((user: any) => {
      const target = user.targetCalories || 2000;
      const threshold = target * 0.15;
      const meals = mealsByUser[user.email] || [];

      const successDates = meals
        .filter(m => Math.abs(m.totalCals - target) <= threshold)
        .map(m => m.date);

      const currentStreak = computeCurrentStreak(successDates);

      // Longest streak
      const sorted = [...successDates].sort();
      let maxStreak = 0;
      let tempStreak = 0;
      let lastDateStr: string | null = null;

      for (const ds of sorted) {
        if (!lastDateStr) {
          tempStreak = 1;
        } else {
          const diff = Math.round(
            (new Date(ds).getTime() - new Date(lastDateStr).getTime()) / (1000 * 60 * 60 * 24)
          );
          tempStreak = diff === 1 ? tempStreak + 1 : 1;
        }
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        lastDateStr = ds;
      }

      return {
        name: user.name || user.email.split('@')[0],
        email: user.email,
        currentStreak,
        longestStreak: Math.max(currentStreak, maxStreak),
        totalSuccessDays: successDates.length,
      };
    });

    // Sort by longestStreak desc, then currentStreak desc
    leaderboard.sort((a: any, b: any) =>
      b.longestStreak !== a.longestStreak
        ? b.longestStreak - a.longestStreak
        : b.currentStreak - a.currentStreak
    );

    res.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard Error]', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

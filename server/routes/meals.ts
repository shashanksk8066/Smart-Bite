import { Router } from 'express';
import db from '../db.ts';

export const mealsRouter = Router();

mealsRouter.get('/meals', async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  
  try {
    const [rows]: any = await db.query('SELECT * FROM saved_meals WHERE user_email = ? ORDER BY date DESC, time DESC', [email]);
    const meals = rows.map((row: any) => ({
      ...row,
      analysis: typeof row.analysis === 'string' ? JSON.parse(row.analysis) : row.analysis
    }));
    res.json(meals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

mealsRouter.post('/meals', async (req, res) => {
  const { id, user_email, date, time, imageUrl, analysis, customNotes } = req.body;
  try {
    const query = `
      INSERT INTO saved_meals (id, user_email, date, time, imageUrl, analysis, customNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [id, user_email, date, time, imageUrl, JSON.stringify(analysis), customNotes || null];
    await db.query(query, values);
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

mealsRouter.delete('/meals/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM saved_meals WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

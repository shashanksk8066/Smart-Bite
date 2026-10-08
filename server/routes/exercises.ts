import { Router } from 'express';
import db from '../db.ts';

export const exercisesRouter = Router();

// Get exercise logs for a user
exercisesRouter.get('/exercises', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [rows] = await db.query(
      'SELECT * FROM exercises WHERE user_email = ? ORDER BY date DESC, time DESC',
      [email]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Add a new exercise log
exercisesRouter.post('/exercises', async (req, res) => {
  try {
    const { id, user_email, date, time, type, duration_minutes, intensity, calories_burned } = req.body;

    if (!id || !user_email || !date || !type || !duration_minutes || !calories_burned) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.query(
      `INSERT INTO exercises (id, user_email, date, time, type, duration_minutes, intensity, calories_burned) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user_email, date, time, type, duration_minutes, intensity, calories_burned]
    );

    res.status(201).json({ message: 'Exercise logged successfully' });
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

// Delete an exercise log
exercisesRouter.delete('/exercises/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result]: any = await db.query(
      'DELETE FROM exercises WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

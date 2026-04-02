import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 0. ADMIN LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (rows.length > 0) {
      res.json({ success: true, message: 'Login successful', admin: { id: rows[0].id, username: rows[0].username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1. GET all entries
app.get('/api/entries', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_entries ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. POST a new entry
app.post('/api/entries', async (req, res) => {
  const { fullName, phone, email, movingFrom, movingTo, query, entryDate } = req.body;
  
  if (!fullName || !phone || !email || !movingFrom || !movingTo || !entryDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO user_entries (fullName, phone, email, movingFrom, movingTo, query, entryDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fullName, phone, email, movingFrom, movingTo, query, entryDate]
    );
    res.status(201).json({ id: result.insertId, message: 'Entry saved successfully' });
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. DELETE an entry
app.delete('/api/entries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM user_entries WHERE id = ?', [id]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir ton fichier index.html

// Connexion à la base de données PostgreSQL de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Route pour obtenir le classement
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM scores ORDER BY score DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Route pour ajouter un score
app.post('/api/score', async (req, res) => {
  const { username, score, level } = req.body;
  try {
    // Vérifier si l'utilisateur existe
    const existing = await pool.query('SELECT * FROM scores WHERE username = $1', [username]);
    
    if (existing.rows.length > 0) {
      // Mettre à jour si le score est meilleur
      if (score > existing.rows[0].score) {
        await pool.query('UPDATE scores SET score = $1, level = $2, updated_at = NOW() WHERE username = $3', [score, level, username]);
      }
    } else {
      // Insérer nouveau joueur
      await pool.query('INSERT INTO scores (username, score, level) VALUES ($1, $2, $3)', [username, score, level]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur sauvegarde' });
  }
});

app.listen(port, () => {
  console.log(`Serveur Zixel lancé sur le port ${port}`);
});

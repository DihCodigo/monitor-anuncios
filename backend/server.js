import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Cria a tabela caso não exista
await pool.query(`
  CREATE TABLE IF NOT EXISTS logs_anuncios (
    id SERIAL PRIMARY KEY,
    ad_unit TEXT,
    status TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/', (req, res) => {
  res.send('🛰️ API Monitoramento de Anúncios\nUse /log-anuncio via POST.');
});

app.post('/log-anuncio', async (req, res) => {
  const { ad_unit, status } = req.body;

  if (!ad_unit || !status) {
    return res.status(400).json({ error: 'ad_unit e status são obrigatórios.' });
  }

  await pool.query(
    'INSERT INTO logs_anuncios (ad_unit, status) VALUES ($1, $2)',
    [ad_unit, status]
  );

  res.status(201).json({ message: 'Log registrado com sucesso' });
});

app.get('/logs', async (req, res) => {
  const result = await pool.query('SELECT * FROM logs_anuncios ORDER BY timestamp DESC');
  res.json(result.rows);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/*
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ad_monitoring',
  password: '#Dih0123',
  port: 5432
});
*/

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.post('/api/track-slot', async (req, res) => {
  const { path, slot_id, ad_unit, delivered_size, unit_sizes, prebid_won } = req.body;

  console.log('REQ BODY:', req.body);

  try {
    await pool.query(
      `INSERT INTO ad_slot_views (path, slot_id, ad_unit, delivered_size, unit_sizes, prebid_won)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [path, slot_id, ad_unit, delivered_size, JSON.stringify(unit_sizes), prebid_won]
    );

    await pool.query(`
      INSERT INTO ad_unit_views (ad_unit, count)
      VALUES ($1, 1)
      ON CONFLICT (ad_unit) DO UPDATE
      SET count = ad_unit_views.count + 1;
    `, [ad_unit]);

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao inserir no banco:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** */

app.get('/ad-status.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'ad-status.js'));
});

/** */

app.get('/', (req, res) => {
  res.send('🎉 Backend de monitoramento ativo!');
});


app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor ativo na porta ${port}`);
});

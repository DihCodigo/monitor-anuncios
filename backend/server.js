// backend/server.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.LOCAL_DEV ? false : { rejectUnauthorized: false }
});

// 🧱 Criação da tabela se não existir
const createTableQuery = `
CREATE TABLE IF NOT EXISTS logs_anuncios (
  id SERIAL PRIMARY KEY,
  timestamp TEXT,
  adUnit TEXT,
  slotId TEXT,
  pageUrl TEXT,
  deliveredSize TEXT,
  userAgent TEXT
);`;

pool.query(createTableQuery)
  .then(() => console.log("🗂️ Tabela 'logs_anuncios' pronta"))
  .catch(err => console.error("Erro criando tabela:", err));

// 📥 Endpoint para logs
app.post('/log-anuncio', async (req, res) => {
  const { timestamp, adUnit, slotId, pageUrl, deliveredSize, userAgent } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO logs_anuncios (timestamp, adUnit, slotId, pageUrl, deliveredSize, userAgent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [timestamp, adUnit, slotId, pageUrl, deliveredSize, userAgent]);

    res.json({ status: 'ok', id: result.rows[0].id });
  } catch (err) {
    console.error("❌ Erro ao inserir log:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 🔍 Visualização dos logs
app.get('/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs_anuncios ORDER BY id DESC');

    let html = `
      <h2>📋 Logs de Anúncios</h2>
      <table border="1" cellpadding="5">
        <tr>
          <th>ID</th>
          <th>Timestamp</th>
          <th>Ad Unit</th>
          <th>Slot ID</th>
          <th>Page URL</th>
          <th>Delivered Size</th>
          <th>User Agent</th>
        </tr>`;

    result.rows.forEach(row => {
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.timestamp}</td>
          <td>${row.adUnit}</td>
          <td>${row.slotId}</td>
          <td><a href="${row.pageUrl}" target="_blank">${row.pageUrl}</a></td>
          <td>${row.deliveredSize}</td>
          <td>${row.userAgent}</td>
        </tr>`;
    });

    html += '</table>';
    res.send(html);
  } catch (err) {
    res.status(500).send('Erro ao buscar logs');
  }
});

// Info
app.get('/', (req, res) => {
  res.send(`<h2>🛰️ API Monitoramento de Anúncios</h2><p>Use <code>/log-anuncio</code> via POST.</p>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

// backend/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Conexão com MySQL
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao MySQL');
});

// 🧱 Criação da tabela (caso não exista)
const createTableQuery = `
CREATE TABLE IF NOT EXISTS logs_anuncios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp VARCHAR(255),
  adUnit VARCHAR(255),
  slotId VARCHAR(255),
  pageUrl TEXT,
  deliveredSize VARCHAR(255),
  userAgent TEXT
);
`;

db.query(createTableQuery, (err) => {
  if (err) console.error('Erro criando tabela:', err);
  else console.log('🗂️ Tabela logs_anuncios pronta');
});

// 📥 Rota POST para receber logs
app.post('/log-anuncio', (req, res) => {
  console.log("📥 Dados recebidos no body:", req.body);

  const { timestamp, adUnit, slotId, pageUrl, deliveredSize, userAgent } = req.body;

  const sql = `
    INSERT INTO logs_anuncios 
    (timestamp, adUnit, slotId, pageUrl, deliveredSize, userAgent)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [timestamp, adUnit, slotId, pageUrl, deliveredSize, userAgent];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Erro ao inserir log:', err);
      return res.status(500).json({ status: 'error', error: err.message });
    }
    res.json({ status: 'ok', id: result.insertId });
  });
});

// 🌐 Página inicial
app.get('/', (req, res) => {
  res.send('<h2>🛰️ API Monitoramento de Anúncios</h2><p>Use <code>/log-anuncio</code> via POST.</p>');
});

// ℹ️ Documentação rápida
app.get('/log-anuncio', (req, res) => {
  res.send(`
    <h3>📡 Rota POST /log-anuncio</h3>
    <p>Essa rota espera um JSON com o seguinte formato:</p>
    <pre>
{
  "timestamp": "2025-06-04T15:12:00Z",
  "adUnit": "/23079482936/interstitials-030924",
  "slotId": "gpt_unit_/23079482936/interstitials-030924_0",
  "pageUrl": "https://exemplo.com",
  "deliveredSize": "unknown",
  "userAgent": "Mozilla/5.0 ..."
}
    </pre>
  `);
});

// 🧾 Rota visual para exibir todos os logs
app.get('/logs', (req, res) => {
  db.query('SELECT * FROM logs_anuncios ORDER BY id DESC', (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao buscar logs');
    }

    let html = `
      <h2>📋 Logs de Anúncios</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Ad Unit</th>
            <th>Slot ID</th>
            <th>Page URL</th>
            <th>Delivered Size</th>
            <th>User Agent</th>
          </tr>
        </thead>
        <tbody>
    `;

    results.forEach(row => {
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.timestamp}</td>
          <td>${row.adUnit}</td>
          <td>${row.slotId}</td>
          <td><a href="${row.pageUrl}" target="_blank">${row.pageUrl}</a></td>
          <td>${row.deliveredSize}</td>
          <td>${row.userAgent}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    res.send(html);
  });
});

// 🚀 Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

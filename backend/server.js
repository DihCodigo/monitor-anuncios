// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('✅ Monitor de Anúncios rodando com sucesso no Render!');
});

// Aqui você pode adicionar suas rotas reais do projeto:
app.post('/api/anuncio', (req, res) => {
  const data = req.body;
  console.log('📥 Dados recebidos:', data);
  res.status(200).json({ status: 'ok', received: data });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ouvindo na porta ${PORT}`);
});

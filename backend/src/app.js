const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();

// Middlewares base
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200'
}));

// Ping
app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'MichaelCollazosDiplomadoFinal API' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

module.exports = app;
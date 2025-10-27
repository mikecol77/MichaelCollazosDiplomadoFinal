require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`> API escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error crítico al iniciar el servidor:', err);
    process.exit(1);
  }
})();
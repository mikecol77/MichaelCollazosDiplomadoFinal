const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Falta MONGO_URI en el .env');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('> Conectado a MongoDB');
};
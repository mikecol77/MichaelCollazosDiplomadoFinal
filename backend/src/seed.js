require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');

(async () => {
  try {
    await connectDB();

    const email = 'demo@demo.com';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Usuario Demo',
        email,
        password: '123456'
      });
      console.log('> Usuario demo creado:', email, 'pass: 123456');
    } else {
      console.log('> Usuario demo ya existía');
    }

    const existingTasks = await Task.find({ user: user._id });
    if (existingTasks.length === 0) {
      await Task.create([
        { title: 'Revisar correo', user: user._id },
        { title: 'Crear presentación', user: user._id, done: true },
        { title: 'Planificar sprint', user: user._id }
      ]);
      console.log('> Tareas demo creadas');
    } else {
      console.log('> Ya existen tareas demo');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
})();
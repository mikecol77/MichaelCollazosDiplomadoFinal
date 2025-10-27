const Task = require('../models/Task');

exports.listMyTasks = async (req, res) => {
  try {
    // Puedes permitir ?sort=createdAt|-createdAt si quieres en el futuro
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error('Error listMyTasks:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, priority, dueDate } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'title es requerido' });
    }

    const payload = {
      title: title.trim(),
      user: req.userId,
    };

    if (['low', 'med', 'high'].includes(priority)) payload.priority = priority;
    if (dueDate) payload.dueDate = new Date(dueDate);

    const task = await Task.create(payload);
    return res.status(201).json(task);
  } catch (err) {
    console.error('Error createTask:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.markDone = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    task.done = !task.done;
    await task.save();
    return res.json(task);
  } catch (err) {
    console.error('Error markDone:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, done, priority, dueDate } = req.body || {};
    const data = {};

    if (typeof title === 'string' && title.trim()) data.title = title.trim();
    if (typeof done === 'boolean') data.done = done;
    if (['low', 'med', 'high'].includes(priority)) data.priority = priority;
    if (dueDate === null) data.dueDate = null;
    else if (dueDate) data.dueDate = new Date(dueDate);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nada para actualizar' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: data },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    return res.json(task);
  } catch (err) {
    console.error('Error updateTask:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error deleteTask:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

// Extra: eliminar todas las completadas del usuario
exports.clearCompleted = async (req, res) => {
  try {
    const r = await Task.deleteMany({ user: req.userId, done: true });
    return res.json({ ok: true, deleted: r.deletedCount });
  } catch (err) {
    console.error('Error clearCompleted:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};



const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email y password son requeridos' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'El email ya está registrado' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email y password son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = signToken(user._id);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('_id name email');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Error en me:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'name es requerido' });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { name: name.trim() } },
      { new: true, select: '_id name email' }
    );
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Error en updateMe:', err);
    return res.status(500).json({ message: 'Error en servidor' });
  }
};

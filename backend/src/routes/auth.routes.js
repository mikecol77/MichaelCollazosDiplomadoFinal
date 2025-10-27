const router = require('express').Router();
const { register, login, me, updateMe } = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);

// Perfil del usuario autenticado
router.get('/me', auth, me);
router.patch('/me', auth, updateMe);

module.exports = router;

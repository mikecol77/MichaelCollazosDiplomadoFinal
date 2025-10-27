const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  listMyTasks,
  createTask,
  markDone,
  updateTask,
  deleteTask,
  clearCompleted
} = require('../controllers/task.controller');

router.use(auth);
router.get('/', listMyTasks);
router.post('/', createTask);
router.patch('/:id', markDone);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// NUEVO
router.delete('/__all__/completed', clearCompleted);

module.exports = router;



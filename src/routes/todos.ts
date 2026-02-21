import { Hono } from 'hono';
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
  patchTodo,
  updateTodo,
} from '../controllers/todoController';

const router = new Hono();

router.get('/', getAllTodos);
router.get('/:id', getTodoById);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id', patchTodo);
router.delete('/:id', deleteTodo);

export default router;

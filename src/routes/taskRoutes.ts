import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get('/', taskController.listAllTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);



export default router;



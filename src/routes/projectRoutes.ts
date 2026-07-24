import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import * as taskController from '../controllers/taskController';
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);


router.post('/',projectController.createProject);
router.get('/',projectController.listProjects);
router.get('/:id',projectController.getProject);
router.put('/:id',projectController.updateProject);
router.delete('/:id',projectController.deleteProject);

router.post('/:projectId/tasks',taskController.createTask);
router.get('/:projectId/tasks', taskController.listProjectTasks);

export default router;


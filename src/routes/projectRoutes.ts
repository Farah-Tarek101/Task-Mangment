import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import * as taskController from '../controllers/taskController';

const router = Router();


router.post('/:id/tasks', taskController.createTask);
router.get('/:id/tasks', taskController.listProjectTasks);

router.post('/', projectController.createProject);
router.get('/', projectController.listProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);


export default router;

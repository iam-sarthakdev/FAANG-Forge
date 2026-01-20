import express from 'express';
import { getLists, getListByName, addProblemToList, seedDefaultLists, toggleProblemCompletion, createSection } from '../controllers/problemListController.js';

const router = express.Router();

router.get('/', getLists);
router.post('/seed', seedDefaultLists);
router.get('/:name', getListByName);
router.post('/:listId/sections/:sectionTitle/problems', addProblemToList);
router.post('/:listId/sections', createSection);
router.patch('/:listId/sections/:sectionId/problems/:problemId/toggle', toggleProblemCompletion);

export default router;

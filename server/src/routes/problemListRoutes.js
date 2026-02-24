import express from 'express';
import { getLists, getListByName, addProblemToList, seedDefaultLists, seedFamousLists, toggleProblemCompletion, createSection, deleteSection, deleteProblem, reorderSection, reorderProblem, incrementProblemRevision, updateCompanyTags, saveCode } from '../controllers/problemListController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getLists);
router.post('/seed', authenticate, seedDefaultLists);
router.post('/seed-famous', authenticate, seedFamousLists);
router.get('/:name', authenticate, getListByName);
router.post('/:listId/sections/:sectionTitle/problems', authenticate, addProblemToList);
router.post('/:listId/sections', authenticate, createSection);
router.delete('/:listId/sections/:sectionId', authenticate, deleteSection);
router.delete('/:listId/sections/:sectionId/problems/:problemId', authenticate, deleteProblem);
router.patch('/:listId/sections/:sectionId/problems/:problemId/toggle', authenticate, toggleProblemCompletion);
router.patch('/:listId/sections/:sectionId/problems/:problemId/revisit', authenticate, incrementProblemRevision);
router.patch('/:listId/sections/:sectionId/problems/:problemId/company-tags', authenticate, updateCompanyTags);
router.patch('/:listId/sections/:sectionId/problems/:problemId/code', authenticate, saveCode);
router.put('/:listId/reorder-section', authenticate, reorderSection);
router.put('/:listId/sections/:sectionId/reorder-problem', authenticate, reorderProblem);

export default router;

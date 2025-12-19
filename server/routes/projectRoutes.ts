import express from 'express';
import { protect } from '../middlewares/auth.js';
import { deleteProject, getProjectById, getProjectPreview, getPublishedProjects, makeRevision, rollbackToVersion, saveProjectCode } from '../controllers/projectController.js';

const projectRouter = express.Router();

projectRouter.post('/revision/:projectId', protect, makeRevision)
projectRouter.put('/save/:projectId', protect, saveProjectCode)
projectRouter.get('/rollback/:projectId/:versionId', protect, rollbackToVersion)
projectRouter.delete('/:projectId', protect, deleteProject)
projectRouter.get('/preview/:projectId', protect, getProjectPreview)
projectRouter.get('/published', getPublishedProjects)
projectRouter.get('/published/:projectId', getProjectById)

export default projectRouter
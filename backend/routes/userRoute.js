const express = require('express');
const { requireAuth } = require('@clerk/express');
const { syncUser, getOrganization, getOrganizationUsers } = require('../controller/userSyncController');
const { createProject, getProjects, deleteProject } = require('../controller/projectController');
const { createSprint, updateSprint } = require('../controller/sprintController');
const { createIssue, getIssues, updateIssues, deleteIssue,  updateSingleIssue, createissueComments, getComments, getIssueAcrossMultSprint } = require('../controller/issueController');


const router = express.Router();

router.post('/sync', requireAuth(), syncUser);

router.get('/org/:slug', requireAuth(), getOrganization);

router.get('/org/users/:slug', requireAuth(), getOrganizationUsers);

router.post('/project', requireAuth(), createProject);

router.get('/project/:orgId', requireAuth(), getProjects);

router.delete('/project/delete/:projectId', requireAuth(), deleteProject);

router.post('/project/create-sprint/:projectId', requireAuth(), createSprint);

router.patch('/project/sprint/update/:sprintId', requireAuth(), updateSprint);

router.post('/project/:projectId/raise-issue', requireAuth(), createIssue);

router.get('/getIssues/:sprintId', requireAuth(), getIssues);

router.get('/getIssues', requireAuth(), getIssueAcrossMultSprint);

router.put('/issues/:issueId', requireAuth(), updateSingleIssue);

router.patch('/issues/update', requireAuth(), updateIssues);

router.delete('/issues/delete/:issueId', requireAuth(), deleteIssue);

router.post('/issues/:issueId/create_comments',requireAuth(), createissueComments);

router.get('/issues/:issueId/comments', requireAuth(), getComments);

module.exports = router;
import * as express from 'express';

const router = express.Router();

/*
* endpoint to queue a project for rendering. Decide to queue
* in ffmpeg queue or templater queue
*/
router.post('/', (req, res) => {
  // services
  const projectService = req.app.get('projects');
  const jobService = req.app.get('jobs');

  // params
  const projectId = req.body.projectId;

  const project = projectService.getProjectById(projectId)
    .then( project => {
      const queue = project.hasOverlays() ? 'templater-queue' : 'ffmpeg-queue';
      const operation = project.hasOverlays() ? 'render-assets' : 'render';
      jobService.queue(queue, projectId, operation);
    }).then(data => res.json({status: 'success'}));
});

module.exports = router;
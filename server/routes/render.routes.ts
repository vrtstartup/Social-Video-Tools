import * as express from 'express';

const router = express.Router();

/*
* endpoint to queue a project for rendering. Decide to queue
* in ffmpeg queue or templater queue
*/
router.post('/stitch', (req, res) => {
  // services
  const projectService = req.app.get('projects');
  const jobService = req.app.get('jobs');
  const state = req.app.get('state');

  // params
  const projectId = req.body.projectId;

  const project = projectService.getProjectById(projectId)
    .then( project => {
      const queue = project.hasOverlays() ? 'templater-queue' : 'ffmpeg-queue';
      const operation = project.hasOverlays() ? 'render-assets' : 'render';

      // update state to 'rendering' so user gets feedback
      state.updateState(project, 'queued', true);

      // continue processing the render request 
      jobService.queue(queue, projectId, operation);
    }).then(data => res.json({status: 'success'}));
});

router.post('/lowres', (req, res) => {
  // services
  const jobService = req.app.get('jobs');
  const stateService = req.app.get('state');
  const projectService = req.app.get('projects');

  // params
  const projectId = req.body.projectId;
  
  projectService.getProjectById(projectId)
    .then((project) => jobService.queue('ffmpeg-queue', projectId, 'lowres'))
    .then(data => res.json({status: 'success'}));
});

module.exports = router;
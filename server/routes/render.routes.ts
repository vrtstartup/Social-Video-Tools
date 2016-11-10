import * as express from 'express';

const router = express.Router();

// this can be used for downloading videos by users
router.post('/', (req, res) => {
  // services
  const projectService = req.app.get('projects');
  const jobService = req.app.get('jobs');

  // params
  const projectId = req.body.projectId;

  const project = projectService.getProjectById(projectId)
    .then( project => {
      const queue = project.hasTitles() ? 'templater-queue' : 'ffmpeg-queue';
      const operation = project.hasTitles() ? 'render-assets' : 'render';
      jobService.queue(queue, projectId, operation);
    }).then(data => res.json({status: 'success'}));
});

module.exports = router;
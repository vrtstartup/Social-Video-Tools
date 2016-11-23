import * as express from 'express';
import { config } from '../../common/config';

const logger = config.logger;
const router = express.Router();

router.get('/queue', (req, res) => {
  // return JSON object for templater to handle 

  // services
  const templateService = req.app.get('templates');
  const jobService = req.app.get('jobs');
  const projectService = req.app.get('projects');

  // return data
  let data = [];

  let project = jobService.getFirst('templater-queue')
    .then(job => projectService.getProjectByJob(job), reason => res.send([]))
    .then( project => res.send(project.parseOverlays()))
    .catch(errorHandler);

});


/*
* Update the status of a project title when templater has rendered the asset
*/ 
router.post('/status', (req, res) => {
    // parse request
    const overlayId = req.body.overlayId;
    const projectId = req.body.projectId;
    const status = req.body.status;

    // services
    const projectService = req.app.get('projects');
    const jobService = req.app.get('jobs');

    // update title 
    projectService.setProjectProperty(projectId, `annotations/${overlayId}/render-status`, 'done')
      .then(fbData => projectService.getProjectById(projectId))
      .then(project => {
        if (project.overlaysReady()) {
          // all overlays have been rendered, progress to next state 
          jobService.resolveJob('templater-queue', projectId);
          projectService.setProjectProperty(projectId, 'status/overlaysReady', true);
          jobService.queue('ffmpeg-queue', projectId, 'render');
        }
      }, errorHandler) 
      .then(data => res.send({success: true, info: 'overlay status has been updated.'}), errorHandler);
}); 

function errorHandler(error) { 
  logger.error('Something went wrong while getting templater queue', error);
}


module.exports = router;
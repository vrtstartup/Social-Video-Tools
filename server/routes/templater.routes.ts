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

  /*
  * This funtion gets the first job object from the 'templater-queue' list. A job contains a projectId and a current status
  * then, the related project data and available templates are fetched. Finally, the results from these three promises are
  * fed into the parseTitles() function which in turn returns an array of objects which is parseable by the templater bot. 
  * A job containes one project rather than an individual title because we want assets to be processed on a by-project basis, 
  * i.e the templater bot shouldn't render assets for project B before *all* assets for project A have been rendered.
  *
  * However, the templater bot needs a way to update the status for a specific title. 
  * 
  * This async structure is quite hard to write properly without async/await, see: 
  *
  *   http://stackoverflow.com/a/28250697/1185774
  */
  let templates = templateService.getAll();
  let project = jobService.getFirst('templater-queue')
    .then(job => projectService.getProjectByJob(job), err => errorHandler(err));


  Promise.all([
    templates,
    project
  ]).then((data) => {
    const templates = data[0];
    const project = data[1];

    res.send(project.parseOverlays(templates));
  }, err => errorHandler(err));

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
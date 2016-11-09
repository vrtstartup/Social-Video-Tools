import * as express from 'express';
import { parseTitles } from '../../common/services/templater.service'
import { logger } from '../../common/config/winston';

const router = express.Router();

router.get('/queue', (req, res) => {
  // return JSON object for templater to handle 
  const fireBase = req.app.get('fireBase');
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
  let templates = fireBase.getTemplates()
  let project = fireBase.getFirst('templater-queue')
    .then(job => fireBase.getProjectByJob(job), err => errorHandler(err));


  Promise.all([
    templates,
    project
  ]).then((data) => {
    const templates = data[0];
    const project = data[1];

    res.send(parseTitles(project, templates));
  }, err => errorHandler(err));

});


/*
* Update the status of a project title when templater has rendered the asset
*/ 
router.post('/status', (req, res) => {
    // parse request
    const titleId = req.body.titleId;
    const projectId = req.body.projectId;
    const status = req.body.status;

    const fireBase = req.app.get('fireBase');

    // update title 
    fireBase.setProjectProperty(projectId, `titles/${titleId}/render-status`, 'done')
      // .then(data => checkJobStatus) //#todo
      .then(data => res.send(data), errorHandler);

}); 

function errorHandler(error) { 
  logger.error('Something went wrong while getting templater queue', error);
}


module.exports = router;
import * as express from 'express';
import { config } from '../../common/config';

const logger = config.logger;
const router = express.Router();

router.post('/update', (req, res) => {
  // services
  const projectService = req.app.get('projects');
  const stateService = req.app.get('state');

  // params 
  const id = req.body.projectId;
  const state = req.body.state;
  const value = req.body.value

  projectService.getProjectById(id)
    .then( project => stateService.updateState(project, state, value))
    .then( data => res.json({status: 200}))
    .catch(errorHandler);
});

function errorHandler(error) { 
  logger.error('Something went wrong while getting templater queue', error);
}

module.exports = router;
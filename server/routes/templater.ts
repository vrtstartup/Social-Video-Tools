import * as express from 'express';
import { parseTitles } from '../../common/services/templater.service'

const router = express.Router();

router.get('/queue', (req, res) => {
  // return JSON object for templater to handle 
  const fireBase = req.app.get('fireBase');
  const db = fireBase.getDatabase();
  let data = [];

  fireBase.getFirst('templater-queue', db)
    .then((job) => {
      fireBase.getProject(job.projectId, db)
        .then(project => {
          fireBase.getTemplates(db)
            .then( templates => res.send(parseTitles(project, templates)));
        }, err => console.log(err));
    }, (warn) => res.json(warn));
});

module.exports = router;
import * as express from 'express';
import * as resolve from '../../common/services/resolver.service';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const router = express.Router();

const storageLowres = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = req.body.projectId;

    // #todo this is out of place
    resolve.makeProjectDirectories(baseDir);

    const dest = resolve.destinationDirectory('source', baseDir );
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const baseDir = req.body.projectId;
    cb(null, resolve.getFileNameByType('source', baseDir));
  }
});

const storageOverlays = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = req.body.projectId;

    console.log('test');
    console.log(req.body);
    console.log('baseDir: ', baseDir);

    // #todo this is out of place
    resolve.makeProjectDirectories(baseDir);

    const dest = resolve.destinationDirectory('overlay', baseDir );
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const baseDir = req.body.projectId;
    const overlayId = req.body.overlayId;

    const filename = overlayId + resolve.getFileNameByType('overlay', baseDir);
    cb(null, filename);
  }
});



const uploadLowres = multer({ storage: storageLowres }).fields([{ name: 'video' }]);
const uploadOverlays = multer({ storage: storageOverlays }).fields([{ name: 'video' }]);

router.post('/source', uploadLowres, (req: any, res) => {
  // services 
  const projects = req.app.get('projects');
  const jobs = req.app.get('jobs');
  const state = req.app.get('state');

  // parameters
  const projectId = req.body.projectId;
  const fileMeta = req.files.video[0];
  const fireBase = req.app.get('fireBase');

  const lowResUrl = resolve.staticUrl('lowres', projectId);

  // update project 
  const arrProms = [];

  arrProms.push(projects.setProjectProperties(projectId, {
    files: {
      'baseDir': projectId,
      'source': fileMeta.filename,
    },
    clip: {
      'lowResUrl': lowResUrl + '?' + Date.now(),
    }
  }));

  arrProms.push(projects.getProjectById(projectId));

  Promise.all(arrProms)
    .then( (data) => {
      const project = data[1];

      jobs.queue('ffmpeg-queue', project.data.id, 'lowres')
        .then(state.updateState(project, 'uploaded', true))
        .then(state.updateState(project, 'downscaled', false))
    })

  // respond to client request
  res.json({
    success: true,
    file: fileMeta,
    projectId: projectId,
    lowResUrl: lowResUrl,
  });

});

router.post('/overlay', uploadOverlays, (req:any, res) => res.json({
  success: true, 
  info: 'file has been uploaded.'
}));

module.exports = router;

import * as express from 'express';
import * as resolve from '../../common/services/resolver.service';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // #todo baseDir naming as project id is a project-wide convention, but not a flexible one
    const baseDir = req.body.projectId;

    // #todo this is out of place
    resolve.makeProjectDirectories(baseDir);
    
    const dest = resolve.destinationDirectory('source', baseDir );

    // this is multer's weird-ass way of passing strings...
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const baseDir = req.body.projectId;
    cb(null, resolve.getFileNameByType('source', baseDir));
  }
});

const upload = multer({ storage });

const file = upload.fields([{ name: 'video' }]);

router.post('/', file, (req: any, res) => {
  const projectId = req.body.projectId;
  const fileMeta = req.files.video[0];
  const fireBase = req.app.get('fireBase');

  // #todo: fix link for deployment
  // const lowResUrl = `${req.protocol}://${req.host}:8080/video/${projectId}/source-lowres.mp4`; 
  const lowResUrl = resolve.staticUrl('lowres', projectId);
  
  // update project 
  let proms = fireBase.setProjectProperties(projectId, {
    files: {
      'baseDir': projectId,
      'source': fileMeta.filename,
    },
    clip: {
      'lowResUrl': lowResUrl,
    } 
  });

  Promise.all(proms).then(
    // queue this project for lowres rendering
    fireBase.queue(projectId, 'lowres')
  )

  // respond to client request
  res.json({
    success: true,
    file: fileMeta,
    projectId: projectId,
    lowResUrl: lowResUrl,
  });

});

module.exports = router;

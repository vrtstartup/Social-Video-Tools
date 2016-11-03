import * as express from 'express';
import { FireBase } from '../../common/firebase/firebase.service';
import { destinationDirectory } from '../../common/services/resolver.service';
import { appConfig } from '../../common/config.temp';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const projectsDir = appConfig.workingDirectory; // #todo move to resolver service? 

// create projectsdirectory if none exists
if ( !fs.existsSync(projectsDir) ){
    fs.mkdirSync(projectsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = destinationDirectory('source', req.body.projectId );

    if ( !fs.existsSync(dest) ){
      fs.mkdirSync(dest);
    }

    // #todo catch errors
    /*
    let stat = null;

    try {
      stat = fs.statSync(dest);
    } catch (err) {
      fs.mkdirSync(dest);
    }

    if (stat && !stat.isDirectory()) {
      throw new Error(`Directory cannot be created because an inode of a different type exists at "${dest }"`);
    }
    */

    // this is multer's weird-ass way of passing strings...
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, appConfig.fileNames.source);
  }
});

const upload = multer({ storage });

const file = upload.fields([{ name: 'video' }]);

router.post('/', file, (req: any, res) => {
  const projectId = req.body.projectId;
  const fileMeta = req.files.video[0];
  const fireBase = req.app.get('fireBase');
  // #todo: fix link for deployment
  const lowResUrl = `${req.protocol}://${req.host}:8080/video/${projectId}/source-lowres.mp4`; 
  
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

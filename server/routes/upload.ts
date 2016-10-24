import * as express from 'express';
import { FireBase } from '../../common/firebase/firebase.service';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const projectsDir = path.join(__dirname, '../projects/');

// create projectsdirectory if none exists
if ( !fs.existsSync(projectsDir) ){
    fs.mkdirSync(projectsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    const dest = projectsDir + req.body.projectId;
    
    if ( !fs.existsSync(dest) ){
      fs.mkdirSync(dest);
    }

    // not sure what this is doing
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

    cb(null, dest);
  },
});

const upload = multer({ storage });

const file = upload.fields([{ name: 'video' }]);

router.post('/', file, (req: any, res) => {
  const projectId = req.body.projectId;
  const fileMeta = req.files.video[0];
  const fireBase = req.app.get('fireBase');
  // #todo: fix link
  // const lowResUrl = `${req.protocol}://${req.host}:8080/api/video/${projectId}.mp4`; 
  const lowResUrl = `${req.protocol}://${req.host}:8080/video/${projectId}/source-lowres.mp4`; 
  
  // update project 
  let proms = fireBase.setProjectProperties(projectId, {
    'baseDir': fileMeta.destination,
    'clip': {
      'fileName': fileMeta.filename,
      'lowResUrl': lowResUrl,
    }
  });

  Promise.all(proms).then(
    // queue this project for lowres rendering
    fireBase.queue(projectId)
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

import * as express from 'express';
import * as resolve from '../../common/services/resolver.service';
import * as storage from '../../common/services/storage.service';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const router = express.Router();

const storageOverlays = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = req.body.projectId;

    // #todo this is out of place
    resolve.makeProjectDirectories(baseDir);

    const dest = resolve.destinationDirectory('overlay', baseDir );
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const overlayId = req.body.overlayId;
    const filename = resolve.getFileNameByType('overlay', overlayId);
    cb(null, filename);
  }
});



const uploadOverlays = multer({ storage: storageOverlays }).fields([{ name: 'video' }]);


router.get('/sign-s3', (req, res) =>{
  const projectId = decodeURIComponent(req.query['project-id']);
  const fileType = req.query['file-type'];
  const fileExtension = req.query['file-ext'];
  const data = storage.signUrl(fileType, fileExtension, projectId)
    .then(data => res.json(data))
    .catch(console.log);
});

router.post('/overlay', uploadOverlays, (req:any, res) => res.json({
  success: true, 
  info: 'file has been uploaded.'
}));

module.exports = router;

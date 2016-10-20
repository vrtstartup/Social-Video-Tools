
import * as express from 'express';
import { FireBase } from '../../common/firebase/firebase.service';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '/../projects/', req.body.projectId);
    
    let stat = null;

    try {
      stat = fs.statSync(dest);
    } catch (err) {
      fs.mkdirSync(dest);
    }

    if (stat && !stat.isDirectory()) {
      throw new Error(`Directory cannot be created because an inode of a different type exists at "${dest }"`);
    }

    cb(null, dest);
  },
});
const upload = multer({
  dest: path.join(__dirname, '/../projects'),
  storage,
});

const file = upload.fields([{ name: 'video' }]);

router.post('/', file, (req: any, res) => {
  // queue this project for lowres rendering
  FireBase.queue(req.body.projectId);
  
  // respond to client request
  res.json({
    success: true,
    file: req.files.video[0],
    projectId: req.body.projectId,
  });
});

module.exports = router;

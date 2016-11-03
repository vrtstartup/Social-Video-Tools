import * as express from 'express';
import { resolve } from 'path';
import { getFilePathByType } from '../../common/services/resolver.service';

const router = express.Router();

// this can be used for downloading videos by users
router.get('/video/:baseDir', (req, res) => {
  const baseDir = req.params.baseDir;

  // #todo: this is placeholdercontent
  const filePath = getFilePathByType('source', baseDir);
  console.log("API", filePath);
  res.sendFile(filePath);
});

module.exports = router;
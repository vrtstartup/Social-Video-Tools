import * as express from 'express';
import { resolve } from 'path';
import { getFilePathByType } from '../../common/services/resolver.service';

const router = express.Router();

// this can be used for downloading videos by users
router.get('/render/:baseDir', (req, res) => {
  const baseDir = req.params.baseDir;

  // #todo: this is placeholdercontent
  const filePath = getFilePathByType('render', baseDir);
  res.sendFile(filePath);
});

module.exports = router;
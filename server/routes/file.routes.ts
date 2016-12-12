import * as express from 'express';
import { resolve } from 'path';
import { getProjectFilePath } from '../../common/services/resolver.service';

const router = express.Router();

// this can be used for downloading videos by users
router.get('/render/:baseDir', (req, res) => {
  const baseDir = req.params.baseDir;

  // #todo: this is placeholdercontent
  const filePath = getProjectFilePath('render', baseDir);
  res.download(filePath);
});

module.exports = router;
import * as express from 'express';
import * as resolve from '../../common/services/resolver.service';
import * as aws from 'aws-sdk';
import { logger } from '../../common/config/winston';
import { storage } from  '../../common/config/s3'

aws.config.update({region: storage.region}); //#todo move to configuration file
const  s3 = new aws.S3({signatureVersion: 'v4'});

const router = express.Router();

router.get('/download/:projectKey', (req, res, next) => {
  const projectKey = req.params.projectKey;
  const fileKey = resolve.getProjectFileKey('render', projectKey);

  const s3Params = {
    Bucket: storage.bucket,
    Key: fileKey,
  };

  res.attachment(`${projectKey}.mp4`);

  s3.getObject(s3Params)
    .createReadStream()
    .on('error', logger.error)
    .pipe(res);
});
module.exports = router;
import * as express from 'express';
import * as resolve from '../../common/services/resolver.service';
import * as storage from '../../common/services/storage.service';

const router = express.Router();

router.get('/sign-s3', (req, res) =>{
  const projectId = decodeURIComponent(req.query['project-id']);
  const fileType = req.query['file-type'];
  const fileExtension = req.query['file-ext'];
  const data = storage.signUrl(fileType, fileExtension, projectId)
    .then(data => res.json(data))
    .catch(console.log);
});


module.exports = router;

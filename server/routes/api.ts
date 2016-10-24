import * as express from 'express';
import { resolve } from 'path';
const router = express.Router();

router.get('/video/:videoId.mp4', (req, res) => {
  // return a direct link to the static lowres video file
  // provide a project id as parameter
  const videoId = req.params.videoId;

  // get project data using service wrapper 
  const staticFilesDir = resolve(__dirname, '../projects');
  const projectDir = resolve(staticFilesDir, videoId);
  const fileName = 'source-lowres.mp4';
  const filePath = resolve(projectDir, fileName);

  res.sendFile(filePath);
});

module.exports = router;
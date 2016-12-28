import * as express from 'express';
import { config } from '../../common/config';

const logger = config.logger;
const router = express.Router();

router.post('/new', (req, res) => {
  // services
  const messageService = req.app.get('message');

  // params
  const message = req.body.message;
  const user = req.body.email;
  const location = req.body.location;

  messageService.send(user, message, location)
    .then(respond);

  function respond(response){ 
    console.log(response);

    res.json({ 
      status: 200,
      response: response
    })
  }
});

function errorHandler(error) { 
  logger.error('Something went wrong while getting templater queue', error);
}

module.exports = router;
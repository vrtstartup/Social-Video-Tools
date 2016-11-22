import * as express from 'express';
import { FireBase } from '../common/services/firebase.service';
import { Projects } from '../common/services/projects.service';
import { Jobs } from '../common/services/jobs.service';
import { Templates } from '../common/services/templates.service';
import { State } from '../common/services/state.service';
import { resolve } from 'path';
import { config } from '../common/config';

const fServer = config.routing.fileServer;
const logger = config.logger;

const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// init firebase
// const db = FireBase.database();
const fireBase = new FireBase();
const projects = new Projects(fireBase, logger);
const state = new State(fireBase, logger);
const jobs = new Jobs(fireBase, logger);
const templates = new Templates(fireBase, logger);

// init server
const server = express();
const port = process.env.PORT || 3000;

const uploadRoutes = require('./routes/upload.routes');
const fileRoutes = require('./routes/file.routes');
const templaterRoutes = require('./routes/templater.routes');
const renderRoutes = require('./routes/render.routes');

server.set('projects', projects);
server.set('state', state);
server.set('jobs', jobs);
server.set('templates', templates);
server.use(bodyParser());

let publicPath = config.filesystem.workingDirectory;
server.use('/video', express.static(publicPath)); 

// when getting root, serve angular client
const pathToClient = path.join(__dirname, '../dist');

server.use('/', express.static(pathToClient));

const originsWhitelist = [`${fServer.protocol}://${fServer.domain}:${fServer.port}`];

const corsOptions = {
  origin: (origin, callback) => {
    const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  },
  credentials: true,
};

server.use(cors(corsOptions));

server.use('/api/upload', uploadRoutes);
server.use('/api/file', fileRoutes);
server.use('/api/templater', templaterRoutes);
server.use('/api/render', renderRoutes);

logger.verbose('listening on port: ' + port);
server.listen(port);

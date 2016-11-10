import * as express from 'express';
import { FireBase } from '../common/services/firebase.service';
import { Projects } from '../common/services/projects.service';
import { Jobs } from '../common/services/jobs.service';
import { Templates } from '../common/services/templates.service';
import { resolve } from 'path';
import { fileConfig } from '../common/config/files';
import { logger } from '../common/config/winston';

const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('../common/config');

// init firebase
// const db = FireBase.database();
const fireBase = new FireBase();
const projects = new Projects(fireBase, logger);
const jobs = new Jobs(fireBase, logger);
const templates = new Templates(fireBase, logger);

// init server
const server = express();
const port = process.env.PORT || config.port;

const uploadRoutes = require('./routes/upload.routes');
const fileRoutes = require('./routes/file.routes');
const templaterRoutes = require('./routes/templater.routes');

server.set('projects', projects);
server.set('jobs', jobs);
server.set('templates', templates);
server.use(bodyParser());

let publicPath = fileConfig.workingDirectory;
server.use('/video', express.static(publicPath)); 

// when getting root, serve angular client
const pathToClient = path.join(__dirname, '../dist');

server.use('/', express.static(pathToClient));

const originsWhitelist = [
  'http://localhost:3000',
];

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

logger.verbose('listening on port: ' + port);
server.listen(port);

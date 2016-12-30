import * as express from 'express';
import { db } from '../common/services/firebase.service';
import { Projects } from '../common/services/projects.service';
import { Jobs } from '../common/services/jobs.service';
import { Templates } from '../common/services/templates.service';
import { State } from '../common/services/state.service';
import { Message } from '../common/services/message.service';
import { resolve } from 'path';
import { config } from '../common/config';

const fServer = config.routing.fileServer;
const logger = config.logger;

const morgan:any = require('morgan');
const path:any = require('path');
const cors:any = require('cors');
const bodyParser:any = require('body-parser');
const compression  = require('compression');

// init firebase
// const db = FireBase.database();
const projects = new Projects();
const state = new State();
const jobs = new Jobs();
const templates = new Templates();
const message = new Message();

// init server
const server = express();
const port = process.env.PORT || 3000;

const uploadRoutes:any = require('./routes/upload.routes');
const fileRoutes:any = require('./routes/file.routes');
const templaterRoutes:any = require('./routes/templater.routes');
const renderRoutes:any = require('./routes/render.routes');
const stateRoutes:any = require('./routes/state.routes');
const messageRoutes:any = require('./routes/message.routes');

server.set('projects', projects);
server.set('state', state);
server.set('message', message);
server.set('jobs', jobs);
server.set('templates', templates);

server.use(compression());
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
server.use('/api/state', stateRoutes);
server.use('/api/message', messageRoutes);

server.use('*', express.static(pathToClient));

logger.verbose('listening on port: ' + port);
server.listen(port);

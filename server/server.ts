import * as express from 'express';
import { FireBase } from '../common/firebase/firebase.service';

const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// init firebase
const db = FireBase.database();

// init server
const server = express();
const port = process.env.PORT || 8080;

const uploadRoutes = require('./routes/upload');

server.set('db', db);
server.use(bodyParser());

// when getting root, serve angular client
const pathToClient = path.join(__dirname, '../dist/dev');

console.log(pathToClient);
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
server.use('/upload', uploadRoutes);
console.log(port);
server.listen(port);

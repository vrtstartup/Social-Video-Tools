require('ts-node/register');
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var bodyParser = require('body-parser');
var server = express();
var port = process.env.PORT || 8080;
var uploadRoutes = require('./routes/upload');
server.use(bodyParser());
var pathToClient = path.join(__dirname, '../dist/dev');
console.log(pathToClient);
server.use('/', express.static(pathToClient));
var originsWhitelist = [
    'http://localhost:3000',
];
var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true,
};
server.use(cors(corsOptions));
server.use('/upload', uploadRoutes);
console.log(port);
server.listen(port);
//# sourceMappingURL=server.js.map
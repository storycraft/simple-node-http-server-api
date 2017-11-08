# simple-node-http-server-api
Nodejs Simple Server API

# Example

let server = require('server');

var httpServer = server.createServer(new require('logger'));

httpServer.run(80);


or


let server = require('server');

var httpServer = server.createServer(new require('logger'),80);

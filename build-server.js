var express = require('express');
var path = require('path');
var server = express();
server.use('/', express.static(path.join(__dirname, 'build')));
server.listen(8081, () => {
    console.log("build server started");
});
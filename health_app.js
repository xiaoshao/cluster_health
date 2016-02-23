var express = require("express");
var cluster = require("cluster");
var webApp = function(port){
    var app = express();
    app.get('/', function (req, res) {
        res.send('Hello World!' + cluster.worker.id);
    });

    app.listen(port);
};

module.exports = webApp;

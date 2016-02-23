var cluster = require("cluster");
var express = require('express');
var unirest = require('unirest');
var health = require("health_app");

var worker_infos = [];

var create_new_app = function (worker_info) {
    try{
        var index = worker_infos.indexOf(worker_info);
        var old_worker_id = worker_infos[index].id;
        cluster.workers[old_worker_id].kill();
        var worker = cluster.fork({"port": worker_info.port});
        worker_infos[index].id = worker.id;
    }catch(ex){
        console.log("an error occurred : " + ex );
    }

};

var clus = function (app, count, startPort) {

    if (cluster.isMaster) {

        for (var i = 0; i < count; i += 1) {
            var port = startPort + i;

            var worker_info = cluster.fork({"port": port});

            worker_infos.push({"id": worker_info.id, "port": port})
        }

        setInterval(function () {
            worker_infos.forEach(function (worker_info) {
                unirest.get('http://localhost:' + worker_info.port).end(function handler(response) {
                    if (!(response && response.status == 200)) {
                        create_new_app(worker_info);
                    }
                });
            });
        }, 1000);

    } else {
        health(process.env.port);
        app();
    }
};

module.exports = clus;

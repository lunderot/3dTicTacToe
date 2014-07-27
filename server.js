var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server, {log: true});
	
server.listen(80);

app.get("/", function(req, res){
	res.sendfile(__dirname + "/client/index.html");
});

app.get(/^(.+)$/, function(req, res){
	res.sendfile("client/" + req.params[0]);
});
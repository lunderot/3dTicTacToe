var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server, {log: true});

var combos = [
	parseInt("111000000000000000000000000", 2),
	parseInt("000111000000000000000000000", 2),
	parseInt("000000111000000000000000000", 2),
	parseInt("000000000111000000000000000", 2),
	parseInt("000000000000111000000000000", 2),
	parseInt("000000000000000111000000000", 2),
	parseInt("000000000000000000111000000", 2),
	parseInt("000000000000000000000111000", 2),
	parseInt("000000000000000000000000111", 2)
];

function Player(socket, nickname, type)
{
	this.socket = socket;
	this.nickname = nickname;
	this.markers = 0;
	this.hasTurn = false;
	this.type = type;
}

Player.prototype.swapMarker = function(marker) {
	this.markers ^= marker;
};

Player.prototype.placeMarker = function(marker) {
	if(!this.hasCombo(marker)) {
		this.swapMarker(marker);
		return true;
	}
	else {
		return false;
	}
};

Player.prototype.resetMarkers = function() {
	this.markers = 0;
};

Player.prototype.hasCombo = function(combo) {
	return (this.markers & combo) == combo;
};

Player.prototype.getScore = function() {
	var score = 0;
	for (var i = combos.length - 1; i >= 0; i--) {
		if(this.hasCombo(combos[i])) {
			score++;
		}
			
	};
	return score;
};

Player.prototype.swapTurn = function() {
	this.hasTurn = !this.hasTurn;
};

function getPlayerIdFromSocket (socket) {
	var index = undefined;
	for (var i = players.length - 1; i >= 0; i--) {
		if(players[i].socket == socket) {
			index = i;
			break;
		}
	};
	return index;
}

function getPlayerFromSocket (socket) {
	var index = getPlayerIdFromSocket(socket);
	if (index == undefined) {
		return undefined;
	}
	else {
		return players[index];
	}
}

//Game variables
var players = [];
var currentPlayerId = 0;
var gameRunning = false;


//Setup the server
server.listen(80);

app.get("/", function(req, res){
	res.sendfile(__dirname + "/client/index.html");
});

app.get(/^(.+)$/, function(req, res){
	res.sendfile("client/" + req.params[0]);
});


//Socket setup
io.on("connection", function(socket) {
	socket.on("disconnect", function() {
		var index = getPlayerIdFromSocket(socket);
		if (index != undefined) {
			socket.broadcast.emit("chatmessage", players[index].nickname + " has disconnected.");
			players.splice(index, 1);
		};
	});

	socket.on("chatmessage", function(data) {
		var player = getPlayerFromSocket(socket);
		io.sockets.emit("chatmessage", player.nickname + ": " + data);
	});

	socket.on("clientinfo", function(data) {
		players.push(new Player(socket, data.nickname, "circle"));
		socket.broadcast.emit("chatmessage", data.nickname + " has connected.");
		if (players.length == 2 && !gameRunning) {
			//Start game
			gameRunning = true;
			//Randomize turn
			currentPlayerId = Math.floor(Math.random()*players.length);
			players[currentPlayerId].type = "cross";
		};
	});

	socket.on("place", function(data) {
		var playerId = getPlayerIdFromSocket(socket);
		var player = getPlayerFromSocket(socket);

		if(playerId != undefined)
		{
			if (playerId == currentPlayerId) {
				if(player.placeMarker(data)) { //Player made a valid move
					io.sockets.emit("update", {data: player.markers, type: player.type, score: player.getScore()});
					//Set current player to the next player in the list
					currentPlayerId++;
					currentPlayerId %= players.length;
				}
				else {
					//Invalid move
					socket.emit("chatmessage", "Invalid move.");
				}
			}
			else {
				socket.emit("chatmessage", "It is not your turn.");
			}
		}
	});
	
});
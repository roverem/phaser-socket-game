var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var p2 = require('p2');

var players = {};
var dt = 1/30;
var boxShape;
var boxBody;
var world;

var boxData = [];

var star = {
	x: Math.floor(Math.random() * 700) + 50,
	y: Math.floor(Math.random() * 500) + 50
};

var scores = {
	blue: 0,
	red: 0
};

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', function (socket) {
	console.log('a user connected');
	
	// #################### p2 ####################
	world = new p2.World({
		gravity: [0, 10]
	});
	
	boxShape = new p2.Box({ width:2, height:1 });
	boxBody = new p2.Body({
		mass:1,
		position:[350,300],
		angularVelocity:1
	});
	
	boxBody.addShape(boxShape);
	world.addBody(boxBody);
	
	
	
	//this.world.on("beginContact", this.onBeginContact.bind(this));
	
	// #################### p2 ####################
  
	// create a new player and add it to our players object
	players[socket.id] = {
	  rotation: 0,
	  x: Math.floor(Math.random() * 700) + 50,
	  y: Math.floor(Math.random() * 500) + 50,
	  playerId: socket.id,
	  team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
	};
	
	// send the players object to the new player
	socket.emit('currentPlayers', players);
	
	// send the star object to the new player
	socket.emit('starLocation', star);
	
	// send the current scores
	socket.emit('scoreUpdate', scores);
	
	// update all other players of the new player
	socket.broadcast.emit('newPlayer', players[socket.id]);
  
	socket.on('disconnect', function () {
		console.log('user disconnected');
		
		// remove this player from our players object
		delete players[socket.id];
		// emit a message to all players to remove this player
		io.emit('disconnect', socket.id);
	});
	
	// when a player moves, update the player data
	socket.on('playerMovement', function (movementData) {
	  players[socket.id].x = movementData.x;
	  players[socket.id].y = movementData.y;
	  players[socket.id].rotation = movementData.rotation;
	  // emit a message to all players about the player that moved
	  socket.broadcast.emit('playerMoved', players[socket.id]);
	});
	
	socket.on('starCollected', function() {
		console.log('user from team ' + players[socket.id].team + ' collected');
		if (players[socket.id].team === 'red'){
			scores.red += 10;
		}else{
			scores.blue += 10;
		}
		
		star.x = Math.floor(Math.random() * 700) + 50;
		star.y = Math.floor(Math.random() * 500) + 50;
		
		io.emit('starLocation', star);
		io.emit('scoreUpdate', scores);
	});
	
	socket.on('space', function(){
		console.log( players[socket.id] + " pressed space");
		let acceleration = p2.vec2.create();
		acceleration[0] = 0;
		acceleration[1] = -20;
		
		boxBody.applyForce(acceleration);
	});
});

setInterval( () => {
	
	if (!boxBody) return;
	
	let x = boxBody.position[0];//Math.floor(Math.random() * 700) + 50;
	let y = boxBody.position[1];//Math.floor(Math.random() * 500) + 50;
	
	world.step(dt);
	
	
	io.emit('game', [x,y] ); //update?
}, dt * 1000);
 
server.listen(process.env.PORT || 5000, function () {
  console.log(`Listening on ${server.address().port}`);
});
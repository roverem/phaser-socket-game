var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

const User = require('./user.js');
const GameWorld = require('./gameworld.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


var dt = 1/30;
var gameworld;

io.on('connection', (socket) => {
	console.log('user connected', socket.id);
	
	// Instantiate User:
	//let user = new User(socket);
	//user.log();
	
	if (gameworld instanceof GameWorld == false){
		//TODO: CUANDO SE DESCONECTA EL ÙLTIMO. APAGAR EL WORLD.
		gameworld = new GameWorld(io);
	}
	
	gameworld.connectPlayer(socket);
	
	socket.on('disconnect', function(){
		gameworld.disconnectPlayer(socket.id);
	});

	socket.on('onKeyDown', function(direction){
		gameworld.onKeyDown(socket.id, direction);
	});

	socket.on('onKeyUp', function(direction){
		gameworld.onKeyUp(socket.id, direction);
	});
	
	/*socket.on('input', function(inputData){
		gameworld.inputRecording(socket.id, inputData);
	});*/
});

setInterval( () => {
	if ( gameworld instanceof GameWorld ) {
		gameworld.update(dt);
	}
}, dt * 1000);
 
server.listen(process.env.PORT || 5000, function () {
  console.log(`Listening on ${server.address().port}`);
});
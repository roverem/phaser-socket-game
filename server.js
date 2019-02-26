var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

const User = require('./user.js');
const Game = require('./game.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


var dt = 1/5;
var game;

io.on('connection', (socket) => {
	console.log('user connected', socket.id);
	
	// Instantiate User:
	//let user = new User(socket);
	//user.log();
	
	if (game instanceof Game == false){
		//TODO: CUANDO SE DESCONECTA EL ÙLTIMO. APAGAR EL WORLD.
		game = new Game(io);
	}
	
	game.connectPlayer(socket);
	
	socket.on('disconnect', function(){
		game.disconnectPlayer(socket.id);
	});
});

setInterval( () => {
	if ( game instanceof Game ) {
		game.update(dt);
	}
}, dt * 1000);
 
server.listen(process.env.PORT || 5000, function () {
  console.log(`Listening on ${server.address().port}`);
});
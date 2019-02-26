var p2 = require('p2');

class Game 
{
	constructor(io)
	{
		this.io = io;
		
		this.players = {};
		
		this.p2World = new p2.World();
		
		console.log( "Game instance created" );
	}
	
	connectPlayer(socket)
	{
		console.log("Connecting " + socket.id + " player");
		
		this.players[socket.id] = {
			rotation: 0,
			x: Math.floor(Math.random() * 700) + 50,
			y: Math.floor(Math.random() * 500) + 50,
			playerId: socket.id,
			team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
		}
		
		//Le pasa al jugador nuevo, los otros jugadores.
		socket.emit('currentPlayers', this.players);
		
		//avisa al jugador ingresante el estado del juego
		socket.emit("gameInitialState", "avisa al jugador ingresante el estado del juego");
		
		//avisa a todos los jugadores del nuevo jugador.
		socket.broadcast.emit('newPlayer', this.players[socket.id]);
	}
	
	disconnectPlayer(playerId)
	{
		delete this.players[playerId];
		//avisa a todos los jugadores que se fue uno
		this.io.emit('disconnect', playerId);
	}
	
	update(dt)
	{
		console.log("updating game world on " + dt);
	}
	
}

module.exports = Game;
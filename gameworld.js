var p2 = require('p2');
var p2World;

class GameWorld{
	constructor(io, dt){
		this.io = io;
		
		this.players = {};
		this.dt = dt;
		
		p2World = new p2.World({
			gravity:[0, 10]
		});
		
		this.ready = true;
		console.log("world created");
	}
	
	connectPlayer(socket)
	{
		players[socket.id] = {
			rotation: 0,
			x: Math.floor(Math.random() * 700) + 50,
			y: Math.floor(Math.random() * 500) + 50,
			playerId: socket.id,
			team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
		}
		
		//avisar al resto que hay un jugador nuevo.
		socket.emit('currentPlayers', players);
		
		var xt = Math.floor(Math.random() * 700) + 50;
		var yt = Math.floor(Math.random() * 500) + 50;
		
		socket.emit('gameDataUpdate', [xt, yt]/*, score, starLocation, etc*/);
		
		socket.broadcast.emit('newPlayer', players[socket.id]);
	}
	
	disconnectPlayer(playerId)
	{
		delete players[playerId];
		this.io.emit('disconnect', playerId);
	}
	
	update(dt)
	{
		p2World.step(dt);
		
		io.emit('gameUpdate' /*, playerCoords*/)
	}
}

module.exports = GameWorld;
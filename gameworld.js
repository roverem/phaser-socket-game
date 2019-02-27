var p2 = require('p2');

class Game 
{
	constructor(io)
	{
		this.io = io;
		
		//ESTOY USANDO 2 PORQUE UNO LO USO PARA ENVIAR A LOS JUGADORES.
		this._players = {};
		this.players = {};
		
		this.p2World = new p2.World({
			gravity : [0,-3],
		});
		
		console.log( "Game instance created" );
	}
	
	connectPlayer(socket)
	{
		console.log("Connecting " + socket.id + " player");
		
		let player = {
			/*rotation: 180,
			x: Math.floor(Math.random() * 700) + 50,
			y: Math.floor(Math.random() * 500) + 50,*/
			//team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
			
			playerId: socket.id,
			shape: new p2.Circle({radius:2}),
			body: new p2.Body({ mass: 1, position:[50,500], /*rotation: 180, */angularVelocity:1})
		}
		
		player.body.addShape(player.shape);
		this.p2World.addBody(player.body);
		
		this._players[socket.id] = player;
		
		this.players[socket.id] = [ 
			player.playerId,
			player.body.position[0],
			player.body.position[1],
			player.body.rotation,
			'red'
		]
		
		//Le pasa al jugador nuevo, los otros jugadores.
		socket.emit('currentPlayers', this.players);
		
		//avisa al jugador ingresante el estado del juego
		socket.emit("gameInitialState", "avisa al jugador ingresante el estado del juego");
		
		//avisa a todos los jugadores del nuevo jugador.
		socket.broadcast.emit('newPlayer', this.players[socket.id]);
	}
	
	disconnectPlayer(playerId)
	{
		delete this._players[playerId];
		delete this.players[playerId];
		//avisa a todos los jugadores que se fue uno
		this.io.emit('disconnect', playerId);
	}
	
	update(dt)
	{
		console.log("updating game world on " + dt + " for " + this.players);
		
		this.p2World.step(dt);
		
		this.updatePublicPlayers()
		
		this.io.emit('gameUpdate', this.players);
	}
	
	updatePublicPlayers(){
		for (let playerId in this._players){
			let _player = this._players[playerId];
			this.players[playerId][1] = _player.body.position[0];
			this.players[playerId][2] = _player.body.position[1];
			//player.body.rotation,
		}
	}
}

module.exports = Game;
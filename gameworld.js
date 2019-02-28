var p2 = require('p2');

class Game 
{
	constructor(io)
	{
		this.io = io;
		
		//ESTOY USANDO 2 PORQUE UNO LO USO PARA ENVIAR POR EMIT A LOS JUGADORES.
		this._players = {};
		this.players = {};
		
		this.p2World = new p2.World({
			gravity : [0, 0],
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
			shape: new p2.Box({ width: 96, height: 96 }),
			body: new p2.Body({ mass: 10, position:[50,500], /*rotation: 180, */angularVelocity:1}),
			input: {}
		}
		
		player.body.damping = player.body.angularDamping = 0;
		player.body.addShape(player.shape);
		this.p2World.addBody(player.body);
		
		this._players[socket.id] = player;
		
		
		//OPTIMIZACION PARA NO MANDAR TODA LA DATA DEL OBJETO COMPLEJO DE FISICA.
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
	
	inputRecording(playerId, inputData){
		//console.log(inputData + " pressed by " + playerId);
		this._players[playerId].input = inputData;
	}
	
	update(dt)
	{
		//console.log("updating game world on " + dt + " for " + this.players);
		
		this.updatePhysics();
		
		this.p2World.step(dt);
		
		this.updatePublicPlayers()
		
		this.io.emit('gameUpdate', this.players);
	}
	
	updatePhysics(){
		for (let playerId in this._players)
		{
			let player = this._players[playerId];
			if (player.input.left){
				console.log(playerId + " pressed left");
				player.body.velocity[0] = -30;
			} else if (player.input.right){
				console.log(playerId + " pressed right");
				player.body.velocity[0] = 30;
			} else {
				//player.body.angularVelocity = 0;
			}
			
			if (player.input.up){
				console.log(playerId + " pressed UP");
				player.body.applyForceLocal([0,10]);
			}
			if (player.input.down){
				console.log(playerId + " pressed DOWN");
				player.body.applyForceLocal([0,-10]);
			}
			
			player.input = {};
		}
		
	}
	
	updatePublicPlayers(){
		for (let playerId in this._players){
			let _player = this._players[playerId];
			this.players[playerId][1] = _player.body.position[0];
			this.players[playerId][2] = _player.body.position[1];
			this.players[playerId][3] = _player.body.angle;
		}
	}
}

module.exports = Game;
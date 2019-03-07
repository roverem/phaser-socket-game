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
		let shape = new p2.Box({ width: 96, height: 96 });
		let body = new p2.Body({ mass: 0.3, position:[50,500], /*rotation: 180, angularVelocity:0*/});
		let vehicle = new p2.TopDownVehicle(body);

		let frontWheel = vehicle.addWheel({
			localPosition: [48, 96] // front
		});
		//frontWheel.setSideFriction(4);
		let backWheel = vehicle.addWheel({
			localPosition: [0, 0] // back
		});
		//backWheel.setSideFriction(3);

		let player = {
			playerId: socket.id,
			shape: shape,
			body: body,
			vehicle: vehicle,
			frontWheel: frontWheel,
			backWheel: backWheel,
			input: {
				left: 0,
				right: 0,
				up: 0,
				down: 0
			}
		}
		
		//player.body.damping = player.body.angularDamping = 0;
		player.body.addShape(player.shape);
		player.vehicle.addToWorld(this.p2World);
		this.p2World.addBody(player.body);
		
		this._players[socket.id] = player;
		
		
		//OPTIMIZACION PARA NO MANDAR TODA LA DATA DEL OBJETO COMPLEJO DE FISICA.
		this.players[socket.id] = [ 
			player.playerId,
			player.body.position[0],
			player.body.position[1],
			player.body.angle,
			'red'
		]

		/*socket.on('onKeyDown', function(keyDown){
			this.onKeyDown( this._players[socket.id], keyDown );
		});

		socket.on('onKeyUp', function(keyUp){
			this.onKeyUp( this._players[socket.id], keyUp );
		});*/
		
		this.updatePublicPlayers();
		
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

	onKeyDown(playerId, direction) {
		let player = this._players[playerId];
		player.input[direction] = 1;
		this.onInputChange(player);
	}

	onKeyUp(playerId, direction) {
		let player = this._players[playerId];
		player.input[direction] = 0;
		this.onInputChange(player);
	}

	onInputChange(player){
		let speed = 70;
		//let turnSpeed = 1500;
		let maxSteer = Math.PI / 7;

		player.frontWheel.steerValue = maxSteer * (player.input.left - player.input.right );
		player.backWheel.engineForce = player.input.up * speed;

		console.log(player.playerId + "steerValue: " + player.frontWheel.steerValue);
		console.log(player.playerId + "engineForce: " + player.backWheel.engineForce);

		player.backWheel.setBrakeForce(0);
		if(player.input.down){
			if(player.backWheel.getSpeed() > 0.1){
				// Moving forward - add some brake force to slow down
				player.backWheel.setBrakeForce(5);
			} else {
				// Moving backwards - reverse the engine force
				player.backWheel.setBrakeForce(0);
				player.backWheel.engineForce = -speed/2;
			}
		}
	}
	
	update(dt)
	{
		this.updatePhysics();
		//console.log("updating game world on " + dt + " for " + this.players);
		this.updatePublicPlayers();
		this.io.emit('gameUpdate', this.players);
				
		this.p2World.step(dt);
	}
	
	updatePhysics(){
		for (let playerId in this._players)
		{
			let player = this._players[playerId];
			
			//player.body.velocity[0] *= 0.98;
			//player.body.velocity[1] *= 0.98;
			
			/*if (player.input.left){
				console.log(playerId + " pressed left");
				//player.body.velocity[0] = -speed;
			} else if (player.input.right){
				console.log(playerId + " pressed right");
				//player.body.velocity[0] = speed;
			} else {
				//player.body.angularVelocity = 0;
				//player.frontWheel.steerValue = 0;
			}
			
			if (player.input.up){
				console.log(playerId + " pressed UP");
				//player.body.velocity[1] = -speed;
			}

			if (player.input.down){
				console.log(playerId + " pressed DOWN");
				//player.body.velocity[1] = speed;
			}*/
			
			//console.log(player.playerId + " - steerValue: " + player.frontWheel.steerValue);
			//console.log(player.playerId + " - engineForce: " + player.backWheel.engineForce);

			this.warp(player.body);
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

	// If the body is out of space bounds, warp it to the other side
	warp(body){
		var p = body.position;
		if(p[0] >  800) p[0] = 0;
		if(p[1] >  600) p[1] = 0;
		if(p[0] < 0) p[0] =  800;
		if(p[1] < 0) p[1] =  600;
	}
}

module.exports = Game;
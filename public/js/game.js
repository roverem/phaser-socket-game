var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};
 
var game = new Phaser.Game(config);

 
function preload() {
	this.load.image('ship', 'assets/spaceShips_001.png');
	this.load.image('otherPlayer', 'assets/enemyBlack5.png');
	this.load.image('star', 'assets/star_gold.png');
	
	this.load.image('redCar', 'assets/red-car.bmp');
}
 
function create() {
	
	var self = this;
	
	this.socket = io();
	this.otherPlayers = this.physics.add.group();
	this.graphics = this.add.graphics();
	
	
	this.allPlayers = this.physics.add.group();
	
	this.socket.on('currentPlayers', function (players) {
		for (let playerId in players){
			let player = players[playerId];
			addPlayer(self, player);
		}
	});

	this.socket.on('newPlayer', function(playerInfo){
		addPlayer(self, playerInfo);
	});
	
	this.socket.on('disconnect', function(playerId){
		self.otherPlayers.getChildren().forEach(function (otherPlayer){
			if (playerId === otherPlayer.playerId) {
				otherPlayer.destroy();
			}
		});
	});
	
	this.socket.on('gameUpdate', function (players) {
		//console.log("gameUpdate " + players);
		//console.log(players[ self.socket.id ]);
		
		let allP = self.allPlayers.getChildren();
		
		for (let i = 0; i < allP.length; i++)
		{
			let playerImage = allP[i];
			console.log( playerImage.playerId );
			for (let playerId in players){
				let player = players[playerId];
				console.log( "id: " + player[0] + "x: " + player[1] + "| y: " + player[2] );
				
				if (playerId == playerImage.playerId){
					console.log(playerImage.playerId + " updating");
					playerImage.setPosition(player[1], player[2]);
				}
			}
		}
	});
	
	this.cursors = this.input.keyboard.createCursorKeys();
	
	let coco = this.add.text(16, 500, "", { fontSize: '32px', fill: '#0000FF' });
	coco.setText("TESTINGGGGG!");
}

function addPlayer(self, playerInfo) {
	let playerId = playerInfo[0];
	let x = playerInfo[1];
	let y = playerInfo[2];
	let rotation = playerInfo[3];
	
	let playerImage = self.physics.add.image(x, y, 'redCar').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
	playerImage.playerId = playerId;
	self.allPlayers.add(playerImage);
}
 
function update() {
	if (this.ship) {
		
		if (this.cursors.left.isDown) {
			//this.ship.setAngularVelocity(-150);
		} else if (this.cursors.right.isDown) {
			//this.ship.setAngularVelocity(150);
		} else {
			//this.ship.setAngularVelocity(0);
		}
  
		if (this.cursors.up.isDown) {
			//this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
		} else {
			//this.ship.setAcceleration(0);
		}
		
		if (this.cursors.space.isDown){
			this.socket.emit('space');
		}
  
		//this.physics.world.wrap(this.ship, 5);
		
		// emit player movement
		/*var x = this.ship.x;
		var y = this.ship.y;
		var r = this.ship.rotation;
		if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
		  this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
		}
		 
		// save old position data
		this.ship.oldPosition = {
		  x: this.ship.x,
		  y: this.ship.y,
		  rotation: this.ship.rotation
		};*/
	}
}
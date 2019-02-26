class User {
	constructor(io, dt){
		this.io = io;
		this.dt = dt;
	}
	
    log(){
		console.log("User: " + this + 
			" io: " + this.io + 
			"dt: " + this.dt
		);
	}
};

module.exports = User;
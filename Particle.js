class Particle{
	constructor(x, y) { //Defines a new particle and custom setter method for reachedTarget boolean
		this.pos = createVector(x, y); //Random starting location
		this.vel = createVector(0, 0); //Stores particle's velocity
		this.acc = createVector(0, 0); //Stores particle's acceleraiton

		this.mass = random(1, 5); //Gives each particle a random mass
		this.radius = 3 * sqrt(this.mass / PI); //Calculates radius so circle area is mass * a scale factor
		this.target = createVector(x, y); //The point the particle moves to

		this.maxSpeed = 200; //Limits the max speed of the particle
		this.minSpeed = 0; //Limits the minimum speed of the particle
		this.mouseRepelRad = 0; //Pixel radius to move away from mouse if within
		this.colour = color(188, 158, 193); //Sets a colour to fill the particle with

		this.reachedTarget = true; //Since initally at target
		//Defines a reached target property with custom setter, calls reachedTarget method if changed from false to true
		Object.defineProperty(this, 'reachedTarget', {
            get(){return this._reachedTarget;},
			set(newValue) {
				if (newValue && !this._reachedTarget) { //If new value is true and current value is false
                    this._reachedTarget = newValue; //Updates value, before function call
					this.TargetReached(); //Call target reached function
				}else {
                    this._reachedTarget = newValue; //Updates value
                }
			},
			configurable: true
		});
	}
	Update() { //Updates the particle's current state
		this.reachedTarget = this.ReachedTarget();
		this.SeekTarget(); //Moves towards target
		this.MoveFromMouse(); //Moves away from mouse
		this.acc.mult(0); //Resets acc to 0.

		return this.reachedTarget; //Returns if at target to Particle_System it belongs to
	}
	Show() { //Draws an ellipse to canvas at particle's pos
		push(); //Saves current drawing settings
		noStroke(); //No outline
		fill(this.colour); //Fill is set to particle's colour
		ellipse(this.pos.x, this.pos.y, this.radius, this.radius); //Draws an ellipse at particle's pos
		pop(); //Restores original drawing settings
	}
	SetTarget(x, y) { //Sets the particle's target to a location (x, y)
		this.target = createVector(x, y); //Allows target to be changed
	}
	AddForce(fx, fy) { //Appys a force of (fx, fy) N for 1 tick
		var force = createVector(fx, fy); //Creates a force vector
		this.acc.add(force.div(this.mass)); //Adds to acceleraiton, uses F=MA
		this.vel.add(this.acc).limit(this.maxSpeed); //Adds to velocity, under max speed
		this.pos.add(this.vel); //Updates position
	}
	ReachedTarget() { //Returns if particle is at target or not
		return (p5.Vector.sub(this.pos, this.target).mag() < 1) && (this.vel.mag() < 1);
	}
	TargetReached() { //Called when target is reached
        this.pos.set(this.target); //Sets pos to target to stop 'wobble'
        this.vel.mult(0); //Sets speed to zero to stop 'wobble' , wobble causes target reached to execute many times
	}
	SeekTarget() { //Moves particle towards target
		var desired = p5.Vector.sub(this.target, this.pos); //Vector representing path to target
		var speed = map(desired.mag(), 0, sqrt(sq(width) + sq(height)), this.minSpeed, this.maxSpeed); //Speed relative to how close target is
		desired.setMag(speed); //Vector to travel, mag based on dist left to go
		var nudgeForce = p5.Vector.sub(desired, this.vel); //A force to apply

		var noiseTheta = map(noise(speed), 0, 1, -1.5 * PI, 1.5 * PI); //Returns an angle from noise
		var noiseVector = p5.Vector.fromAngle(noiseTheta); //A vector based on noise propotional to speed
		noiseVector.setMag(sq(speed) / this.maxSpeed); //Sets 'bump' size
		nudgeForce.add(noiseVector); //Adds 'bump' to particle's path

		this.AddForce(nudgeForce.x, nudgeForce.y); //Applys the force
	}
	MoveFromMouse() { //Moves particle away from mouse
		var awayFromMouse = p5.Vector.sub(this.pos, createVector(mouseX, mouseY)); //Dist from mouse
		if (awayFromMouse.mag() < this.mouseRepelRad) { //If particle is within range of mouse
			var speed = map(awayFromMouse.mag(), 0, this.mouseRepelRad, this.maxSpeed, this.minSpeed); //Closer to mouse, quicker particle moves
			awayFromMouse.setMag(speed); //Sets mag based on dist to mouse
			var nudgeForce = p5.Vector.sub(awayFromMouse, this.vel); //A force to apply
			this.AddForce(nudgeForce.x, nudgeForce.y); //Applys the force
		}
	}
}

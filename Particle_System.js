class Particle_System {
	constructor(num) { //Defines a new particle system of inputted size and custom setter method for allReachedTarget boolean
		this.particles = []; //An array to store particle objects
        this._allReachedTarget = true; //Stores if all particles have reached their targets - Intially true as particles start at targets
		this.mergeRecursion = false;

		for (var i = 0; i < num; i++) { //Adds num particles to the particles array
			var startPos = p5.Vector.fromAngle(random(2*PI)).setMag(createVector(width/2, height/2).mag()); //A vector at a random angle, with mag half of diagonal
			startPos.add(width/2, height/2); //Trahnslate to centre of screen
			this.particles.push(new Particle(startPos.x, startPos.y)); //Add a new particle to the array
		}

		//Defines an all reached target property with custom setter, calls AllTargetReached method if changed from false to true
		Object.defineProperty(this, 'allReachedTarget', {
            get(){return this._allReachedTarget;},
			set(newValue) {
				if (newValue && !this._allReachedTarget) { //If new value is true and current value is false
                    this._allReachedTarget = newValue; //Updates value, before function call
					this.AllTargetReached(); //Calls AllTargetReached function
				}else {
                    this._allReachedTarget = newValue; //Updates value
                }
			},
			configurable: true
		});

	}
	Show() { //Draws all of the particles in
		for (var p in this.particles) {
			this.particles[p].Show(); //Draws an individual particle
		}
	}
	Update() { //Updates every particle
		var tempAllReachedTarget = true; //A temporary variable to store if all particles are in place.

		for (var p in this.particles) {
			var particleAtTarget = this.particles[p].Update(); //Updates an individual paricle, returns if particle is at target
			tempAllReachedTarget = tempAllReachedTarget && particleAtTarget; //If all are true, returns true otherwiswe returns false
		}
		this.allReachedTarget = tempAllReachedTarget; //Updates actual allReachedTarget variable
	}
	AllTargetReached(){ //Called when allReachedTarget variable changes from false to true
	}
    ChangeNumParticles(newSize){ //Determines if particles need to be added or removed, then calls merge or split method

		var currentSize = this.particles.length; //Stores the current size of the particles array
        if (newSize < currentSize) { //If too many particles
			var numToMerge = currentSize - newSize; //Number to merge is as required

			if (numToMerge > floor(currentSize/2)) { //Can't merge more than len/2 particles in one go
				numToMerge = floor(currentSize/2); //Sets current number of particles to merge to max amount
				this.mergeRecursion = true;
				//this.AllTargetReached = function(){this.ChangeNumParticles(newSize);} //Sets all target reached function to make a call back here, to merge more particles
			}else {
				this.mergeRecursion = false;
				//this.AllTargetReached = function(){} //Resets the function in case this is a 'recursive' call
			}

			var choices = Array.from(this.particles.keys()); //Creates an array [0, 1, 2, ..., this.particles.length -1]
			shuffle(choices, true); //Randomises the array

			for (var i = 0; i < numToMerge; i++) { //A merge removes one particle each time
				var p1 = this.particles[choices.shift()]; //Takes first element from choices array
				var p2 = this.particles[choices.shift()]; //Takes first element from choices array
				this.StartMerge(p1, p2); //Merges random particles, removes option from shuffled array
			}
        }else if (newSize > this.particles.length) { //If too few particles
			for (var i = currentSize; i < newSize; i++) {
				this.Split(random(this.particles)); //Splits a random element
			}
        }
    }
	StartMerge(p1, p2){ //Causes particles passed in to move to a common midpoint. Sets setter methods to call CompleteMerge() when both particles reach the midpoint
		p1.maxSpeed *= 1.5; //Increases speed of particle
		p2.maxSpeed *= 1.5; //Increases speed of particle

		var midpoint = p5.Vector.add(p1.pos, p2.pos).mult(0.5); //Finds the midpoint of the line from p1 to p2

		p1.SetTarget(midpoint.x, midpoint.y); //Causes p1 to move towards the midpoint
		p2.SetTarget(midpoint.x, midpoint.y); //Causes p2 to move towards the midpoint

		var p1Reached = false; //Stores if p1 is at the midpoint
		var p2Reached = false; //Stores if p2 is at the midpoint

		var self = this; //Stores a referance to this object

		p1.TargetReached = function(){ //Overrides the target reached function for p1, so that the CompleteMerge() method is called when both particles are at midpoint
			this.pos.set(this.target); //Sets pos to target to stop 'wobble'
			this.vel.mult(0); //Sets speed to zero to stop 'wobble' , wobble causes target reached to execute many times
			p1Reached = true; //Sets p1 reached to true, since it is at the midpoint
			if (p2Reached) {self.CompleteMerge(p1, p2, midpoint);} //Calls CompleteMerge() function if p2 is also at midpoint
		}

		p2.TargetReached = function(){
			this.pos.set(this.target); //Sets pos to target to stop 'wobble'
			this.vel.mult(0); //Sets speed to zero to stop 'wobble' , wobble causes target reached to execute many times
			p2Reached = true; //Sets p2 reached to true, since it is at the midpoint
			if (p1Reached) {self.CompleteMerge(p1, p2, midpoint);} //Calls CompleteMerge() function if p1 is also at midpoint
		}
	}
	CompleteMerge(p1, p2, midpoint){ //Called when both particles are at midpoint, completes the merging of two particles
		p1.maxSpeed /= 1.5; //Resets speed of particle

		p1.TargetReached = function(){ //Resets target reached function back to normal
			this.pos.set(this.target); //Sets pos to target to stop 'wobble'
			this.vel.mult(0); //Sets speed to zero to stop 'wobble' , wobble causes target reached to execute many times
		}

		p2.TargetReached = function(){ //Resets target reached function back to normal
			this.pos.set(this.target); //Sets pos to target to stop 'wobble'
			this.vel.mult(0); //Sets speed to zero to stop 'wobble' , wobble causes target reached to execute many times
		}

		push(); //Saves current drawing settings
        fill(255, 255, 255); //Fill colour is white
        noStroke(); //No outline
        ellipse(midpoint.x, midpoint.y, 10, 10); //Big circle at collision point
        pop(); //Restores original drawing settings

		var p2Index = this.particles.indexOf(p2); //Gets index of p2 in the particles array
        this.particles.splice(p2Index,1); //Removes p2 from the particle system
	}
	Split(baseP){ //Creates a new particle, so that it looks although baseP splits in two
		var newP = new Particle(baseP.pos.x, baseP.pos.y); //Creates a particle at the base's current position

		var theta = random(0, 2*PI); //Picks a random angle to move particles at
		var mag = random(15, 25); //Picks a random impluse magnitude to apply

		push(); //Saves current drawing settings
		fill(255, 255, 255); //Fill colour is white
		noStroke(); //No outline
		ellipse(baseP.pos.x, baseP.pos.y, 10, 10); //Big circle at split point
		pop(); //Restores original drawing settings

		var force = createVector(mag*cos(theta), mag*sin(theta)); //Calculates the impulse force
		var newTarget = p5.Vector.add(baseP.pos,force); //Calculates a position away from split point

		newP.AddForce(mag*cos(theta), mag*sin(theta)); //Applies a recoil force
		baseP.AddForce(-mag*cos(theta), -mag*sin(theta)); //Applies a force in other direction

		newP.SetTarget(newTarget.x, newTarget.y); //Sets the new particle target a little away from split point
		this.particles.push(newP); //Adds new particle to the particles array
	}
	RandomizeTargets(){ //Gives each particle a random target
		for (var p in this.particles) {
			this.particles[p].SetTarget(random(width), random(height)); //Sets the particle's target to a random point
		}
	}
	SetWord(str, fontSize){
		var points = GetPointsArray(str, fontSize);
		var c = points.length;
		frameRate(999); //Speeds up execution

		for (var p in this.particles) {
			this.particles[p].mouseRepelRad = 0; //Turns off mouse repel
		}
		this.RandomizeTargets(); //Disperses the particles

		var self = this; //Stores a referance to the particle system

		var stillMerging = function(){ //A callback function
			self.ChangeNumParticles(c); //Call the merge function recursivly
			if (self.mergeRecursion) { //If boolean is true, we are still merging
				self.AllTargetReached = stillMerging; //Call again next merge cycle
			}
			else {
				self.AllTargetReached = mapToWord //Sets targets to letter points
			}
		}

		this.AllTargetReached = stillMerging; //Starts the recursive function calling

		var mapToWord = function(){ //Makes the particles form a word
			for (var p in this.particles) {
				this.particles[p].SetTarget(points[p].x, points[p].y); //Sets targets
				this.particles[p].mouseRepelRad = 50; //Turns mouse repel back on
			}
			self.AllTargetReached = function(){}; //Clears callback function
			frameRate(27); //Resets frameRate
		}
	}
}

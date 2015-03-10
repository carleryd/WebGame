(function(window) {

	function Movement(bike) {

		var currentSpeed = 0;
		var currentForce;
		var left, up, right, down;
		var maxSpeed = 50;
    	var tiltStiffness = 3000000, tiltAngle = 0;
    	var driverArmLength = 80, driverThighLength = 70;

		// Setter methods for key presses
		this.setLeft = function(pressed) { left = pressed; }
		this.setUp = function(pressed) { up = pressed; }
		this.setRight = function(pressed) { right = pressed; }
		this.setDown = function(pressed) { down = pressed; }

		// Getter methods for key presses
		this.getLeft = function() { return left; }
		this.getUp = function() { return up; }
		this.getRight = function() { return right; }
		this.getDown = function() { return down; }

		// Getter functions
		this.getCurrentSpeed = function() 	{ return currentSpeed; }
		this.getCurrentForce = function() 	{ return currentForce; }

		this.getTiltAngle = function()		{ return tiltAngle;		}
		this.getTiltStiffness = function()	{ return tiltStiffness;	}
		this.getArmLength = function() 		{ return driverArmStrength; 	}
		this.getThighLength = function() 	{ return driverThighStrength;	}

		// Setter functions
		this.setCurrentSpeed = function(speed) 	{ currentSpeed = speed; }
		this.setForce = function(force) 		{ currentForce = force; }


		// Speed

		this.accelerate = function() {
			if(currentForce == 0)
				this.setForce(3 * Math.pow(10, 5));

			if(this.getCurrentSpeed() < maxSpeed) { // && bike.getLeftWheel().body.arbiterList != null) {
				this.setCurrentSpeed(this.getCurrentSpeed() + (maxSpeed - this.getCurrentSpeed()) / (maxSpeed / 1.1));
			}
		}

		this.decelerate = function() {
			if(this.setForce(3 * Math.pow(10, 5)))
				this.setForce(3 * Math.pow(10, 5));

			if(this.getCurrentSpeed() > -maxSpeed && this.getCurrentSpeed() > 1) {
				this.setCurrentSpeed(this.getCurrentSpeed() - (maxSpeed - this.getCurrentSpeed()) / (maxSpeed / 1.1));
			}
			else if(this.getCurrentSpeed() < 2)
				this.setCurrentSpeed(0);
		}

		this.stopMoving = function() {
			if(currentForce != 0)
				this.setForce(0);

			if(this.getCurrentSpeed() > 0) this.setCurrentSpeed(this.getCurrentSpeed() - 1.5);
			else if(this.getCurrentSpeed() < 0) this.setCurrentSpeed(this.getCurrentSpeed() + 1.5);
			
			if(this.getCurrentSpeed() < 0.3 && this.getCurrentSpeed() > -0.3) this.setCurrentSpeed(0);
		}

		// Tip: body angles are 0 at normal and goes to 6.30

		// Tilt functions - MOBILE

		this.loadedRotation = function(angle) {
			var coef = 0.10;

			if(angle > -70 && angle < 70) angle = angle * coef;
			else if(angle < -70) angle = -70  * coef;
			else angle = 70 * coef;
			angle = angle.toFixed(3);

			tiltAngle = bike.getChassis().body.a + angle * (Math.PI/180);
			tiltStiffness = 3000000;
		}


		// Tilt functions - DESKTOP

		this.tiltBackwards = function() {
			tiltAngle = bike.getChassis().body.a - 5 * (Math.PI/180);
			tiltStiffness = 3000000;

			if(bike.getArmLength() == 60)
				driverArmLength = 80;
		}

		this.tiltForwards = function() {
			tiltAngle = bike.getChassis().body.a + 5 * (Math.PI/180);
			tiltStiffness = 3000000;

			if(bike.getThighLength() == 50)
				driverThighLength = 70;
		}

		this.stopTilting = function() {
			tiltStiffness = 0;

			if(bike.getArmLength() == 80)
				driverArmLength = 60;
			if(bike.getThighLength() == 70)
				driverThighLength = 50;
		}
	}

	window.Movement = Movement;

})(window);
(function(window) {

	function Bike(space, floor, startPosX, startPosY) {
		var location = "javascripts/Motocross/Images/";

		// Getter methods
		this.getChassis = function() 					{ return chassis; 								}
		this.getLeftWheel = function() 					{ return leftWheel; 							}

		this.getDriver = function() 					{ return driver; 								}
		this.getLeftMotor = function() 					{ return leftWheelMotor; 						}
		this.getRightMotor = function() 				{ return rightWheelMotor; 						}
		this.getTiltSpring = function() 				{ return tiltDampedRotarySpring; 				}

		this.getMotorRate = function()					{ return leftWheelMotor.rate;					}

		this.getDisabledSteering = function()			{ return disabledSteering; 						}
		this.getSpinResistance = function() 			{ return spinResistance; 						}

		this.getArmLength = function() 					{ return driverArmStrength; 					}
		this.getThighLength = function() 				{ return driverThighStrength; 					}


		// Setter methods
		this.setMotorRate = function(speed) 			{ leftWheelMotor.rate = speed; 					}
		this.setMotorForce = function(motor, force) 	{ motor.maxForce = force; 						}

		this.setDisabledSteering = function(steering) 	{ disabledSteering = steering; 					}

    	this.setTiltAngle = function(angle) 			{ tiltDampedRotarySpring.restAngle = angle; 	}
    	this.setTiltStiffness = function(stiffness) 	{ tiltDampedRotarySpring.stiffness = stiffness; }

		this.setArmLength = function(length) 			{ driverArmStrength.restLength = length; 		}
		this.setThighLength = function(length) 			{ driverThighStrength.restLength = length; 		}


		// Track previous bike position, used for checking if passed goal
		this.trackPrevPos = function() {
			driver.helmet.prevPos = misc.clone(driver.helmet.body.getPos());
		}


		// Complex variables
		var leftWheel = function() 		{ body; 		shape; 		startPos;	}
		var rightWheel = function() 	{ body;			shape; 		startPos;	}
		var chassis = function() 		{ body; 		shape; 		startPos;		width;		height; }
		var engine = function()			{ body;			startPos;	}
		var connection = function() 	{ body; 		shape;					}
		var driver = function()			{ helmet;		chest;		thigh;		calf;		startPos;	}
		
		driver.helmet = function()		{ body;			shape;		prevPos;	}
		driver.chest = function()		{ body;			shape;		width;		height; }
		driver.thigh = function()		{ body;			shape;		width;		height; }
		driver.calf = function()		{ body;			shape;		width;		height; }
		driver.upperArm = function()	{ body;			shape;		width;		height; }
		driver.lowerArm = function()	{ body;			shape;		width;		height; }

		var weightAmp = function()		{ bike;			driver;	}

		var images = function()			{ chassis;	wheel;	driver;	}
		images.chassis = function()		{ width;	height;	}
		images.driver = function()		{ helmet;	chest;	thigh;	calf;	upperArm;	lowerArm; }

		// Init draw stuff
		images.chassis = new Image();
		images.wheel = new Image();
		images.driver.helmet = new Image();
		images.driver.chest = new Image();
		images.driver.thigh = new Image();
		images.driver.calf = new Image();
		images.driver.upperArm = new Image();
		images.driver.lowerArm = new Image();

		images.chassis.src = location + "chassis.png";
		images.wheel.src = location + "wheel_49x49.png";
		images.driver.helmet.src = location + "placeholder_helmet.png";
		images.driver.chest.src = location + "placeholder_chest.png";
		images.driver.thigh.src = location + "placeholder_thigh.png";
		images.driver.calf.src = location + "placeholder_calf.png";
		images.driver.upperArm.src = location + "placeholder_upperArm.png";
		images.driver.lowerArm.src = location + "placeholder_lowerArm.png";


		images.chassis.onload = function() {
  			images.chassis.width = this.width;
  			images.chassis.height = this.height;
		}

		images.wheel.onload = function() {
  			images.wheel.width = this.width;
  			images.wheel.height = this.height;
		}

		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");
		var canTop = 0.00; // 0.40


		var body, shape;
		var radius, width, height, mass;
		var disabledSteering = false;
		
		weightAmp.driver = 0.4;
		weightAmp.bike = 0.7;

		var spinResistance = 5000;
    	var driverStiffness = 100, driverDamping = 10;
    	var wheelDamping = 15;
    	var wheelStiffness = 150; // 100
    	var wheelFriction = 1.5;
    	var tiltStiffness = 300000;

		// Starting positions
		leftWheel.startPos = cp.v(startPosX - 67.5, startPosY);
		rightWheel.startPos = cp.v(startPosX + 67.5, startPosY);
		chassis.startPos = cp.v(startPosX, startPosY);
		engine.startPos = cp.v(startPosX, startPosY + 20);
		driver.startPos = cp.v(startPosX + 10, startPosY - 30);
		driver.helmet.prevPos = misc.clone(driver.startPos);

		// Left Wheel
		radius = 24.5;
		mass = weightAmp.bike * radius * radius * (1/1000);

		leftWheel.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0.0, radius, cp.v(0.0, 0.0))));
		leftWheel.body.setPos(misc.clone(leftWheel.startPos));

		leftWheel.shape = space.addShape(new cp.CircleShape(leftWheel.body, radius, cp.v(0.0, 0.0)));
		leftWheel.shape.setFriction(wheelFriction);
		leftWheel.shape.group = 1;

		// Right Wheel
		rightWheel.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0.0, radius, cp.v(0.0, 0.0))));
		rightWheel.body.setPos(misc.clone(rightWheel.startPos));

		rightWheel.shape = space.addShape(new cp.CircleShape(rightWheel.body, radius, cp.v(0.0, 0.0)));
		rightWheel.shape.setFriction(wheelFriction);
		rightWheel.shape.group = 1;

		// Chassis
		chassis.width = 80; // 80
		chassis.height = 30; // 20
		mass = weightAmp.bike * chassis.width * chassis.height * (1/1000);
		chassis.body = space.addBody(new cp.Body(mass, cp.momentForBox(mass, chassis.width, chassis.height)));
		chassis.body.setPos(misc.clone(chassis.startPos));

		chassis.shape = space.addShape(new cp.BoxShape(chassis.body, chassis.width, chassis.height));
		chassis.shape.layers = 2;
		chassis.shape.group = 1;

		// Engine - Only used to balance bike weight
		radius = 30;
		mass = weightAmp.bike * radius * radius * (1/1000);
		engine.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0.0, radius, cp.v(0.0, 0.0))));
		engine.body.setPos(misc.clone(engine.startPos));

		// engine.shape = space.addShape(new cp.BoxShape(engine.body, engine.width, engine.height));
		// engine.shape.layers = 2;
		// engine.shape.group = 1;

		// Driver
		// Helmet
		radius = 12;
		mass = weightAmp.driver * radius * radius * (1/1000);
		driver.helmet.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0.0, radius, cp.v(0.0, 0.0))));
		driver.helmet.body.setPos(misc.clone(driver.startPos));

		driver.helmet.shape = space.addShape(new cp.CircleShape(driver.helmet.body, radius, cp.v(0.0, 0.0)));
		driver.helmet.shape.group = 1;

		// Chest
		driver.chest.width = 40;
		driver.chest.height = 15;
		mass = weightAmp.driver * driver.chest.width * driver.chest.height * (1/1000);
		driver.chest.body = space.addBody(new cp.Body(
			mass, cp.momentForBox(mass, driver.chest.width, driver.chest.height)));
		driver.chest.body.setPos(misc.clone(cp.v(driver.startPos.x, driver.startPos.y + 20)));
		driver.chest.body.a = 110 * (Math.PI/180);

		driver.chest.shape = space.addShape(new cp.BoxShape(
			driver.chest.body, driver.chest.width, driver.chest.height));
		driver.chest.shape.layers = 2;
		driver.chest.shape.group = 1;

		// Thigh
		driver.thigh.width = 35;
		driver.thigh.height = 10;
		mass = weightAmp.driver * driver.thigh.width * driver.thigh.height * (1/1000);
		driver.thigh.body = space.addBody(new cp.Body(
			mass, cp.momentForBox(mass, driver.thigh.width, driver.thigh.height)));
		driver.thigh.body.setPos(misc.clone(cp.v(driver.startPos.x, driver.startPos.y + 30)));

		driver.thigh.shape = space.addShape(new cp.BoxShape(
			driver.thigh.body, driver.thigh.width, driver.thigh.height));
		driver.thigh.shape.layers = 2;
		driver.thigh.shape.group = 1;

		// Calf
		driver.calf.width = 25;
		driver.calf.height = 7.5;
		mass = weightAmp.driver * driver.calf.width * driver.calf.height * (1/1000);
		driver.calf.body = space.addBody(new cp.Body(
			mass, cp.momentForBox(mass, driver.calf.width, driver.calf.height)));
		driver.calf.body.setPos(misc.clone(cp.v(driver.startPos.x, driver.startPos.y + 40)));
		driver.calf.body.a = 180 * (Math.PI/180);

		driver.calf.shape = space.addShape(new cp.BoxShape(
			driver.thigh.body, driver.thigh.width, driver.thigh.height));
		driver.calf.shape.layers = 2;
		driver.calf.shape.group = 1;

		// Upper arm
		driver.upperArm.width = 13;
		driver.upperArm.height = 5;
		mass = weightAmp.driver * driver.upperArm.width * driver.upperArm.height * (1/1000);
		driver.upperArm.body = space.addBody(new cp.Body(
			mass, cp.momentForBox(mass, driver.upperArm.width, driver.upperArm.height)));
		driver.upperArm.body.setPos(misc.clone(cp.v(driver.startPos.x, driver.startPos.y + 40)));

		driver.upperArm.shape = space.addShape(new cp.BoxShape(
			driver.thigh.body, driver.thigh.width, driver.thigh.height));
		driver.upperArm.shape.layers = 2;
		driver.upperArm.shape.group = 1;

		// Lower arm
		driver.lowerArm.width = 13;
		driver.lowerArm.height = 5;
		mass = weightAmp.driver * driver.lowerArm.width * driver.lowerArm.height * (1/1000);
		driver.lowerArm.body = space.addBody(new cp.Body(
			mass, cp.momentForBox(mass, driver.lowerArm.width, driver.lowerArm.height)));
		driver.lowerArm.body.setPos(misc.clone(cp.v(driver.startPos.x, driver.startPos.y + 40)));

		driver.lowerArm.shape = space.addShape(new cp.BoxShape(
			driver.thigh.body, driver.thigh.width, driver.thigh.height));
		driver.lowerArm.shape.layers = 2;
		driver.lowerArm.shape.group = 1;	

		// Description:
		// cp.DampedSpring = function(a, b, anchr1, anchr2, restLength, stiffness, damping)
		// Engine - PivotJoint
		var enginePivot = space.addConstraint(new cp.PivotJoint(engine.body, chassis.body, cp.v(0, 0), cp.v(0, 40)));

		// Left Wheel - Simple Motor
		var leftWheelMotor = space.addConstraint(new cp.SimpleMotor(leftWheel.body, chassis.body, 0));
    	leftWheelMotor.maxForce = spinResistance;

		// Left Wheel - Damping
		var leftWheelDampedSpring = space.addConstraint(new cp.DampedSpring(
			chassis.body, leftWheel.body, cp.v(-80.0, -10.0), cp.v(0.0, 0.0), 55.0, wheelStiffness, wheelDamping));
		var leftWheelGrooveJoint = space.addConstraint(new cp.GrooveJoint(
			chassis.body, leftWheel.body, cp.v(-80.0, 0.0), cp.v(-80.0, 60.0), cp.v(0.0, 0.0)));

		// Right Wheel - Damping
		var rightWheelDampedSpring = space.addConstraint(new cp.DampedSpring(
			chassis.body, rightWheel.body, cp.v(40.0, -10.0), cp.v(0.0, 0.0), 54.0, wheelStiffness, wheelDamping));
		var rightWheelGrooveJoint = space.addConstraint(new cp.GrooveJoint(
			chassis.body, rightWheel.body, cp.v(40.0, 0.0), cp.v(60.0, 60.0), cp.v(0.0, 0.0)));
    	// Right Wheel - needed for breaks on both back and fron wheel
    	var rightWheelMotor = space.addConstraint(new cp.SimpleMotor(rightWheel.body, chassis.body, 0));
    	rightWheelMotor.maxForce = spinResistance;

    	// Driver - Needs to smootly follow the bikes movement using damped springs

    	var driverArmStrength = space.addConstraint(new cp.DampedSpring(
    		chassis.body, driver.helmet.body, cp.v(50, 0.0), cp.v(0.0, 0.0), 60, driverStiffness, driverDamping));
    	var driverThighStrength = space.addConstraint(new cp.DampedSpring(
    		chassis.body, driver.helmet.body, cp.v(-20, -10.0), cp.v(0.0, 0.0), 70, driverStiffness, driverDamping));

    	var driverNeck = space.addConstraint(new cp.PivotJoint(
    		driver.chest.body, driver.helmet.body, cp.v(-30, 0), cp.v(0, 0)));
    	var driverHip = space.addConstraint(new cp.PivotJoint(
    		driver.thigh.body, driver.chest.body, cp.v(-17.5, 0), cp.v(20, 0)));
    	var driverKnee = space.addConstraint(new cp.PivotJoint(
    		driver.calf.body, driver.thigh.body, cp.v(-12.5, 0), cp.v(17.5, 0)));
    	var driverFootSupport = space.addConstraint(new cp.PivotJoint(
    		driver.calf.body, chassis.body, cp.v(12.5, 0), cp.v(-5, 25)));
    	var driverShoulder = space.addConstraint(new cp.PivotJoint(
    		driver.chest.body, driver.upperArm.body, cp.v(-8, -5), cp.v(-6, 0)));
    	var driverElbow = space.addConstraint(new cp.PivotJoint(
    		driver.upperArm.body, driver.lowerArm.body, cp.v(6, 0), cp.v(-6, 0)));
    	var driverHands1 = space.addConstraint(new cp.PivotJoint(
    		driver.lowerArm.body, chassis.body, cp.v(6, 0), cp.v(20, -20)));

    	var driverSeat = space.addConstraint(new cp.DampedSpring(
    		driver.chest.body, chassis.body, cp.v(20, -10), cp.v(-35, 10), 10, driverStiffness, driverDamping));
    	var driverKneeStrength = space.addConstraint(new cp.DampedSpring(
    		driver.thigh.body, chassis.body, cp.v(17.5, 0), cp.v(30, 0), 10, driverStiffness, driverDamping));

    	// var driverNeckStrength = space.addConstraint(new cp.DampedRotarySpring(
    	// 	driver.helmet.body, driver.chest.body, 0, driverStiffness, driverDamping));
    	// var driverHipStrength = space.addConstraint(new cp.DampedRotarySpring(
    	// 	driver.chest.body, driver.thigh.body, 90 * (Math.PI/180), driverStiffness, driverDamping));
    	// var driverKneeStrength = space.addConstraint(new cp.DampedRotarySpring(
    	// 	driver.thigh.body, driver.calf.body, 90 * (Math.PI/180), driverStiffness, driverDamping));



		// Tilt mechanic - bodyA, bodyB, angle, stiffness, damping
    	var tiltDampedRotarySpring = space.addConstraint(new cp.DampedRotarySpring(
    		chassis.body, floor.body, 0, tiltStiffness, 0.0));


		this.printText = function(context, text, color, font, mulX, diffX, mulY, diffY) {
			context.fillStyle = color;
  			context.font = font;
  			context.fillText(text, mulX * (context.canvas.width + diffX), mulY * (context.canvas.height + diffY));
		}

		var newBikePos = 0, oldBikePos = 0;
		this.drawBike = function() {
			// Chassis
			context.save();

			context.translate(canvas.width/2, canvas.height/2);
			context.rotate(chassis.body.a);
			context.drawImage(images.chassis, -images.chassis.width/2, -images.chassis.height/2);

			context.restore();

			// Left Wheel
			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - leftWheel.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - leftWheel.body.getPos().y));
			context.rotate(leftWheel.body.a);
			context.drawImage(images.wheel, -images.wheel.width/2, -images.wheel.height/2);

			context.restore();

			// Right Wheel
			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - rightWheel.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - rightWheel.body.getPos().y));// - 768 * canTop);
			context.rotate(rightWheel.body.a);
			context.drawImage(images.wheel, -images.wheel.width/2, -images.wheel.height/2);

			context.restore();

			// Driver
			// Helmet
			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - driver.helmet.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - driver.helmet.body.getPos().y));
			context.rotate(driver.chest.body.a - 2);
			context.drawImage(images.driver.helmet, -images.driver.helmet.width/2, -images.driver.helmet.height/2);
			// Chest
			context.restore();

			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - driver.chest.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - driver.chest.body.getPos().y));
			context.rotate(driver.chest.body.a);
			context.drawImage(images.driver.chest, -images.driver.chest.width/2, -images.driver.chest.height/2);
			// Thigh
			context.restore();

			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - driver.thigh.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - driver.thigh.body.getPos().y));
			context.rotate(driver.thigh.body.a);
			context.drawImage(images.driver.thigh, -images.driver.thigh.width/2, -images.driver.thigh.height/2);

			context.restore();
			// Calf
			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - driver.calf.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - driver.calf.body.getPos().y));
			context.rotate(driver.calf.body.a);
			context.drawImage(images.driver.calf, -images.driver.calf.width/2, -images.driver.calf.height/2);

			context.restore();

			// Upper arm
			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - driver.upperArm.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - driver.upperArm.body.getPos().y));
			context.rotate(driver.upperArm.body.a);
			context.drawImage(images.driver.upperArm,
				-images.driver.upperArm.width/2, -images.driver.upperArm.height/2);

			context.restore();

			// Lower arm
			context.save();

			context.translate(canvas.width/2 - (chassis.body.getPos().x - driver.lowerArm.body.getPos().x),
							canvas.height/2 - (chassis.body.getPos().y - driver.lowerArm.body.getPos().y));
			context.rotate(driver.lowerArm.body.a);
			context.drawImage(images.driver.lowerArm,
				-images.driver.lowerArm.width/2, -images.driver.lowerArm.height/2);

			context.restore();

			// Not sure why...
			oldBikePos = ((chassis.body.getPos().y + leftWheel.body.getPos().y + rightWheel.body.getPos().y)/3 - 150);
		}
	}
	window.Bike = Bike;

})(window);
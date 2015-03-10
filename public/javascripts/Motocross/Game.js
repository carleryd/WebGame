// Dirt bike game running in html5 canvas using Chipmunk.js physics by Christofer Ärleryd

var space;
var bike;
var movement;
var levelSelector;
var startTime;
var pause;
var context, canvas;

var currentLevel = 1;
var finishTime = 999 * 1000;
// Timer variables
var currentTime, previousTime, performLoad = 3000, slowCount = 0, maxSlow = 10;
var finished = false;

var requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;

var app = angular.module('app');

app.factory("GameService", function() {
	return {
		getFinishTime: function() {
			return finishTime / 1000;
		},
		getCurrentLevel: function() {
			return currentLevel;
		},
		restartLevel: function() {
			restart(false, false, true);
		},
		nextLevel: function() {
			restart(true, false, true);
		},
		previousLevel: function() {
			restart(false, true, true);
		},
		restartLevel: function() {
			restart(false, false, true);
		}
	};
});

var mac;
function keyDownListener(e) {
	var keyPress = e.keyCode;
    switch(keyPress) {
    	case 37: // left
    		movement.setLeft(true);
       		return false;
       	case 38: // up
       		movement.setUp(true);
      		return false;
       	case 39: // right
       		movement.setRight(true);
       		return false;
       	case 40: // down
       		movement.setDown(true);
       		return false;
       	// case 80: // p - pause
       	// 	if(!pause) pause = true;
       	// 	else pause = false;
       	// 	return false;
   	}
};

function keyUpListener(e) {
	var keyPress = e.keyCode;
    switch(keyPress) {
    	case 37: //left
    		movement.setLeft(false);
       		return false;
       	case 38: //up
       		movement.setUp(false);
      		return false;
       	case 39: //right
       		movement.setRight(false);
       		return false;
       	case 40: //down
       		movement.setDown(false);
       		return false;
  	}
};

/*function mouseDownListener(e) {
	bike = new Bike(space, levelSelector.getFloor(), bike.getChassis().body.getPos().x + e.clientX - canvas.width/2,
													 bike.getChassis().body.getPos().y + e.clientY - canvas.height/2);
};*/

function init() {
	mac = navigator.appVersion.indexOf("Mac");

	// Performance test
	previousTime = new Date();
	
	// Start timer
	startTime = new Date();

	// Create canvases
	// canvas = document.createElement("canvas");
	canvas = document.getElementById("canvas");
	// canvas.id = "canvas";
	// canvas.style.width  = window.innerWidth/2;
	// canvas.style.height = window.innerHeight/2;
	// canvas.style.zIndex   = 1;
	// canvas.style.position = "absolute";
	// canvas.style.border   = "0px";
	// document.body.appendChild(canvas);

	context = canvas.getContext("2d");


	setupPhysics(currentLevel);


	if(mac == 5) {
   		document.onkeydown = keyDownListener;
   		document.onkeyup = keyUpListener;
   	}
   	document.ontouchstart = touchStartListener;
   	document.ontouchend = touchEndListener;
   	document.ontouchmove = touchMoveListener;
   	document.ontouchcancel = touchCancelListener;

   	// document.onmousedown = mouseDownListener;

	window.addEventListener("deviceorientation", handleOrientation, true); // "devicemotion"

	window.setInterval(tick, (1000 / 60)); //runs a function tick()
}

function setupPhysics(level) {
	space = new cp.Space();
	space.enableContactGraph = true;
	space.gravity = cp.v(0, 700);

	// Level setup
	levelSelector = new Level(space, bike);
	levelSelector.create(level);

	// Bike setup
	bike = new Bike(space, levelSelector.getFloor(), levelSelector.getStartPos().x, levelSelector.getStartPos().y);

	// Movement
	movement = new Movement(bike);
}

function handleOrientation(event) { 
	movement.loadedRotation(event.beta);
}

function preventBehavior(e) {
    e.preventDefault();
};

function touchStartListener(e) {
	e.preventDefault();
	if(e.targetTouches[0].pageX > 300) movement.setUp(true);
	if(e.targetTouches[0].pageX < 300) movement.setDown(true);
};

function touchEndListener(e) {
    e.preventDefault();
	movement.setUp(false);
	movement.setDown(false);
}

function touchMoveListener(e) {
    e.preventDefault();
	console.log("touchMoveListener")
}

function touchCancelListener(e) {
    e.preventDefault();
	console.log("touchCancelListener");
}



var count = 0, start = 0;
function update() {
	// Has the bike crashed?
	if(bike.getDisabledSteering()) {
		var current = new Date();

		if(current - startTime > 500) { waitForKey(); }
		movement.stopMoving();
		movement.stopTilting();
		return;
	}


	currentTime = new Date() - startTime;
	if(!pause) {
		bike.printText(context, /*bike.getMotorRate()*/currentTime/1000, "white", "bold 40px Arial", 1/50, 0, 1/10, 0); 
	}

	// Has the bike reached the goal?
	if(bike.getChassis().body.p.x > levelSelector.getGoalX()) {
	}

	// Key presses
	if(movement.getUp() && !movement.getDown())	{
		movement.accelerate();
		bike.setMotorForce(bike.getLeftMotor(), movement.getCurrentForce());
	}
	else if(movement.getDown() && !movement.getUp()) {
		movement.decelerate();
		bike.setMotorForce(bike.getLeftMotor(), movement.getCurrentForce());
		bike.setMotorForce(bike.getRightMotor(), movement.getCurrentForce());
	}
	else {
		movement.stopMoving();
		bike.setMotorForce(bike.getLeftMotor(), bike.getSpinResistance());
		bike.setMotorForce(bike.getRightMotor(), bike.getSpinResistance());
	}
		
	if(mac == 5) {
		if(movement.getLeft() && !movement.getRight()) 			movement.tiltBackwards();
		else if(movement.getRight() && !movement.getLeft())		movement.tiltForwards();
		else													movement.stopTilting();
	}
	
	bike.setMotorRate(movement.getCurrentSpeed());
	bike.setTiltAngle(movement.getTiltAngle());
	bike.setTiltStiffness(movement.getTiltStiffness());

	// Has the bike reached the goal?
	// If previous position on one side of the finish.pole &&
	// If new position on the other side of the finish.pole
	var curr = cp.v(bike.getDriver().helmet.body.getPos().x, bike.getDriver().helmet.body.getPos().y);
	var prev = cp.v(bike.getDriver().helmet.prevPos.x, bike.getDriver().helmet.prevPos.y);
	var finish = levelSelector.getFinishLine();
	// I want the player to reach the goal even though the helmet is somewhat above the finish flag
	var yAdj = 300;

	if(((prev.x < finish.x.x && finish.x.x < curr.x) || (curr.x < finish.x.x && finish.x.x < prev.x)) &&
		(curr.y > finish.x.y - yAdj && prev.y > finish.x.y - yAdj) && (curr.y < finish.y.y && prev.y < finish.y.y)) {

		if(!finished) {
			finished = true;
			finishTime = currentTime;
			console.log("Game: " + currentTime);
			angular.element(document.querySelector('#home-div')).scope()
				.updateFinishTime();
		}
	}
	if(finished) reachedGoal();

	// Restart when driver hits his head
	if(bike.getDriver().helmet.body.arbiterList != null) crashBike();
	if(bike.getDriver().helmet.body.getPos().y > levelSelector.getEndY()) crashBike();

	// Update varius bike variables such as helmets previous position
	bike.trackPrevPos();
}

function reachedGoal() {
	bike.printText(context, "Time: " + finishTime/1000, "black", "bold 30px Arial",
		0.50, -150, 0.20, 0);

	pause = true;
	if((new Date() - startTime - finishTime) > 1000) {
		bike.printText(context, "Press up to continue", "black", "bold 30px Arial",
			0.50, -285, 0.25, 0);

		if(movement.getUp()) {
			restart(true, false, false);
			pause = false;
			finished = false;
		}
	}
}

function crashBike() { bike.setDisabledSteering(true); }
function waitForKey() { 
	bike.printText(context, "You have died, press gas button to continue", "black", "bold 20px Arial",
		0.50, -420, 0.20, 0);

	pause = true;
	if((new Date() - startTime - currentTime) > 500) {
		bike.printText(context, "Press up to restart", "black", "bold 20px Arial",
		0.50, -150, 0.25, 0);
		if(movement.getUp()) {
			restart(false, false, false);
			pause = false;
		}
	}

}

// knownChange tells the function whether this was a known action from web
// or just seperately executed by the game(Angular needs to know about changes)
function restart(moveToNext, moveToPrevious, knownChange) {
	if(moveToNext && moveToPrevious) {
		alert("Error restart(...)");
		return;
	}
	if(moveToNext)
		currentLevel++;
	else if(moveToPrevious)
		currentLevel--;
	
	if(currentLevel > levelSelector.getLevelAmount())
		currentLevel = 1;
	else if(currentLevel < 1)
		currentLevel = levelSelector.getLevelAmount();

	// Notify angular of change in currentLevel
	if(angular.element(document.querySelector('#home-div')).scope() != null
		&& !knownChange) {
		angular.element(document.querySelector('#home-div')).scope()
			.updateCurrentLevel();
	}

	setupPhysics(currentLevel);
	startTime = new Date();
}

var fpsCount = 0, last = 0, loopCount = 0;

function fps() {
	fpsCount += (new Date() - last); // now we get the time since last tick

	if(fpsCount > 1000) { // 1 second in milliseconds
		console.log(fpsCount);
		fpsCount = 0; loopCount = 0;
	}

	last = new Date();
	loopCount++;
}

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	levelSelector.draw(bike.getChassis().body.getPos());
	bike.drawBike();
}
var counter1 = 0;
function tick() {
	if(!pause) {
		space.step(1/60);	
	}
	draw();
	update();

	counter1++;
	if(counter1 > 10) {
		counter1 = 0;
		// log here
		// console.log(movement.getCurrentSpeed());
	}
}
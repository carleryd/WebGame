(function(window) {
	
	function Level(space, bike) {
		this.space = space;
		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");
		var location = "javascripts/Motocross/Images/";

		// Circle variables
		var x, y;
		var xNext, yNext;

		// Bike starting position
		var startPos;

		// Deprecated
		var endY, goalX = 1000;

		// Background
		var backgroundImage = new Image();

		// Needed for Bike tilting technique, used in all levels
		var floor;

		// Finish - goal is to collide with finish.pole with bike.helmet
		var finish = function() 	{ pole;	flag; 	pos;	}
		finish.pole = function() 	{ body;	shape;	image;	width;	height; }
		finish.flag = function() 	{ body;	shape;	image;	width;	height; }

		finish.pole.width = 10;
		finish.pole.height = 200;
		finish.pos = cp.v(0, 0);

		finish.pole.image = new Image();
		finish.flag.image = new Image();
		finish.pole.image.src = location + "finish_pole.png";
		// finish.flag.image.src = "Images/finishFlag_ph.png";

		// Temporary before menu UI implemented
		levelAmount = 7;

		// Getter functions
		this.getBackgroundImage = function() { return background; }
		this.getFloor = function() { return floor; }
		this.getStartPos = function() { return startPos; }
		this.getEndY = function() { return endY; }
		this.getGoalX = function() { return goalX; }
		this.getLevelAmount = function() { return levelAmount; }
		this.getFinishLine = function() { return cp.v(cp.v(finish.pos.x + finish.pole.width/2, finish.pos.y - finish.pole.height), cp.v(finish.pos.x + finish.pole.width/2, finish.pos.y)); }


		var line = function(posX, posY, lengthX, lengthY) {
			shape = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(posX, posY), cp.v(posX + lengthX, posY + lengthY), 5));
				shape.setFriction(1.0); shape.group = 2; shape.layers = 1;
		}

		var circle = function(posX, posY, radius, startRad, endRad) {
			var angle = 0;
			var shape;
			var vertices = new Array();
			for(var i = startRad; i < endRad; i += Math.PI/20) {
				x = radius * Math.cos(i);
				y = radius * Math.sin(i);
				xNext = radius * Math.cos(i + Math.PI/20);
				yNext = radius * Math.sin(i + Math.PI/20);
				
				// NÄR 0 TILL 1 PI blir det fel
				if(i < Math.PI && i >= 0) { angle -= Math.PI; }

				shape = this.space.addShape(new cp.SegmentShape(
					this.space.staticBody, cp.v(posX+x, posY+y), cp.v(posX+xNext, posY+yNext), 5));

				shape.setFriction(1.0);
				shape.group = 2;
				shape.layers = 1;
			}
		}

		this.create = function(level) {
			if(level == 1) {
				startPos = cp.v(100, -100);
				finish.pos = cp.v(2200, -500);
				endY = 400;

				backgroundImage.src = location + "are_toppstuga.jpg";
				floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(0, 0), cp.v(600, 0), 5));
				floor.setFriction(1.0); floor.group = 2; floor.layers = 1;

				circle(600, -400, 400, 4/20 * Math.PI, 10/20 * Math.PI);
				line(1500, -500, 800, 0);
			}
			else if(level == 2) {
				startPos = cp.v(200, 550);
				finish.pos = cp.v(1800, 650);
				endY = 1150;

				backgroundImage.src = location + "cervinia.png";
				floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(0, 650), cp.v(900, 650), 5));
				floor.setFriction(1.0); floor.group = 2; floor.layers = 1;

				line(1050, 300, 0, 200);
				circle(900, 500, 150, 0/20 * Math.PI, 10/20 * Math.PI);
				circle(800, 200, 100, -20/20 * Math.PI, 20/20 * Math.PI);
				circle(1150, 300, 100, -20/20 * Math.PI, 20/20 * Math.PI);
				circle(1200, 500, 150, 10/20 * Math.PI, 20/20 * Math.PI);
				line(1200, 650, 700, 0);
			}
			else if(level == 3) {
				startPos = cp.v(100, -150);
				finish.pos = cp.v(2900, 0);
				endY = 500;

				backgroundImage.src = location + "chichen_itza.jpg";
				floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(0, 0), cp.v(1000, 0), 5));
				floor.setFriction(1.0); floor.group = 2; floor.layers = 1;

				line(1000, -120, 1000, 0);
				line(2000, 0, 1000, 0);
			}
			else if(level == 4) {
				startPos = cp.v(100, -150);
				finish.pos = cp.v(3300, 0);
				endY = 500;

				backgroundImage.src = location + "Skyclouds_1440x900.jpeg";
				floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(0, 0), cp.v(1000, 0), 5));
				floor.setFriction(1.0); floor.group = 2; floor.layers = 1;

				circle(1000, -400, 400, 0/20 * Math.PI, 10/20 * Math.PI);
				line(1400, -600, 0, 200);

				circle(1000, -1000, 400, -10/20 * Math.PI, 0/20 * Math.PI);
				line(800, -1400, 200, 0);
				circle(800, -1000, 400, -20/20 * Math.PI, -10/20 * Math.PI);
				line(400, -1000, 0, 300);
				circle(800, -700, 400, 10/20 * Math.PI, 20/20 * Math.PI);
				line(800, -300, 100, 0);

				circle(900, -600, 300, -1/20 * Math.PI, 10/20 * Math.PI);
				circle(900, -815, 300, -10/20 * Math.PI, 0/20 * Math.PI);
				circle(900, -815, 300, -20/20 * Math.PI, -10/20 * Math.PI);
				circle(800, -815, 200, 10/20 * Math.PI, 20/20 * Math.PI);

				line(800, -615, 200, -20);

				line(3100, 0, 300, 0);
			}
			else if(level == 5) {
				startPos = cp.v(-1900, -500);
				finish.pos = cp.v(4300, 3400);
				endY = 3900;

				backgroundImage.src = location + "india.jpg";
				floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(-2000, -400), cp.v(-1500, -400), 5));
				floor.setFriction(1.0); floor.group = 2; floor.layers = 1;

				// Partly
				circle(-1500, -200, 200, -10/20 * Math.PI, -1/20 * Math.PI); line(700, 400, 0, 100);
				line(-1302, -231, 211, 793);
				circle(-900, 500, 200, 10/20 * Math.PI, 18/20 * Math.PI); line(700, 400, 0, 100);
				line(-900, 700, 1400, 0);
				line(700, 400, 0, 100);
				circle(500, 500, 200, 0/20 * Math.PI, 10/20 * Math.PI);
				circle(400, 0, 300, -30/20 * Math.PI, 0/20 * Math.PI);

				// Whole
				circle(1500, -100, 300, -20/20 * Math.PI, 20/20 * Math.PI);
				circle(1500, 600, 300, -20/20 * Math.PI, 20/20 * Math.PI);
				circle(900, 1200, 300, -20/20 * Math.PI, 20/20 * Math.PI);
				circle(1500, 1800, 300, -20/20 * Math.PI, 20/20 * Math.PI);
				circle(2400, 2400, 300, -20/20 * Math.PI, 20/20 * Math.PI);

				line(2000, 3400, 3000, 0);
			}
			else if(level == 6) {
				startPos = cp.v(300, 650);
				finish.pos = cp.v(2910, 550);
				endY = 1150;

				backgroundImage.src = location + "machu_picchu.jpg";
				floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(200, 700), cp.v(900, 700), 5));
				floor.setFriction(1.0); floor.group = 2; floor.layers = 1;

				line(-500, 500, 850, 0);
				line(1500, 150, 750, 0);
				line(1550, 550, 350, 0);
				line(2100, 550, 900, 0);

				circle(900, 500, 200, -8/20 * Math.PI, Math.PI/2);
				circle(350, 300, 200, 5/20 * Math.PI, Math.PI/2);
				circle(1600, -150, 200, -Math.PI, Math.PI);
				circle(2000, 555, 100, -Math.PI, 0);
			}
			else if(level == 7) {
				startPos = cp.v(100, -100);
				finish.pos = cp.v(700, 1600);
				endY = 2100;

				backgroundImage.src = location + "are_ostra_ravin.jpg";
				floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(0, 0), cp.v(700, 0), 5));
				floor.setFriction(1.0); floor.group = 2; floor.layers = 1;

				circle(700, -300, 300, 2/20 * Math.PI, 10/20 * Math.PI);

				line(-1400, 1000, 1000, 0);
				line(-330, 1000, 0, 100);
				line(-260, 1000, 260, 0);
				circle(0, 600, 400, -21/20 * Math.PI, 10/20 * Math.PI);

				circle(0, 1200, 400, 10/20 * Math.PI, 20/20 * Math.PI);
				line(0, 1600, 800, 0);
			}

			else console.log("Define a certain level to initialize");

			finish.pole.shape = this.space.addShape(new cp.SegmentShape(this.space.staticBody, 
				cp.v(finish.pos.x, finish.pos.y),
				cp.v(finish.pos.x + finish.pole.width, finish.pos.y - finish.pole.height), 10));
			finish.pole.shape.layers = 2;
			finish.pole.shape.group = 1;
		}

		this.draw = function(bikePos) {
		 	context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

			context.save();
			context.strokeStyle = "black";
			context.translate(canvas.width/2 - bikePos.x, canvas.height/2 - bikePos.y);

		 	space.eachShape(function(shape) {
		 		// Draws everything but the bike
				if(shape.group != 1) {
					shape.draw(context);
				}
			}, 1000/60);

		 	context.drawImage(finish.pole.image, finish.pos.x, finish.pos.y - finish.pole.height);
			context.restore();
		}
	}
	window.Level = Level;

})(window);
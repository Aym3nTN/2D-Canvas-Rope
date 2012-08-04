var timer = (function() {
	var SLOW_MOTION_RATIO = 0.5;
	var MAX_POSSIBLE_DT = 0.002;	    // This Is Needed To Prevent Passing Over A Non-Precise dt Value
	
	var timer = new Date().getTime();
	
	return {
		getNewDt: function() {
			// dt between frames
			var dt = new Date().getTime() - timer;
			
			// Update timer
			timer = new Date().getTime();
			
			var dts, numOfIterations;
			// Slow motion if you want
			dt /= SLOW_MOTION_RATIO;
			
			// dt in seconds
		  	dts = dt / 1000;
		  	
		  	return dts;
		},
	  	getNumberOfIterations: function(dts) {
		  	// Iteration needed to catch up with the MAX_POSSIBLE_DT
			return parseInt(dts / MAX_POSSIBLE_DT) + 1;
		}
	};
})();

var engine = (function() {
	// Define constants
	var DEFAULT_NUMBER_OF_POINTS = 40;	
	var MASS = .001; // Mass in Kg of a point of the Rope assuming the whole mass is 1kg
	
	var GRAVITATIONAL_PULL = 100;
	
	// Points array
	var points = [];
	
	function _updateCoordinates(points, dt) {
		for(var i=1; i < points.length; i++)
		{					
			points[i].removeForces();					  
		
			var spring_connection = Object.create(spring);
			spring_connection.initWithPoints(points[i-1], points[i]).applyForces();
		
			points[i].addForceFromVect(Object.create(vect2).initWithCoordinates(0, GRAVITATIONAL_PULL).multiplyByScalar(MASS));
		
			points[i].simulate(dt, MASS);
		}
	}
	
	return {
		animating: 1,
		// Initiates an array with the coordinates of each points of the rope
		initiateLineWithPoints: function (numberOfPoints) {
			numberOfPoints = typeof numberOfPoints !== 'undefined' ? numberOfPoints : DEFAULT_NUMBER_OF_POINTS;
		
			// Create 50 distinct points
			for(var i=0; i < numberOfPoints; i++)
			{
				var newPoint = Object.create(point).init().initWithCoordinates(500+i, 25);
		
				points.push(newPoint);
			}
		
			return points;
		},
		getPoints: function() {
			return points;
		},
		animate: function () {
			// This is to ensure that this instructions don't execute when the animation is done (it's a waste of time in that case)
			if(this.animating)
			{
				var dts = timer.getNewDt();
				var numOfIterations = timer.getNumberOfIterations(dts);
				
				if (numOfIterations != 0) // This shouldn't be zero anyways, that would be a miracle or a JS bug --"
				   	dts = dts / numOfIterations;                      // dt Should Be Updated According To numOfIterations
	
				for (var a = 0; a < numOfIterations; a++)
				{
					_updateCoordinates(points, dts)
				}
	
				points[0].removeForces();
	
				// draw
				rendrer.drawLineWithPoints(points);
			}
	
			// if User isn't clicking at the end of the rope and velocity of the rope is 0 then stop the animation to save on CPU cycles
			if(!interactionEngine.clicked && Math.abs(points[points.length-1].velocity.x) < 0.01 && Math.abs(points[points.length-1].velocity.y) < 0.01)
			{
				this.animating = 0;
			}
	
			parentContext = this;
			// request new frame
			requestAnimFrame(function(){
				parentContext.animate();
			});
		}
	}
})();
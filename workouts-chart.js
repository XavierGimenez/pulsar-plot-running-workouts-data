define('workouts-chart',
	['d3','processing', 'turf', 'queue', 'lodash'], function(d3, processing, turf, queue, _) {

	var module = {},
		workouts,
		distanceExtent, elevationExtent,
		canvas,
		sketch,
		xscale, yscale,
		yScaleRange = 50,
		size = {w:960, h:700},
		xdomain, ydomain,
		margin = {top:30, bottom:30, left:240, right: 240},
		noisePoints = 50,
		noiseGap = (margin.left/2)/noisePoints,
		noiseBefore = [];


	module.create = function()
	{	
		//some workouts are out of the 'average' (trail races per example). Remove them
		//from the sampling just for aesthetic purposes
		var removedWorkouts2012 = [0, 1, 3, 10];
		var removedWorkouts2013 = [19, 25, 26, 28, 29];
		var removedWorkouts2014 = [0, 1, 7, 11, 24, 25];
		queue()
			.defer(d3.json, "data/workouts2012.json")
			.defer(d3.json, "data/workouts2013.json")
			 .defer(d3.json, "data/workouts2014.json")
			.awaitAll(function(error, results)
			{
				//remove indicated workouts and join the rest
				_.pullAt(results[0], removedWorkouts2012);
				_.pullAt(results[1], removedWorkouts2013);
				_.pullAt(results[2], removedWorkouts2014);
				workouts = _.flatten(results);
				prepareData(workouts);
				render();
			});
	}



	function prepareData(workouts)
	{
		//get max and min values for elevation
		elevationExtent = [
			d3.min(workouts, function(workout)
			{
				return d3.min(workout[0].segments[0], function(point)
					{
						return +point.e;
					});
			}),
			d3.max(workouts, function(workout)
			{
				return d3.max(workout[0].segments[0], function(point)
					{
						return +point.e;
					});
			})			
		];

		//calculate distance for each point and overall distance for each workout
		workouts.forEach(function(workout)
		{
			workout["distance"] = 0;
			workout[0].segments[0].forEach(function(point, index)
			{
				point["distance"] = (index == 0)? 
					0 : 
					turf.distance(
						turf.point([parseFloat(point['lon']), parseFloat(point['lat'])]),
						turf.point(
							[	parseFloat(workout[0].segments[0][index-1]['lon']), 
								parseFloat(workout[0].segments[0][index-1]['lat'])
							])
					) + workout[0].segments[0][index-1].distance;
			});
			workout["distance"] = workout[0].segments[0][workout[0].segments[0].length - 1].distance;
		});

		//get max distance from workouts
		distanceExtent = [
			0,
			d3.max(workouts, function(workout)
			{
				return workout["distance"];
			})
		];

		xscale = d3.scale.linear()
			.domain(distanceExtent)
			.range([0,size.w - margin.right - margin.left]);

		yscale = d3.scale.linear()
			.domain(elevationExtent)
			.range([0,yScaleRange]);			
	}



	function generateNoise(processing)
	{
		var noise = [];
	    for(var i=0; i<noisePoints; i++)
		{
			noise.push(
				{	x : -(margin.left/2) + (i*noiseGap), 
					y : yscale.range()[1] - processing.random(1,2)
				});			

			//curve made by curveVertexs has duplicated the first and last point, so proceed:
			//these duplicated points have 0 altitude
			if(i == 0)
				noise = 
					[{	x:noise[noise.length-1].x, 
						y:yscale.range()[1] 
					}].concat(noise);			
		}
		return noise;
	}



	function render()
	{	
		function sketch(processing)
		{

			//prepare noise points before the route points
			workouts.forEach(function(workout, workout_index)
			{
				noiseBefore.push([].concat(generateNoise(processing)));
			});
				
			  processing.setup = function() 
			  {
			    processing.size(size.w, size.h, processing.P2D);
			    processing.frameRate(1);	//no need to animate anything
			    processing.noLoop();	//no need to animate anything
			    processing.fill(0, 0, 0, 255);
			    //processing.fill(204, 102, 0);
			    //processing.noFill();
			    
			  };

			  processing.draw = function() 
			  {			
			  console.log("draw");

			    processing.background(0, 0, 0);						    
			    processing.scale(0.75, 0.75);
				processing.translate(margin.left*1.5, 0);
				processing.stroke(255,255, 255, 255);		

				workouts.forEach(function(workout, workout_index)
				{	
					var lastDistance;

					processing.translate(0, (size.h - margin.top - margin.bottom)/(workouts.length));
					processing.beginShape();
					
					//draw noise before the workout
					noiseBefore[workout_index].forEach(function(point)
					{
						processing.curveVertex(point.x, point.y);
					});
					// processing.translate((workout_index), 0);
					//draw workout
					workout[0].segments[0].forEach(function(point, index)
					{
						processing.curveVertex(										
							xscale(point.distance), 
							yscale.range()[1] - yscale(point.e)
						);

						if(index == workout[0].segments[0].length - 1)
							lastDistance = xscale(point.distance);
					});
					
					processing.curveTightness(5);
					for(var x = lastDistance; x<xscale.range()[1] + (margin.left/2); x=x+4)
					{
						processing.vertex(20 + x, yscale.range()[1] - processing.random(1,2));
					}
					processing.endShape();
				});
			  }						  
		}

		canvas = document.getElementById("canvas_chart");
		//sketch = new Processing.Sketch();
		var p = new Processing(canvas, sketch);		
	}


	return module;
})
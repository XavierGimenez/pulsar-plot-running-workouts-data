define('workouts-chart',
	['d3','processing', 'turf', 'queue'], function(d3, processing, turf, queue) {

	var module = {},
		workouts,
		distanceExtent, elevationExtent,
		canvas,
		sketch,
		xscale, yscale,
		yScaleRange = 200,
		size = {w:960, h:600},
		xdomain, ydomain,
		margin = {top:30, bottom:30, left:200, right: 200},
		noisePoints = 50,
		noiseGap = (margin.left/2)/noisePoints,
		noiseBefore = [],
		noiseAfter = [];


	module.create = function()
	{		
		queue()
			.defer(d3.json, "data/workouts2012.json")
			.defer(d3.json, "data/workouts2013.json")
			.defer(d3.json, "data/workouts2014.json")
			.awaitAll(function(error, results)
			{
				console.log("results, ", results);
				workouts = results[0].concat(results[1].concat(results[2]));
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



	function generateNoise(position, processing)
	{
		var noise = [];
	    for(var i=0; i<noisePoints; i++)
		{
			if(position == 0)
				noise.push(
					{	x : -(margin.left/2) + (i*noiseGap), 
						y : yscale.range()[1] - processing.random(1,2)
					});
			else
				noise.push(
					{	x : (i*noiseGap), 
						y : yscale.range()[1] - processing.random(1,2)
					});

			//curve made by curveVertexs has duplicated the first and last point, so proceed:
			//these duplicated points have 0 altitude
			if(position == 0 && i == 0)
				noise = 
					[{	x:noise[noise.length-1].x, 
						y:yscale.range()[1] 
					}].concat(noise);
			else if (position == 1 && i == noisePoints-1)
				noise.push( 
					{	x: noise[noise.length-1].x, 
						y: yscale.range()[1] 
					});
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
				
				noiseBefore.push([].concat(generateNoise(0, processing)));
				noiseAfter.push([].concat(generateNoise(1, processing)));
			});
				
			  processing.setup = function() 
			  {
			    processing.size(size.w, size.h, processing.P2D);
			    processing.frameRate(1);
			    processing.fill(0, 0, 0, 200);
			    //processing.fill(204, 102, 0);
			    //processing.noFill();
			    // processing.noLoop();
			  };

			  processing.draw = function() 
			  {			  
			    processing.background(0, 0, 0);						    
				processing.translate(margin.left, margin.top);
				processing.stroke(255,255, 255, 255);		

				workouts.forEach(function(workout, workout_index)
				{	
					var lastDistance;

				if(workout_index < 139)							
				{
					processing.translate(0, (size.h - margin.top - margin.bottom)/(workouts.length*2));
					processing.beginShape();
					
					//draw noise before the workout
					noiseBefore[workout_index].forEach(function(point)
					{
						processing.curveVertex(point.x, point.y);
					});

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
					// draw noise after the workout
					noiseAfter[workout_index].forEach(function(point)
					{
						processing.vertex(lastDistance + point.x, point.y);

						processing.curveTightness(0);
					});

					processing.endShape();
				}
				});
			  }						  
		}

		canvas = document.getElementById("canvas_chart");
		//sketch = new Processing.Sketch();
		var p = new Processing(canvas, sketch);		
	}


	return module;
})
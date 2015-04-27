define('workouts-chart',
	['d3','processing', 'turf'], function(d3, processing, turf) {

	var module = {},
		workouts,
		distanceExtent, elevationExtent,
		canvas,
		sketch,
		xscale, yscale,
		yScaleRange = 100,
		size = {w:960, h:600},
		xdomain, ydomain,
		margin = {top:30, bottom:30, left:200, right: 200};


	module.create = function()
	{		
		d3.json("data/workouts2014.json", function(error, json)
			{
				if(error)
					return console.log("Error while loading data");
				
				workouts = json;
				prepareData(workouts);
				draw();
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



	function draw()
	{
		canvas = document.getElementById("canvas_chart");
		sketch = new Processing.Sketch();
		sketch.attachFunction = function(processing)
		{
						var tex;

						  processing.setup = function() {
						    processing.size(size.w, size.h, processing.P2D);
						    processing.fill(204, 102, 0);						    
						    //processing.noFill();
						  };

						  processing.draw = function() {
						    processing.background(0, 0, 0);						    
 							processing.translate(margin.left, margin.top);
							console.log("workouts length ", workouts.length);
							workouts.forEach(function(workout, workout_index)
							{								
								processing.translate(0, (size.h - margin.top - margin.bottom)/(workouts.length*2));
								processing.beginShape();
								workout[0].segments[0].forEach(function(point, index)
								{
									processing.stroke(255,255, 255, 150);

									//add some noise before the workout
									/*for(i=0; i<100; i++)
									{
										processing.curveVertex(										
											(margin.left/2) + (i*2), 
											processing.random(0,10)
										);
									}*/

									if(index == 0 || index == workout[0].segments[0].length - 1)
									processing.curveVertex(										
										xscale(point.distance), 
										yscale.range()[1] - yscale(point.e)
									)
									
									processing.curveVertex(										
										xscale(point.distance), 
										yscale.range()[1] - yscale(point.e)
									);
								});

								processing.endShape();

							});
						  }						  
		}

		var p = new Processing(canvas, sketch);
	}


	return module;
})
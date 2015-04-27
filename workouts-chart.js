define('workouts-chart',
	['d3','processing', 'turf'], function(d3, processing, turf) {

	var module = {},
		workouts,
		distanceExtent, elevationExtent,
		canvas,
		sketch,
		xscale, yscale,
		xdomain, ydomain;



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
			.range([0,450]);

		yscale = d3.scale.linear()
			.domain(elevationExtent)
			.range([0,100]);
	}



	function draw()
	{
		canvas = document.getElementById("canvas_chart");
		sketch = new Processing.Sketch();
		sketch.use3Dcontext = true;
		sketch.attachFunction = function(processing)
		{
						var tex;
						  var rotx = Math.PI/6;
						  var roty = Math.PI/14;

						  processing.setup = function() {
						    processing.size(640, 360, processing.P3D);
						    processing.fill(255);						    
						  };

						  processing.draw = function() {
						    processing.background(255, 255, 255);						    
						  	processing.translate(processing.width/2.0, 40 + (processing.height/3.0), -150);
 							processing.rotateY(roty);
							
							workouts.forEach(function(workout, workout_index)
							{
								processing.pushMatrix();
								processing.rotateY(  ((2*processing.PI)/(workouts.length))* workout_index  );
								processing.beginShape();
								processing.stroke(30,30, 30, 150);
								workout[0].segments[0].forEach(function(point, index)
								{
									if(index == 0)
										processing.line(
											100 + xscale(0),
											yscale.range()[1] - yscale(0),
											0,
											100 + xscale(0),
											yscale.range()[1] - yscale(point.e),
											0
										);

									if(index == 0 || index == workout[0].segments[0].length - 1)
										processing.curveVertex(
											100 + xscale(point.distance), 
											yscale.range()[1] - yscale(point.e), 
											0
										);

									processing.curveVertex(
											100 + xscale(point.distance), 
											yscale.range()[1] - yscale(point.e), 
											0
									);
									/*
									if(index == 0)
										processing.line(
											100 + xscale(0),
											yscale.range()[1] - yscale(0),
											0,
											100 + xscale(0),
											yscale.range()[1] - yscale(point.e),
											0
										);
									else
										processing.line(											
											100 + xscale(workout[0].segments[0][index-1].distance),
											yscale.range()[1] - yscale(workout[0].segments[0][index-1].e),
											0,
											100 + xscale(point.distance), 
											yscale.range()[1] - yscale(point.e), 
											0
										);
									*/
								});
								processing.endShape();
								// processing.stroke(0,0, 200, 100);
								// processing.line(
								// 	100 + xscale(0),
								// 	yscale.range()[1],
								// 	0,
								// 	100 + xscale.range()[1],
								// 	yscale.range()[1],
								// 	0
								// 	);
								processing.popMatrix();
							});
						  }						  
		}

		var p = new Processing(canvas, sketch);
	}


	return module;
})
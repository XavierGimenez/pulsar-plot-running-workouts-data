require.config({
  baseUrl: 'bower_components',
  paths :{
    'd3'  				: 'd3/d3.min',
    'processing'		: 'Processing.js/processing.min',
    'turf'				: 'turf/turf.min',
    'workouts-chart'	: '../workouts-chart'
  }
});

require(
  ['d3', 'processing', 'workouts-chart', 'turf'],
  function(d3, processing, workoutschart)
  {
  	workoutschart.create();
  }
);
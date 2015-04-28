require.config({
  baseUrl: 'bower_components',
  paths :{
    'd3'  				    : 'd3/d3.min',
    'processing'		  : 'Processing.js/processing.min',
    'turf'				    : 'turf/turf.min',
    'stats'           : 'stats.js/build/stats.min',
    'queue'           : 'queue-async/queue.min',
    'workouts-chart'	: '../workouts-chart'
  }
});

require(
  ['d3', 'processing', 'workouts-chart', 'turf', 'stats'],
  function(d3, processing, workoutschart, stats)
  {
    /*
    var _stats = new Stats();
    _stats.setMode(0); // 0: fps, 1: ms

    // align top-left
    _stats.domElement.style.position = 'absolute';
    _stats.domElement.style.left = '0px';
    _stats.domElement.style.top = '0px';
    document.body.appendChild( _stats.domElement );
    var update = function () 
    {
        _stats.begin();
          // monitored code goes here
          workoutschart.create();
        _stats.end();
        requestAnimationFrame( update );
    };
    requestAnimationFrame( update );
    */

    workoutschart.create();
  }
);
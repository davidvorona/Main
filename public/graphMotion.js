'use strict';

var count = 1;
var v0;
var t;
var GRAPH = document.getElementById('line-graph');

var layout = {
  yaxis: {title: "Vertical Displacement (m)"},
  xaxis: {title: "Horizontal Displacement (m)"},
  margin: { t: 20, b: 40, r: 20, l: 50 },
}

var savedPos = {};
savedPos.x = [];
savedPos.y = [];

function storePosition() {
  savedPos.x.push(5 - ball.position.x);
  savedPos.y.push(ball.position.y - .3);
}

function graphMotion() {
  Plotly.plot( GRAPH, [{
  x: savedPos.x,
  y: savedPos.y,
  name: 'Throw ' + count }],
  layout,
  {displayModeBar: false} );
  $('#line-graph').animate({ opacity: 1 });
  $('#v0Div').text("Initial Velocity: " + v0 + "m/s");
  $('#tDiv').text("Time: " + t + "s");
  count++;
  savedPos.x = [];
  savedPos.y = [];
}
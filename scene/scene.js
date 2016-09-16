// initializes Phys.js library web worker for physics calculations
// Phys.js is built on top of ammo.js
Physijs.scripts.worker = '/lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

// to handle mid-game window resizing
function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   renderer.setSize( window.innerWidth, window.innerHeight );
   render();
}

window.addEventListener( 'resize', onWindowResize, false );

// to handle user keyboard input
var keyboard = {};

function keyDown(event){
  keyboard[event.keyCode] = true;
}

function keyUp(event){
  keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

// initializes variables for scene
// keyboard for spacebar functionality
var spaceScene;
var camera, renderer, mesh;
scene = new Physijs.Scene;
scene.setGravity(new THREE.Vector3( 0, user.changeGravityValue, 0 ));
scene.addEventListener(
  'update',
  function() {
    scene.simulate( undefined, 2 );
  }
);

// set parameters for entire scene
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true } );
renderer.setClearColor(0x000000, 0);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// choose camera
camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.x = 13;
camera.position.y = 3;
camera.position.z = 0;
camera.lookAt(new THREE.Vector3(0,3,0))


// add earth w/ clouds to scene
// scene.add( earth );


// add ball, depending on user type
addBall = function() {
  if (user.myTurn === true) {
    ball.position.z = 0;
    ball.position.x = 5;
    ball.position.y = .3;
    ball.collisions = 0;
    scene.add( ball );
  } else {
    ball2.position.z = 0;
    ball2.position.x = -7;
    ball2.position.y = .3;
    ball.collisions = 0;
    scene.add( ball2 );
  }
}
addBall();


//add target
scene.add(target);
scene.add(cap1);
scene.add(cap2);
scene.add(cap3);
scene.add(cap4);
scene.add(cap5);
scene.add(cap6);


// add astronaut
objLoader.load( '/assets/astronaut/Astronaut.obj', function ( object ) {
  object.traverse( function ( child ) {
       if ( child instanceof THREE.Mesh ) {
        child.material.map = imageMap;
        child.material.normalMap = normalMap;
        child.material.specularMap = specMap;
        child.castShadow = true;
      }
    });

  object.position.x = -9.8;
  object.rotation.y = 64.4;
  scene.add(object);
});


// add planet landscape
// TODO: make dynamic, so user can choose planet
var floorImage = new THREE.Texture();
var floorMap = new THREE.Texture();

imgLoader.load('/assets/finalMoonPics/marsColor.bmp', function(img) {
  floorImage.image = img;
  floorImage.needsUpdate = true;
});

imgLoader.load('/assets/finalMoonPics/marsNormal.jpg', function(img) {
  floorMap.image = img;
  floorMap.needsUpdate = true;
});

objLoader.load( '/assets/finalMoonPics/marsFloor.obj', function ( object ) {
  object.traverse( function ( child ) {
       if ( child instanceof THREE.Mesh ) {
        child.material.map = floorImage;
        child.material.normalMap = floorMap;
        child.material.normalScale.set(-0.2, -0.2);
        child.receiveShadow = true;
      }
    });
  scene.add( object );
});


// add fake floor (invisible), OBJs have no physics attributes
scene.add( fakeFloor );


// add lighting
scene.add( spotlight );
scene.add( spotlight2 );
// add demo lighting
if (isDemo === true && user.player === "user_1") scene.add(ambientLight);


function render() {

  // run physics and set gravity
  scene.simulate();
  scene.setGravity(new THREE.Vector3( 0, user.changeGravityValue, 0 ));

  // if earth exists, make that baby spin!
  earth.rotation.x += parameters.rotateX;
  earth.rotation.y -= parameters.rotateY;
  earth.rotation.z += parameters.rotateZ;
  // add cool clouds to earth
  cloudMesh.rotation.x -= parameters.cRotateX;
  cloudMesh.rotation.y -= parameters.cRotateY;


  // start sending condition for spacebar, sets initial impulse for projectile motion
  if (user.spaceBarFlag === true) {
    throwProjectile();
  }

  // start sending condition for tracking, sets initial impulse for projectile motion
  if (delayedTrackerMatches.trackFlag === true && user.trackFlag === true) {
    if (isDemo === true) userVelocity = 4.5;
    else {
      var lowLimit, upLimit;

      // find lower tracker matches limit

      // find upper tracker matches limit

      // find lower velocity limit
      if (user.changeGravityValue >= -3.6) lowLimit = 1.5;
      else if (user.changeGravityValue >= -6) lowLimit = 2.0;
      else if (user.changeGravityValue >= -8.4) lowLimit = 2.5;
      else lowLimit = 3.0;

      // calculate upper velocity limit
      upLimit = ((user.changeGravityValue + 1.6) / .4) * .5 + 9;

      // calculate velocity
      if (delayedTrackerMatches.counter > 50) delayedTrackerMatches.counter = 50;
      userVelocity = upLimit - (delayedTrackerMatches.counter / 50) * (upLimit - lowLimit);
    }
    throwProjectile();
  }

  // if you've already given ball initial impulse, simply continue sending
  if (moved === true && user.myTurn === true) {
    var xPos = -7 + (5 - ball.position.x);
    var yPos = ball.position.y;
    var zPos = ball.position.z;
    var xRot = ball.rotation.x
    var yRot = ball.rotation.y
    var zRot = ball.rotation.z;
    displayPosition('Height: ' + parseFloat(ball.position.y - .3).toFixed(3) + 'm', 'Distance: ' + parseFloat(5 - ball.position.x).toFixed(3) + 'm');
    if (turnEnded === false) {
      storePosition();
      checkBadThrow();
    }
    if (singleplayer === false) {
      sendPosition(xPos, yPos, zPos, xRot, yRot, zRot);
    }
  }

  // received condition, set your ball's position to mirror of other's
  if (moved === true && user.myTurn === false) {
    ball2.position.x = message.position[0];
    ball2.position.y = message.position[1];
    ball2.position.z = message.position[2];
    ball2.rotation.z = -(message.rotation[2]);
  }

  spaceScene = requestAnimationFrame( render );
  renderer.render( scene, camera );
}

render();


// for appending game messages to the DOM
$('#bg').append( renderer.domElement );

function sendPosition(x, y, z, xr, yr, zr) {
  var toSend = { 'type': 'ballPos', 'position': [ x, y, z ], 'rotation': [ xr, yr, zr ] };
  dataChannel.send(JSON.stringify(toSend));
}

function determineVelocity(velocity, angle) {
  v0 = parseFloat(userVelocity).toFixed(3);
  var radians = angle * (Math.PI/180);
  var vertV = userVelocity * Math.sin(radians);
  var horizV = -(userVelocity * Math.cos(radians));
  return [horizV, vertV];
}

function throwProjectile() {
  var userAngle = $('#inputAngle').val();
  var velocity = determineVelocity(userVelocity, userAngle);
  t = performance.now();
  ball.setLinearVelocity(new THREE.Vector3(velocity[0], velocity[1], 0));
  user.spaceBarFlag = false;
  delayedTrackerMatches.trackFlag = false;
  user.trackFlag = false;
  delayedTrackerMatches.counter = 0;
  if (turnEnded === false) {
    storePosition();
  }
  moved = true;
  if (singleplayer === false) {
    sendPosition((-7 + (5 - ball.position.x)), ball.position.y, ball.position.z, ball.rotation.x, ball.rotation.y, ball.rotation.z);
    dataChannel.send(JSON.stringify({ 'moved': moved }));
  }
  demo.clear();
}

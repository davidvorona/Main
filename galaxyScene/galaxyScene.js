//THIS FILE IMPORTS OBJECTS FROM ALL THE OTHER FILES IN THIS FOLDER AND RENDERS THE SOLAR-SYSTEM SCENE YOU SEE ON THE HOME PAGE
var renderer, scene, camera;
    theSun,
    theEarthAndMoon,
    theEarth,
    theMoon,
    Mars,
    jupiterAndGanymede,
    Ganymede,
    Jupiter,
    Saturn,
    Neptune;


init();
animate();

function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   renderer.setSize( window.innerWidth, window.innerHeight );
   render();
}

window.addEventListener( 'resize', onWindowResize, false );

function init() {


  // renderer - the space in which all the objects and the camera appears, this is 
  // re-rendered ~60x/second
  renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, alpha: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  $('#containerG').append( renderer.domElement );
//#containerG is the div in galaxy.html that the whole 3D scene is attached to

  // scene - contains all the planets, etc. 
  scene = new THREE.Scene();

  //camera
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 500;
  //camera.position.z = 35;
  camera.position.y = 100;

  camera.lookAt(new THREE.Vector3(0,0,0));
   //camera stays fixed on the position occupied by the sun, can be modified with code on line 138 to follow a planet's orbit
  //Camera cannot follow objects (which include planets with their own moons), hence following Mars instead of Earth.
  //Scott thinks it's prettier, but lost in a 2-1 vote.  

  scene.add(theSun);

  scene.add(Mercury);


  scene.add(Venus);


  scene.add(theEarthAndMoon);
  theEarthAndMoon.add(theEarth);
  theEarthAndMoon.add(cloudMesh);
  theEarthAndMoon.add(theMoon);


  scene.add(Mars);

  scene.add(jupiterAndGanymede);
  jupiterAndGanymede.add(Jupiter);
  jupiterAndGanymede.add(Ganymede);

  scene.add(Saturn);
  Saturn.add(iRing);
  Saturn.add(Ring);

  scene.add(Uranus);
  Uranus.add(uiRing);
  Uranus.add(umRing);
  Uranus.add(uoRing);

  scene.add(Neptune);

  scene.add( light );
  scene.add(sunLight1);
  scene.add(sunLight2);
  scene.add(sunLight3);
  scene.add(sunLight4);
  scene.add(sunLight5);
  scene.add(sunLight6);
  scene.add(sunLight7);
  scene.add(sunLight8);
  scene.add(sunLight9);
  scene.add(sunLight10);
  scene.add(sunLight11);
  scene.add(sunLight12);
  scene.add( aLight );

}

function animate() {

  requestAnimationFrame( animate ); //<-- superior to setInterval because animate stops on inactive tabs, so lighter and more battery friendly

  render();

}

//About the following: All of the below boils down to creating an orbit for each planet around the 0,0,0 position, 
//which is occupied by the Sun.  Each planet has it's own distance from the sun (radians) and it's own orbital speed
//we update the position of the planet based on it's orbital speed and by using Math.cos/Math.sin it's new position follows
// an elliptical pattern.  Decrement/Increment determines which direction it goes around the sun (clockwise, counterclockwise) 

function render() {

  earthOrbitAngle += earthOrbitSpeed;
  marsOrbitAngle -= marsOrbitSpeed;
  jupiterOrbitAngle -= jupiterOrbitSpeed;
  mercuryOrbitAngle += mercuryOrbitSpeed;
  saturnOrbitAngle += saturnOrbitSpeed;
  venusOrbitAngle -= venusOrbitSpeed;
  uOrbitAngle -= uOrbitSpeed;
  ganymedeOrbitAngle -= ganymedeOrbitSpeed;

  var moonRadians = moonOrbitAngle * Math.PI / 180;
  var ganymedeRadians = ganymedeOrbitAngle * Math.PI / 180;
  var radians = earthOrbitAngle * Math.PI / 180;
  var marsRadians = marsOrbitAngle * Math.PI/180;
  var jupiterRadians = jupiterOrbitAngle * Math.PI/180;
  var mercuryRadians = mercuryOrbitAngle * Math.PI/180;
  var saturnRadians = saturnOrbitAngle * Math.PI/180;
  var venusRadians = venusOrbitAngle * Math.PI/270;
  var uranusRadians = uOrbitAngle * Math.PI/180;
  var mRadians = uOrbitAngle * Math.PI/180;

  theEarthAndMoon.position.x = Math.cos(radians) * earthOrbitRadius;
  theEarthAndMoon.position.z = Math.sin(radians) * earthOrbitRadius;

  Mars.position.x = Math.cos(marsRadians) * marsOrbitRadius * 1.25;
  Mars.position.z = Math.sin(marsRadians) * marsOrbitRadius * 1.25;
  Mars.rotation.y -= .02;

  //camera.lookAt(Mars.position); 

  Venus.position.x = Math.cos(venusRadians) * venusOrbitRadius;
  Venus.position.z = Math.sin(venusRadians) * venusOrbitRadius;
  Venus.rotation.y -= .02;

  Uranus.position.x = Math.cos(uranusRadians) * uOrbitRadius * 1.4;
  Uranus.position.z = Math.sin(uranusRadians) * uOrbitRadius * 1.4;
  Uranus.rotation.y -= .003;
  Uranus.rotation.z -= .0006;

  Neptune.position.x = Math.cos(venusRadians) * nOrbitRadius * 2;
  Neptune.position.z = Math.sin(venusRadians) * nOrbitRadius * 2;
  Neptune.rotation.y -= .02;

   Saturn.position.x = Math.cos(saturnRadians) * saturnOrbitRadius * 1.3;
  Saturn.position.z = Math.sin(saturnRadians) * saturnOrbitRadius * 1.3;
   Saturn.rotation.y -= .002;

  theSun.rotation.z += .001;
  theSun.rotation.y -= .005;

  jupiterAndGanymede.position.x = Math.cos(jupiterRadians) * jupiterOrbitRadius * 1.3;
  jupiterAndGanymede.position.z = Math.sin(jupiterRadians) * jupiterOrbitRadius * 1.3;
  jupiterAndGanymede.rotation.y -= .005;

  Mercury.position.x = Math.cos(mercuryRadians) * mercuryOrbitRadius;
  Mercury.position.z = Math.sin(mercuryRadians) * mercuryOrbitRadius;
  Mercury.rotation.y -= .04;
  Mercury.rotation.z -= .0006;

  theEarthAndMoon.rotation.y -= .01;
  theEarthAndMoon.rotation.z -= .00005;

  Ganymede.position.y = Math.cos(ganymedeRadians) * ganymedeOrbitRadius;
  Ganymede.position.z = Math.sin(ganymedeRadians) * ganymedeOrbitRadius;

  //run the Moon's orbit around the Earth
  moonOrbitAngle += moonOrbitSpeed;

  theMoon.position.y = Math.cos(moonRadians) * moonOrbitRadius;
  theMoon.position.z = Math.sin(moonRadians) * moonOrbitRadius;

  // render
  renderer.render( scene, camera );

}

$(function() {

  $("#inputAngle").on("keydown",function search(e) {
    if (e.keyCode === 13) {
      userAngle = parseInt($(this).val());
    }
  });

  $("#inputMass").on("keydown",function search(e) {
    if (e.keyCode === 13){
      console.log(ball);
      ball._physijs.mass = $(this).val();
      console.log(ball._physijs.mass);
    }
  });

  $("#inputGravity").on("keydown",function search(e) {
    if (e.keyCode === 13) {
      console.log('scene gravity is now', $(this).val());
      user.changeGravityValue = $(this).val() * -12.5;
      user.changeGravityFlag = true;
      console.log('scene', scene);
       //scene.setGravity(new THREE.Vector3( 0, $(this).val() * -12.5, 0 ));
    }
  });
});
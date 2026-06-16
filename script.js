let scene, camera, renderer;

function startGame() {

  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document.body.appendChild(renderer.domElement);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 50),
    new THREE.MeshBasicMaterial({
      color: 0x333333
    })
  );

  ground.position.y = -1;

  scene.add(ground);

  // Enemy cube
  const enemy = new THREE.Mesh(
    new THREE.BoxGeometry(2,2,2),
    new THREE.MeshBasicMaterial({
      color: 0xff0000
    })
  );

  enemy.position.z = -10;

  scene.add(enemy);

  camera.position.y = 2;

  animate();
}

function animate() {

  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
document.addEventListener("keydown", e => {

  if(!camera) return;

  if(e.key === "w") camera.position.z -= 0.5;

  if(e.key === "s") camera.position.z += 0.5;

  if(e.key === "a") camera.position.x -= 0.5;

  if(e.key === "d") camera.position.x += 0.5;

});

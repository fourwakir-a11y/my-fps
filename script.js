let scene, camera, renderer;

let yaw = 0;
let pitch = 0;

let velocity = new THREE.Vector3();
const keys = {};

let enemy;

const friction = 0.82;

document.getElementById("startBtn").addEventListener("click", startGame);

function startGame(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("hud").style.display = "block";

  init();
  animate();

  document.body.requestPointerLock();
}

function init(){

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // LIGHTING
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(20, 40, 10);
  scene.add(sun);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color:0x3a5f3a })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // BUILDINGS
  for(let i=0;i<80;i++){
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(5,5,5),
      new THREE.MeshStandardMaterial({ color:0x777777 })
    );

    box.position.set(
      (Math.random()-0.5)*200,
      2.5,
      (Math.random()-0.5)*200
    );

    scene.add(box);
  }

  // ENEMY
  enemy = new THREE.Mesh(
    new THREE.BoxGeometry(2,4,2),
    new THREE.MeshStandardMaterial({ color:0xff3333 })
  );

  enemy.position.set(0,2,-30);
  scene.add(enemy);

  camera.position.set(0,2.2,10);
}

/* INPUT */
document.addEventListener("keydown", e=>{
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e=>{
  keys[e.key.toLowerCase()] = false;
});

/* MOUSE LOOK */
document.addEventListener("mousemove", e=>{

  if(document.pointerLockElement !== document.body) return;

  const sens = 0.0015;

  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;

  pitch = Math.max(-1.5, Math.min(1.5, pitch));
});

/* SHOOT */
document.addEventListener("click", ()=>{
  if(!enemy) return;

  const dist = camera.position.distanceTo(enemy.position);

  if(dist < 25){
    scene.remove(enemy);
    enemy = null;

    document.getElementById("objective").innerText =
      "Objective Complete";
  }
});

function animate(){
  requestAnimationFrame(animate);

  const speed = 0.08;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(camera.up, forward).normalize();

  // movement (FIXED)
  if(keys["w"]) velocity.add(forward.multiplyScalar(speed));
  if(keys["s"]) velocity.add(forward.multiplyScalar(-speed));
  if(keys["a"]) velocity.add(right.multiplyScalar(speed));
  if(keys["d"]) velocity.add(right.multiplyScalar(-speed));

  // friction (smooth feel)
  velocity.multiplyScalar(friction);

  camera.position.add(velocity);

  // camera rotation
  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}

window.addEventListener("resize", ()=>{
  if(!camera) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

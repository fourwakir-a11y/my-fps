let scene, camera, renderer;
let enemy;

let yaw = 0;
let pitch = 0;

let velocity = new THREE.Vector3();
const keys = {};

const friction = 0.85;

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

  // 🌫️ Kour.io-style atmosphere
  scene.fog = new THREE.FogExp2(0xa9c9ff, 0.018);
  scene.background = new THREE.Color(0xa9c9ff);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.body.appendChild(renderer.domElement);

  // LIGHTING (soft + natural)
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(60, 100, 40);
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0xa9c9ff, 0x2e5f2e, 0.7);
  scene.add(hemi);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({
      color:0x2f7d32,
      roughness:1
    })
  );

  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  // BUILDINGS (clean stylized variation)
  for(let i=0;i<120;i++){

    const h = Math.random()*18 + 3;

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(4, h, 4),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.4,0.4,0.4),
        roughness:1
      })
    );

    box.position.set(
      (Math.random()-0.5)*250,
      h/2,
      (Math.random()-0.5)*250
    );

    scene.add(box);
  }

  // ENEMY
  enemy = new THREE.Mesh(
    new THREE.BoxGeometry(2,4,2),
    new THREE.MeshStandardMaterial({
      color:0xff4444,
      emissive:0x220000
    })
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

  if(keys["w"]) velocity.add(forward.multiplyScalar(speed));
  if(keys["s"]) velocity.add(forward.multiplyScalar(-speed));
  if(keys["a"]) velocity.add(right.multiplyScalar(speed));
  if(keys["d"]) velocity.add(right.multiplyScalar(-speed));

  velocity.multiplyScalar(friction);
  camera.position.add(velocity);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}

window.addEventListener("resize", ()=>{
  if(!camera) return;

  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

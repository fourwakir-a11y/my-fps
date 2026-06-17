
let scene, camera, renderer;

const player = {
  position: new THREE.Vector3(0, 2.2, 10),
  velocity: new THREE.Vector3(),
  speed: 0.12,
  sprint: 0.22,
  canJump: false
};

let yaw = 0;
let pitch = 0;

const keys = {};
let colliders = [];

// ---------------- START BUTTON ----------------
document.getElementById("startBtn").addEventListener("click", bootGame);

function bootGame(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("hud").style.display = "block";

  initWorld();
  animate();

  document.body.requestPointerLock();
}

function initWorld(){

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa9c9ff);
  scene.fog = new THREE.FogExp2(0xa9c9ff, 0.012);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // LIGHTS
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(80,120,40);
  scene.add(sun);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800,800),
    new THREE.MeshStandardMaterial({ color:0x2f8a3a })
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  // ROAD
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(600,0.2,30),
    new THREE.MeshStandardMaterial({ color:0x2a2a2a })
  );
  scene.add(road);

  // BORDER WALLS
  makeWall(0,0,-400,800,50);
  makeWall(0,0,400,800,50);
  makeWall(-400,0,0,50,800);
  makeWall(400,0,0,50,800);

  player.position.set(0,2.2,10);

  createMap(); // AUTO LOAD MAP
addEnvironment();
setupMinimap();}

function makeWall(x,y,z,w,h,d){
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w,50,d),
    new THREE.MeshBasicMaterial({ visible:false })
  );

  wall.position.set(x,25,z);
  scene.add(wall);

  colliders.push(wall);
}

function box(pos){
  return new THREE.Box3().setFromCenterAndSize(
    pos,
    new THREE.Vector3(1,4,1)
  );
}

document.addEventListener("keydown", e=>{
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e=>{
  keys[e.key.toLowerCase()] = false;
});

document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement !== document.body) return;

  const sens = 0.0015;
  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;

  pitch = Math.max(-1.5, Math.min(1.5, pitch));
});

function animate(){
  requestAnimationFrame(animate);

  const speed = keys["shift"] ? player.sprint : player.speed;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3().crossVectors(camera.up, forward);

  let move = new THREE.Vector3();

  if(keys["w"]) move.add(forward.clone().multiplyScalar(speed));
  if(keys["s"]) move.add(forward.clone().multiplyScalar(-speed));
  if(keys["a"]) move.add(right.clone().multiplyScalar(speed));
  if(keys["d"]) move.add(right.clone().multiplyScalar(-speed));

  if(keys[" "] && player.canJump){
    player.velocity.y = 0.35;
    player.canJump = false;
  }

  player.velocity.y -= 0.018;

  move.add(player.velocity);

  const next = player.position.clone().add(move);
  const pBox = box(next);

  let blocked = false;

  for(let c of colliders){
    const b = new THREE.Box3().setFromObject(c);
    if(pBox.intersectsBox(b)){
      blocked = true;
      break;
    }
  }

  if(!blocked){
    player.position.copy(next);
  }

  if(player.position.y < 2.2){
    player.position.y = 2.2;
    player.velocity.y = 0;
    player.canJump = true;
  }

  camera.position.copy(player.position);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene,camera);
}

function createBuilding(x,z,h){

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(12,h,12),
    new THREE.MeshStandardMaterial({ color:0x666666 })
  );

  mesh.position.set(x,h/2,z);
  scene.add(mesh);
  colliders.push(mesh);
}

function createMap(){

  // DOWNTOWN
  createBuilding(-30,-30,18);
  createBuilding(30,-30,18);
  createBuilding(0,-60,10);

  // SUBURBS
  const pos = [
    [-80,-80],[-100,-40],[-60,60],
    [80,80],[100,-60],[120,20]
  ];

  pos.forEach(p=>{
    createBuilding(p[0],p[1],8);
  });
}

function addEnvironment(){

  for(let i=0;i<30;i++){
    const tree = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5,0.5,4),
      new THREE.MeshStandardMaterial({ color:0x5a3a1e })
    );

    tree.position.set(
      (Math.random()-0.5)*700,
      2,
      (Math.random()-0.5)*700
    );

    scene.add(tree);
  }
}

function setupMinimap(){
  console.log("minimap ready (UI hook)");
}

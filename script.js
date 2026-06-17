let scene, camera, renderer;

// PLAYER SYSTEM (NEW FOUNDATION)
const player = {
  position: new THREE.Vector3(0, 2.2, 10),
  velocity: new THREE.Vector3(),
  height: 2.2,
  speed: 0.12,
  sprintSpeed: 0.22,
  canJump: false
};

let yaw = 0;
let pitch = 0;

const keys = {};

let colliders = []; // ALL solid objects go here

document.getElementById("startBtn").addEventListener("click", startGame);

function startGame(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("hud").style.display = "block";

  init();
  animate(player.velocity.x *= 0.85;
player.velocity.z *= 0.85;
const speed = keys["shift"] ? player.sprintSpeed : player.speed;
updateMinimap(););

  document.body.requestPointerLock();
}
function init(){

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
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.body.appendChild(renderer.domElement);

  // LIGHTING
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(80,120,40);
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0xa9c9ff, 0x2b5a2b, 0.8);
  scene.add(hemi);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800,800),
    new THREE.MeshStandardMaterial({ color:0x2f8a3a })
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  // ROAD CROSS
  const roadMat = new THREE.MeshStandardMaterial({ color:0x2a2a2a });

  const road1 = new THREE.Mesh(
    new THREE.BoxGeometry(600,0.2,30),
    roadMat
  );
  scene.add(road1);

  const road2 = new THREE.Mesh(
    new THREE.BoxGeometry(30,0.2,600),
    roadMat
  );
  scene.add(road2);
    createWall(0,0,-400,800,50);
  createWall(0,0,400,800,50);
  createWall(-400,0,0,50,800);
  createWall(400,0,0,50,800);

  // spawn
  player.position.set(0,2.2,10);
createDowntown();
createSuburbs();
createAlleys();
addProp();}
function createWall(x,y,z,w,h){
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w,50,h),
    new THREE.MeshBasicMaterial({ visible:false })
  );

  wall.position.set(x,25,z);
  scene.add(wall);

  colliders.push(wall);
}

function getPlayerBox(pos){
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

  const speed = keys["shift"] ? player.sprintSpeed : player.speed;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(camera.up, forward).normalize();

  let move = new THREE.Vector3();

  if(keys["w"]) move.add(forward.clone().multiplyScalar(speed));
  if(keys["s"]) move.add(forward.clone().multiplyScalar(-speed));
  if(keys["a"]) move.add(right.clone().multiplyScalar(speed));
  if(keys["d"]) move.add(right.clone().multiplyScalar(-speed));

  // JUMP
  if(keys[" "] && player.canJump){
    player.velocity.y = 0.35;
    player.canJump = false;
  }

  // gravity
  player.velocity.y -= 0.018;

  move.add(player.velocity);

  // COLLISION CHECK
  const nextPos = player.position.clone().add(move);

  const playerBox = getPlayerBox(nextPos);

  let blocked = false;

  for(let c of colliders){
    const box = new THREE.Box3().setFromObject(c);
    if(playerBox.intersectsBox(box)){
      blocked = true;
      break;
    }
  }

  if(!blocked){
    player.position.copy(nextPos);
  }

  // ground collision
  if(player.position.y < 2.2){
    player.position.y = 2.2;
    player.velocity.y = 0;
    player.canJump = true;
  }

  // apply camera to player
  camera.position.copy(player.position);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}
function addCollider(mesh){
  colliders.push(mesh);
  scene.add(mesh);
}

function makeWall(x,y,z,w,h,d){
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    new THREE.MeshStandardMaterial({ color:0x444444 })
  );
  wall.position.set(x,y,z);
  addCollider(wall);
  return wall;
}
function makeBuilding(x, z, type){

  // BASE STRUCTURE
  let height = 10;

  if(type === "house") height = 8;
  if(type === "apartment") height = 18;
  if(type === "office") height = 26;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(12, height, 12),
    new THREE.MeshStandardMaterial({ color:0x666666 })
  );

  body.position.set(x, height/2, z);
  addCollider(body);

  // INTERIOR FLOOR
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(10,0.5,10),
    new THREE.MeshStandardMaterial({ color:0x2b2b2b })
  );

  floor.position.set(x,0.25,z);
  scene.add(floor);

  // ROOF (for 2–3 story buildings)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(12,0.5,12),
    new THREE.MeshStandardMaterial({ color:0x222222 })
  );

  roof.position.set(x,height,z);
  scene.add(roof);

  // OPENING (door gap illusion)
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(3,5,0.5),
    new THREE.MeshBasicMaterial({ visible:false })
  );

  door.position.set(x,2.5,z+6);
  addCollider(door);

  return body;
}
function createDowntown(){

  // OFFICE (3 STORY)
  makeBuilding(-30, -30, "office");

  // APARTMENT (3 STORY)
  makeBuilding(30, -30, "apartment");

  // STORE (1 STORY)
  makeBuilding(0, -60, "house");

  // MOTEL (2 STORY)
  makeBuilding(-40, 40, "apartment");

  // PARKING LOT
  const lot = new THREE.Mesh(
    new THREE.PlaneGeometry(60,60),
    new THREE.MeshStandardMaterial({ color:0x1f1f1f })
  );
  lot.rotation.x = -Math.PI/2;
  lot.position.set(0,0.01,0);
  scene.add(lot);

}
function createSuburbs(){

  const positions = [
    [-80, -80],
    [-100, -40],
    [-60, 60],
    [80, 80],
    [100, -60],
    [120, 20],
  ];

  positions.forEach(p=>{
    makeBuilding(p[0], p[1], "house");
  });

}
function createAlleys(){

  for(let i=0;i<6;i++){

    const wall1 = new THREE.Mesh(
      new THREE.BoxGeometry(2,6,20),
      new THREE.MeshStandardMaterial({ color:0x333333 })
    );

    wall1.position.set(i*15 - 40,3,10);
    addCollider(wall1);

    const wall2 = wall1.clone();
    wall2.position.z = 20;
    addCollider(wall2);
  }

}

// ===============================
// COLLISION STORAGE (SAFE)
// ===============================
if (!window.colliders) window.colliders = [];

// ===============================
// COLLIDER HELPER
// ===============================
function addCollider(mesh){
  colliders.push(mesh);
  scene.add(mesh);
}

// ===============================
// BASIC WALL (INVISIBLE COLLISION)
// ===============================
function makeWall(x,y,z,w,h,d){
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    new THREE.MeshBasicMaterial({ visible:false })
  );

  wall.position.set(x,y,z);
  scene.add(wall);
  colliders.push(wall);

  return wall;
}

// ===============================
// BUILDING CREATOR (ENTERABLE BASE)
// ===============================
function makeBuilding(x, z, type){

  let height = 10;

  if(type === "house") height = 8;
  if(type === "apartment") height = 18;
  if(type === "office") height = 26;

  // MAIN BODY (COLLIDER)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(12, height, 12),
    new THREE.MeshStandardMaterial({ color:0x666666 })
  );

  body.position.set(x, height/2, z);
  scene.add(body);
  colliders.push(body);

  // FLOOR (VISUAL ONLY)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(10,0.5,10),
    new THREE.MeshStandardMaterial({ color:0x2b2b2b })
  );

  floor.position.set(x,0.25,z);
  scene.add(floor);

  // ROOF
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(12,0.5,12),
    new THREE.MeshStandardMaterial({ color:0x222222 })
  );

  roof.position.set(x,height,z);
  scene.add(roof);

  return body;
}

// ===============================
// DOWNTOWN CORE
// ===============================
function createDowntown(){

  makeBuilding(-30, -30, "office");
  makeBuilding(30, -30, "apartment");
  makeBuilding(0, -60, "house");
  makeBuilding(-40, 40, "apartment");

  // parking lot
  const lot = new THREE.Mesh(
    new THREE.PlaneGeometry(60,60),
    new THREE.MeshStandardMaterial({ color:0x1f1f1f })
  );

  lot.rotation.x = -Math.PI/2;
  lot.position.set(0,0.01,0);

  scene.add(lot);
}

// ===============================
// SUBURBAN AREA
// ===============================
function createSuburbs(){

  const spots = [
    [-80,-80],
    [-100,-40],
    [-60,60],
    [80,80],
    [100,-60],
    [120,20]
  ];

  for(let i=0;i<spots.length;i++){
    makeBuilding(spots[i][0], spots[i][1], "house");
  }
}

// ===============================
// ALLEY SYSTEM
// ===============================
function createAlleys(){

  for(let i=0;i<6;i++){

    const x = i * 15 - 40;

    const wall1 = makeWall(x,3,10,2,6,20);
    const wall2 = makeWall(x,3,20,2,6,20);
  }
}
function addProp(){

  // TREE
  function tree(x,z,s=1){
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5*s,0.5*s,4*s),
      new THREE.MeshStandardMaterial({ color:0x5a3a1e })
    );

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.5*s),
      new THREE.MeshStandardMaterial({ color:0x2f7d32 })
    );

    trunk.position.set(x,2*s,z);
    leaves.position.set(x,5*s,z);

    scene.add(trunk);
    scene.add(leaves);
  }

  // STREETLIGHT
  function lamp(x,z){
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2,0.2,6),
      new THREE.MeshStandardMaterial({ color:0x333333 })
    );

    pole.position.set(x,3,z);

    const light = new THREE.PointLight(0xfff2cc, 0.6, 20);
    light.position.set(x,6,z);

    scene.add(pole);
    scene.add(light);
  }

  // bushes + scatter
  for(let i=0;i<40;i++){
    tree(
      (Math.random()-0.5)*700,
      (Math.random()-0.5)*700,
      Math.random()*1.2+0.5
    );
  }

  for(let i=0;i<20;i++){
    lamp(
      (Math.random()-0.5)*500,
      (Math.random()-0.5)*500
    );
  }
}
const mapCanvas = document.getElementById("minimapCanvas");
const mapCtx = mapCanvas.getContext("2d");

mapCanvas.width = 160;
mapCanvas.height = 160;

function updateMinimap(){

  mapCtx.clearRect(0,0,160,160);

  // background
  mapCtx.fillStyle = "rgba(0,0,0,0.4)";
  mapCtx.fillRect(0,0,160,160);

  // player dot
  mapCtx.fillStyle = "blue";
  mapCtx.fillRect(80,80,4,4);

  // enemy (if exists)
  if(window.enemy){
    mapCtx.fillStyle = "red";
    mapCtx.fillRect(
      80 + enemy.position.x * 0.2,
      80 + enemy.position.z * 0.2,
      4,4
    );
  }
}

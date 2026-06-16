let scene, camera, renderer;

let yaw = 0;
let pitch = 0;

let velocity = new THREE.Vector3();
let keys = {};

let enemy;
let canJump = true;

document.getElementById("startBtn").onclick = startGame;

function startGame(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("hud").style.display = "block";

  init();
  animate();

  document.body.requestPointerLock();
}

/* ================= WORLD ================= */

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
  document.body.appendChild(renderer.domElement);

  /* LIGHTING */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(100,120,50);
  scene.add(sun);

  /* GROUND */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800,800),
    new THREE.MeshStandardMaterial({ color:0x2f8a3a })
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  /* BORDERS (invisible walls) */
  const wallMat = new THREE.MeshBasicMaterial({ visible:false });

  const borders = [
    [0,0,-400,800,50],
    [0,0,400,800,50],
    [-400,0,0,50,800],
    [400,0,0,50,800]
  ];

  borders.forEach(b=>{
    const w = new THREE.Mesh(
      new THREE.BoxGeometry(b[3],50,b[4]),
      wallMat
    );
    w.position.set(b[0],25,b[2]);
    scene.add(w);
  });

  /* ROADS */
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(600,0.1,40),
    new THREE.MeshStandardMaterial({ color:0x2a2a2a })
  );
  scene.add(road);

  const road2 = new THREE.Mesh(
    new THREE.BoxGeometry(40,0.1,600),
    new THREE.MeshStandardMaterial({ color:0x2a2a2a })
  );
  scene.add(road2);

  /* BUILDINGS (mixed sizes = realism) */
  function building(x,z,w,h,d,c){
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(w,h,d),
      new THREE.MeshStandardMaterial({ color:c })
    );
    b.position.set(x,h/2,z);
    scene.add(b);
  }

  for(let i=0;i<40;i++){
    building(
      (Math.random()-0.5)*500,
      (Math.random()-0.5)*500,
      Math.random()*30+10,
      Math.random()*60+10,
      Math.random()*30+10,
      new THREE.Color(0.3+Math.random()*0.3,0.3,0.3)
    );
  }

  /* TREES (small + big variety) */
  function tree(x,z,s){
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

  for(let i=0;i<60;i++){
    tree(
      (Math.random()-0.5)*700,
      (Math.random()-0.5)*700,
      Math.random()*1.5+0.5
    );
  }

  /* ENEMY */
  enemy = new THREE.Mesh(
    new THREE.BoxGeometry(2,4,2),
    new THREE.MeshStandardMaterial({ color:0xff4444 })
  );
  enemy.position.set(0,2,0);
  scene.add(enemy);

  camera.position.set(0,2.2,10);
}

/* ================= INPUT ================= */

document.addEventListener("keydown", e=>{
  keys[e.key.toLowerCase()] = true;

  // minimap toggle
  if(e.key.toLowerCase()==="m"){
    let m = document.getElementById("minimap");
    m.style.display = m.style.display==="block"?"none":"block";
  }
});

document.addEventListener("keyup", e=>{
  keys[e.key.toLowerCase()] = false;
});

/* ================= MOUSE ================= */

document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement !== document.body) return;

  const sens = 0.0015;

  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;

  pitch = Math.max(-1.5, Math.min(1.5, pitch));
});

/* ================= SHOOT ================= */

document.addEventListener("click", ()=>{
  if(!enemy) return;

  if(camera.position.distanceTo(enemy.position) < 25){
    scene.remove(enemy);
    enemy = null;
    document.getElementById("objective").innerText = "Objective Complete";
  }
});

/* ================= GAME LOOP ================= */

function animate(){
  requestAnimationFrame(animate);

  const baseSpeed = 0.08;
  const sprint = keys["shift"] ? 1.8 : 1;

  const speed = baseSpeed * sprint;

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

  // jump
  if(keys[" "] && canJump){
    velocity.y += 0.2;
    canJump = false;
  }

  // gravity
  velocity.y -= 0.01;

  // ground collision
  if(camera.position.y + velocity.y < 2.2){
    velocity.y = 0;
    canJump = true;
    camera.position.y = 2.2;
  }

  velocity.multiplyScalar(0.85);
  camera.position.add(velocity);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}

window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let scene, camera, renderer;

let yaw = 0;
let pitch = 0;

let velocity = new THREE.Vector3();
const keys = {};

let enemy;

document.getElementById("startBtn").addEventListener("click", startGame);

function startGame(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("hud").style.display = "block";

  init();
  animate();

  document.body.requestPointerLock();
}

function init(){

  // 🌍 Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xa9c9ff, 0.015);
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

  // 💡 Lighting (clean stylized FPS look)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(80,120,40);
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0xa9c9ff, 0x2b5a2b, 0.8);
  scene.add(hemi);

  // 🌳 Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600,600),
    new THREE.MeshStandardMaterial({
      color:0x2f8a3a,
      roughness:1
    })
  );

  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  // 🛣️ Roads (Newtown-style layout)
  const roadMat = new THREE.MeshStandardMaterial({ color:0x2a2a2a });

  const road1 = new THREE.Mesh(
    new THREE.BoxGeometry(400,0.2,25),
    roadMat
  );
  scene.add(road1);

  const road2 = new THREE.Mesh(
    new THREE.BoxGeometry(25,0.2,400),
    roadMat
  );
  scene.add(road2);

  // 🏙️ Buildings (designed layout, not random)
  function building(x,z,w,h,d,color){
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(w,h,d),
      new THREE.MeshStandardMaterial({
        color,
        roughness:1
      })
    );

    b.position.set(x,h/2,z);
    scene.add(b);
  }

  building(-80,-80,20,18,20,0x666666);
  building(-80,80,25,22,25,0x5c5c5c);
  building(80,-80,22,20,22,0x777777);
  building(80,80,18,16,18,0x4f4f4f);
  building(0,120,35,25,25,0x5a5a5a);
  building(0,-120,35,25,25,0x5a5a5a);

  // 🌲 Trees (map borders / atmosphere)
  function tree(x,z){
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5,0.5,4),
      new THREE.MeshStandardMaterial({ color:0x5a3a1e })
    );

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.5),
      new THREE.MeshStandardMaterial({ color:0x2f7d32 })
    );

    trunk.position.set(x,2,z);
    leaves.position.set(x,5,z);

    scene.add(trunk);
    scene.add(leaves);
  }

  for(let i=0;i<40;i++){
    tree(
      (Math.random()-0.5)*500,
      (Math.random()-0.5)*500
    );
  }

  // 🎯 Enemy (center objective)
  enemy = new THREE.Mesh(
    new THREE.BoxGeometry(2,4,2),
    new THREE.MeshStandardMaterial({
      color:0xff4444,
      emissive:0x220000
    })
  );

  enemy.position.set(0,2,0);
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

/* GAME LOOP */
function animate(){
  requestAnimationFrame(animate);

  const speed = 0.08;
  const friction = 0.85;

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
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

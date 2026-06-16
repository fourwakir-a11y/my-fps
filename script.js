let scene;
let camera;
let renderer;

let enemy;

let yaw = 0;
let pitch = 0;

const keys = {};

document.getElementById("startBtn").onclick = startGame;

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
        window.innerWidth/window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({
        antialias:true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        window.devicePixelRatio
    );

    document.body.appendChild(
        renderer.domElement
    );

    const ambient =
        new THREE.AmbientLight(
            0xffffff,
            1
        );

    scene.add(ambient);

    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            2
        );

    sun.position.set(
        20,
        50,
        20
    );

    scene.add(sun);

    const ground =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                500,
                500
            ),
            new THREE.MeshStandardMaterial({
                color:0x3a5f3a
            })
        );

    ground.rotation.x =
        -Math.PI / 2;

    scene.add(ground);

    for(let i=0;i<100;i++){

        const box =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    5,
                    5,
                    5
                ),
                new THREE.MeshStandardMaterial({
                    color:0x777777
                })
            );

        box.position.set(
            (Math.random()-0.5)*200,
            2.5,
            (Math.random()-0.5)*200
        );

        scene.add(box);
    }

    enemy =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2,
                4,
                2
            ),
            new THREE.MeshStandardMaterial({
                color:0xff2222
            })
        );

    enemy.position.set(
        0,
        2,
        -30
    );

    scene.add(enemy);

    camera.position.set(
        0,
        2,
        10
    );
}

document.addEventListener(
    "keydown",
    e => {
        keys[e.key.toLowerCase()] = true;
    }
);

document.addEventListener(
    "keyup",
    e => {
        keys[e.key.toLowerCase()] = false;
    }
);

document.addEventListener(
    "mousemove",
    e => {

        if(
            document.pointerLockElement !== document.body
        ) return;

        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;

        pitch = Math.max(
            -1.5,
            Math.min(
                1.5,
                pitch
            )
        );
    }
);

document.addEventListener(
    "click",
    shoot
);

function shoot(){

    if(!enemy) return;

    const distance =
        camera.position.distanceTo(
            enemy.position
        );

    if(distance < 25){

        scene.remove(enemy);

        enemy = null;

        document.getElementById(
            "objective"
        ).innerText =
        "Objective Complete";
    }
}

function animate(){

    requestAnimationFrame(
        animate
    );

    const speed = 0.15;

    const forward =
        new THREE.Vector3(
            Math.sin(yaw),
            0,
            -Math.cos(yaw)
        );

    const right =
        new THREE.Vector3(
            Math.cos(yaw),
            0,
            Math.sin(yaw)
        );

    if(keys["w"])
        camera.position.add(
            forward.clone().multiplyScalar(speed)
        );

    if(keys["s"])
        camera.position.add(
            forward.clone().multiplyScalar(-speed)
        );

    if(keys["a"])
        camera.position.add(
            right.clone().multiplyScalar(-speed)
        );

    if(keys["d"])
        camera.position.add(
            right.clone().multiplyScalar(speed)
        );

    camera.rotation.order =
        "YXZ";

    camera.rotation.y =
        yaw;

    camera.rotation.x =
        pitch;

    renderer.render(
        scene,
        camera
    );
}

window.addEventListener(
    "resize",
    () => {

        if(!camera) return;

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);

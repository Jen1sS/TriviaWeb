import * as THREE from 'three';

let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render

let scene = null;    // la scena radice
let camera = null;   // la camera da cui renderizzare la scena
let clock = null;    // Oggetto per la gestione del timinig della scena

let box = null;
let box2 = null;

let dl = null;

/*
 * Inizializza il motore
 */
function initScene(){
    if (renderer != null) return;

    document.body.innerHTML = "";

    let width = window.innerWidth;
    let height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 500);
    camera.position.set(0, 1.80, -5);
    camera.lookAt(0, 1.80, 10);

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7faa22);

    const g = new THREE.BoxGeometry(1, 1, 1);
    const m = new THREE.MeshPhysicalMaterial({color: 0xFF00FF, metalness: 0, roughness: 0.5 });
    box = new THREE.Mesh(g, m);
    box.position.set(0, 1.80, 5);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    box2 = new THREE.Mesh(g, m);
    box2.position.set(4, 1.8, 5);
    box2.castShadow = true;
    box2.receiveShadow = true;
    scene.add(box2);

    dl = new THREE.PointLight(0xFFFFFF, 100);
    dl.position.set(0, 3, 4);
    //dl.castShadow = true;
    scene.add(dl);

    renderer.setAnimationLoop(animate);
}

function animate(){
    let dt = clock.getDelta();

    box.rotateY(2*dt);
    box2.rotateX(2*dt);

    //dl.position.z += 0.5 * dt;

    renderer.clear();
    renderer.render(scene, camera);
}

window.onload = initScene;
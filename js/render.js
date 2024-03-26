import * as THREE from 'three';

let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render

let scene = null;    // la scena radice
let camera = null;   // la camera da cui renderizzare la scena
let clock = null;    // Oggetto per la gestione del timinig della scena

let boxes=[];

let dl = null;

/*
 * Inizializza il motore
 */
function initScene(){
    if (renderer != null) return;

    onloadSetup()

    let width = window.innerWidth;
    let height = window.innerHeight*0.4;

    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    document.getElementById("map").appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 500);
    camera.position.set(0, 1.80, -5);
    camera.lookAt(0, 1.80, 10);
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb5b6b6);

    const g = new THREE.PlaneGeometry(0.5, 0.5, 1);
    const m = [
        new THREE.MeshPhysicalMaterial({color: 0xC500FF}),
        new THREE.MeshPhysicalMaterial({color: 0xFF8700}),
        new THREE.MeshPhysicalMaterial({color: 0x0087FF}),
        new THREE.MeshPhysicalMaterial({color: 0x00FF08}),
        new THREE.MeshPhysicalMaterial({color: 0xFF008F}),
        new THREE.MeshPhysicalMaterial({color: 0xF3FF00}),
        new THREE.MeshPhysicalMaterial({color: 0xFFFFFF}),
        new THREE.MeshPhysicalMaterial({color: 0xFFFFFF})
    ];

    let n= m.length;
    let r = 2;
    let p = [];

    for (let i = 0; i < n; i++) p.push([(Math.sin(i*2*Math.PI/n)*r)+(1.8*height/459),Math.cos(i*2*Math.PI/n)*r,i*Math.PI/n*2]);

    for (let i = 0; i < n; i++) {
        boxes.push(new THREE.Mesh(g,m[i]))

        boxes[i].castShadow = true;
        boxes[i].receiveShadow = true;
        scene.add(boxes[i]);
        boxes[i].position.y=p[i][0];
        boxes[i].position.x=p[i][1];
        boxes[i].rotation.z=p[i][2];
        boxes[i].rotation.y+=3.14;

    }

    dl = new THREE.PointLight(0xFFFFFF, 100);
    dl.position.set(0, 0, -1);
    //dl.castShadow = true;
    scene.add(dl);

    renderer.setAnimationLoop(animate);
}

function animate(){
    let dt = clock.getDelta();


    renderer.clear();
    renderer.render(scene, camera);
}

window.onload = initScene;
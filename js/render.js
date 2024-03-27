import * as THREE from 'three';
import {MeshPhysicalMaterial} from "three";

let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render

let scene = null;    // la scena radice
let camera = null;   // la camera da cui renderizzare la scena
let clock = null;    // Oggetto per la gestione del timinig della scena

let boxes = [];

let dl = null;


let r;
let a;
let p=0;
let offy;
/*
 * Inizializza il motore
 */
function initScene() {
    if (renderer != null) return;

    onLoadSetup();

    let width = window.innerWidth;
    let height = window.innerHeight * 0.4;

    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    document.getElementById("map").appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(0, 1.80, -5);
    camera.lookAt(0, 1.80, 10);
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb5b6b6);

    const c = [0xC500FF, 0xFF8700, 0x0087FF, 0x00FF08, 0xFF008F, 0xF3FF00]
    const g = new THREE.PlaneGeometry(0.5, 0.5, 1);
    const m = [];

    for (let i = 0; i < c.length; i++) m.push(new MeshPhysicalMaterial({color: c[i], side: THREE.DoubleSide}))

    let n = m.length;
    r = 2;
    offy = 1.70 * height / 459;
    let p = [];

    for (let i = 0; i < n; i++) {
        a = i * (2 * Math.PI / n);
        p.push([r * Math.cos(a) + offy, r * Math.sin(a), a]);
    }

    for (let i = 0; i < n; i++) {
        boxes.push(new THREE.Mesh(g, m[i]))

        boxes[i].castShadow = true;
        boxes[i].receiveShadow = true;
        boxes[i].position.y = p[i][0];
        boxes[i].position.x = p[i][1];
        boxes[i].rotation.z = p[i][2];
        boxes[i].rotation.y += 3.14;
        scene.add(boxes[i]);


    }

    dl = new THREE.PointLight(0xFFFFFF, 30);
    dl.position.set(0, offy, -1);
    //dl.castShadow = true;
    scene.add(dl);

    renderer.setAnimationLoop(animate);
}

function animate() {
    let dt = clock.getDelta();

    if (oldSpeed!==speed) oldSpeed+=2*dt;

    p+=oldSpeed*dt

    for (let i = 0; i < boxes.length; i++) {
        a = i * (2 * Math.PI / boxes.length) + p;
        boxes[i].rotation.y += 3 * dt;
        boxes[i].rotation.x += 3 * dt;
        boxes[i].position.y = r * Math.cos(a) + offy;
        boxes[i].position.x = r * Math.sin(a);
    }

    renderer.clear();
    renderer.render(scene, camera);
}

window.onload = initScene;
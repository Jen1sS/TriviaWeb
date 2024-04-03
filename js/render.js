import * as THREE from 'three';
import {MeshBasicMaterial, MeshPhysicalMaterial} from "three";

let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render

let scene = null;    // la scena radice
let camera = null;   // la camera da cui renderizzare la scena
let clock = null;    // Oggetto per la gestione del timinig della scena

let p=[];
let boxes = [];
let player;

let dl = null;

let onTopOf=0;

let r;
/*
 * Inizializza il motore
 */
function initScene() {
    if (renderer != null) return;

    onLoadSetup();

    let width = window.innerWidth;
    let height = window.innerHeight * 0.8;

    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    document.getElementById("map").appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    // [asse horizontal, asse profundity, asse altercate]
    camera.position.set(3.5, 8, 3.5);
    camera.lookAt(0, 0, 0);
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb5b6b6);

    const c = [0xd900ff,0x1e00ff,0x00f2ff,0x00ff3c,0xfbff00,0xff9100,0xff0000,0x1e00ff,0x00f2ff,0x00ff3c,0xd900ff,0x1e00ff,0x00f2ff,0x00ff3c,0xfbff00,0xff9100,0xff0000,0x1e00ff,0x00f2ff,0x00ff3c,0xd900ff,0x1e00ff,0x00f2ff,0x00ff3c,0xfbff00,0xff9100,0xff0000,0x1e00ff,0x00f2ff,0x00ff3c,0xd900ff,0x1e00ff,0x00f2ff,0x00ff3c,0xfbff00]
    const g = new THREE.PlaneGeometry(0.5, 0.5, 1);
    const m = [];

    for (let i = 0; i < c.length; i++) m.push(new MeshPhysicalMaterial({color: c[i], side: THREE.DoubleSide, metalness:1}))

    let n = m.length;
    r = 2;
    // [asse horizontal, asse profundity, asse altercate]

    for (let i = 0; i < 9; i++) {
        p.push([(i/2)-(c.length/18),2,2.5]);
    }

    for (let i = 9; i < 18; i++) {
        p.push([p[8][0],2,(p[8][2])-((i-8)/2)]);
    }

    for (let i = 18; i < 26; i++) {
        p.push([(p[17][0])-((i-17)/2),2,p[17][2]]);
    }

    for (let i = 26; i < 36; i++) {
        p.push([p[0][0],2,(p[0][2])-((i-25)/2)]);
    }

    for (let i = 0; i < n; i++) {
        boxes.push(new THREE.Mesh(g, m[i]))

        boxes[i].castShadow = true;
        boxes[i].receiveShadow = true;
        boxes[i].position.y = p[i][1];
        boxes[i].position.x = p[i][0];
        boxes[i].position.z = p[i][2];
        boxes[i].rotation.x = Math.PI / 2;
        scene.add(boxes[i]);


    }

    const geometry = new THREE.CylinderGeometry( 0.25,0.25,0.5,32);
    const material = new THREE.MeshPhysicalMaterial( {color:'blue',metalness:0.5});
    player = new THREE.Mesh(geometry,material);
    player.position.set(p[onTopOf][0],p[onTopOf][1]+0.25,p[onTopOf][2])
    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);

    dl = new THREE.PointLight(0xFFFFFF, 30);
    dl.position.set(0, 3, 0);
    //dl.castShadow = true;
    scene.add(dl);

    renderer.setAnimationLoop(animate);
    setTimeout(go,100)
}

function go(){
    if (onTopOf===p.length-2) onTopOf=0;
    else onTopOf++;
    player.position.set(p[onTopOf][0],p[onTopOf][1]+0.25,p[onTopOf][2])
    setTimeout(go,300)
}

function animate() {

    renderer.clear();
    renderer.render(scene, camera);
}

window.onload = initScene;
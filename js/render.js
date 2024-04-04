import * as THREE from 'three';
import {MeshPhysicalMaterial, Vector3} from "three";


let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render

let scene = null;    // la scena radice
let camera = null;   // la camera da cui renderizzare la scena
let clock = null;    // Oggetto per la gestione del timinig della scena

let p = [];
let boxes = [];
let table;

let dl = null;


let onTopOf = 0;



let switc = false;

//PLAYER
let player;

// LERPING
let travelTime;
let beg;
let pos;
let end;

let r;

let going=false;

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

    //caselle
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb5b6b6);

    const c = [0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xff9100, 0xff0000, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xff9100, 0xff0000, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xff9100, 0xff0000, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c]
    const g = new THREE.PlaneGeometry(0.5, 0.5, 1);
    const m = [];

    for (let i = 0; i < c.length; i++) m.push(new MeshPhysicalMaterial({
        color: c[i],
        side: THREE.DoubleSide,
        metalness: 1
    }))

    let n = m.length;
    r = 2;
    // [asse horizontal, asse profundity, asse altercate]

    for (let i = 0; i < 9; i++) {
        p.push([(i / 2) - (c.length / 18), 2, 2.5]);
    }

    for (let i = 9; i < 18; i++) {
        p.push([p[8][0], 2, (p[8][2]) - ((i - 8) / 2)]);
    }

    for (let i = 18; i < 26; i++) {
        p.push([(p[17][0]) - ((i - 17) / 2), 2, p[17][2]]);
    }

    for (let i = 26; i < 36; i++) {
        p.push([p[25][0], 2, (p[25][2]) + ((i - 25) / 2)]);
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

    //player
    const g2 = new THREE.CylinderGeometry(0.125, 0.125, 0.25, 32);
    const m2 = new THREE.MeshPhysicalMaterial({color: 'white', metalness: 0.5});
    player = new THREE.Mesh(g2, m2);
    player.position.set(p[onTopOf][0], p[onTopOf][1] + 0.25, p[onTopOf][2])
    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);
    travelTime = 1.0;


    //tabellone
    const g3 = new THREE.BoxGeometry(5.2, 5.7, 0.5);
    const m3 = new THREE.MeshPhysicalMaterial({color: 0xAAAAAA});
    table = new THREE.Mesh(g3, m3);
    table.castShadow = true;
    table.receiveShadow = true;
    table.rotateX(Math.PI / 2);
    table.position.x=0.03
    table.position.z=0.15
    table.position.y = 1.49
    scene.add(table);

    dl = new THREE.PointLight(0xFFFFFF, 30);
    dl.position.set(0, 3, 0);
    //dl.castShadow = true;
    scene.add(dl);

    renderer.setAnimationLoop(animate);
    setTimeout(go, 100)
}

function go() {
    if (positions!==0) {
        if (onTopOf === p.length - 2) onTopOf = 0;
        else onTopOf++;
        player.position.set(p[onTopOf][0], p[onTopOf][1] + 0.25, p[onTopOf][2]);

        travelTime = 1;
        pos = (onTopOf + 1) % (p.length - 2);
        end = new Vector3(p[pos][0], p[pos][1] + 0.25, p[pos][2]);
        start()
        positions--;
        asked = false;

    } else curState="QUESTION";
}

function start() {
    player.position.lerp(end, 1 - travelTime);
    travelTime -= 0.1;

    if (travelTime >= 0) setTimeout(start, 10);
    else setTimeout(go,1000);
}

function animate() {
    renderer.clear();
    renderer.render(scene, camera);

    if (lives!==0) {
        switch (curState) {
            case "ROLLING":
                roll()
                break;
            case "QUESTION":
                ask()
            case "MOVING":
                if (oldPos === positions) go()
                break;
        }
    } else {
        document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,0,0,1) 100%)"
        document.getElementById("lives").style.color = "red";
    }
}

addEventListener("keypress", (event) => {
    if (event.key === "s") switc = !switc;

    if (!switc) {
        camera.position.set(3.5, 8, 3.5);
        camera.lookAt(0, 0, 0);
    } else {
        camera.position.set(0, 10, 0);
        camera.lookAt(0, 0, 0);
    }
});


window.onload = initScene;

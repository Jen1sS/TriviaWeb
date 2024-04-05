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
let throwSpace;
let dl = null;
let dl2 = null;

let switc = false;

//PLAYER
let player;

// LERPING
let travelTime;
let backTime=0;
let beg;
let pos;
let end;

let reset;
const loader = new THREE.TextureLoader();
let endLook;
let posLook;
let diceLook;
const oriLook=new Vector3(0,0,0);

let r;



/*
 * Inizializza il motore
 */
function initScene() {
    if (renderer != null) return;


    let width = window.innerWidth;
    let height = window.innerHeight * 0.9;

    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    document.getElementById("map").appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 500);
    // [asse horizontal, asse profundity, asse altercate]
    camera.position.set(3.5, 7.5, 3.5);
    camera.lookAt(0, 0, 0);
    clock = new THREE.Clock();

    //caselle
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb5b6b6);

    c = [0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00,0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00,0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00,0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00,0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00,0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c]
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

        boxes[i].castShadow = false;
        boxes[i].receiveShadow = true;
        boxes[i].position.y = p[i][1];
        boxes[i].position.x = p[i][0];
        boxes[i].position.z = p[i][2];
        boxes[i].rotation.x = Math.PI / 2;
        scene.add(boxes[i]);
    }

    //player
    const g2 = new THREE.CylinderGeometry(0.125, 0.125, 0.25, 32);
    const m2 = new THREE.MeshPhysicalMaterial({color: 0xFF00E8, metalness: 0.5});
    player = new THREE.Mesh(g2, m2);
    player.position.set(p[onTopOf][0], p[onTopOf][1] + 0.25, p[onTopOf][2])
    player.castShadow = true;
    player.receiveShadow = true;
    travelTime = 1.0;


    //Tabellone
    const g3 = new THREE.BoxGeometry(5.2, 5.5, 0.5);
    const m3 = new THREE.MeshPhysicalMaterial({color: 0x7FD4FF});
    table = new THREE.Mesh(g3, m3);
    table.castShadow = true;
    table.receiveShadow = true;
    table.rotateX(Math.PI / 2);
    table.position.x = 0.125
    table.position.z = 0.2
    table.position.y = 1.74

    //Posto dove si lanciano di dadi
    const g4 = new THREE.PlaneGeometry( 10000, 10000 );
    const m4 = new THREE.MeshPhysicalMaterial( {color: 0x33ADFF, side: THREE.DoubleSide} );
    throwSpace = new THREE.Mesh( g4, m4 );
    throwSpace.receiveShadow = true;
    throwSpace.position.y=1.2
    throwSpace.rotateX(Math.PI/2)

    //Dice
    const g5 = new THREE.BoxGeometry(1,1,1)
    const diceTexture = [
        new THREE.MeshPhysicalMaterial({map: loadColorTexture('../img/dice/1.png')}),
        new THREE.MeshPhysicalMaterial({map: loadColorTexture('../img/dice/2.png')}),
        new THREE.MeshPhysicalMaterial({map: loadColorTexture('../img/dice/3.png')}),
        new THREE.MeshPhysicalMaterial({map: loadColorTexture('../img/dice/4.png')}),
        new THREE.MeshPhysicalMaterial({map: loadColorTexture('../img/dice/5.png')}),
        new THREE.MeshPhysicalMaterial({map: loadColorTexture('../img/dice/6.png')}),
    ];
    dice=new THREE.Mesh(g5,diceTexture);
    dice.position.set(12,4,6);

    dice.castShadow=true;
    dice.receiveShadow=true;

    diceLook=new Vector3(dice.position.x,dice.position.y,dice.position.z);



    dl = new THREE.PointLight(0xFFFFFF, 80);
    dl.position.set(0, 10, 0);
    dl.castShadow = true;

    scene.add(dl);
    scene.add(throwSpace);
    scene.add(table);
    scene.add(player);
    scene.add(dice)

    posLook = new Vector3(0,0,0);



    renderer.setAnimationLoop(animate);
    setTimeout(go, 100)
}


function loadColorTexture( path ) {
    const texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function go() {
    if (reset && backTime<=1 && positions===0){
        backTime+=0.02;
        resetCamera(backTime);
        setTimeout(go,10);
        posLook=oriLook

    } else {
        reset=false;
        if (positions !== 0) {
            player.position.set(p[onTopOf][0], p[onTopOf][1] + 0.25, p[onTopOf][2]);

            travelTime = 2;
            pos = (onTopOf + 1) % (p.length - 2);
            end = new Vector3(p[pos][0], p[pos][1] + 0.25, p[pos][2]);
            start()
            positions--;
            asked = false;

            if (onTopOf === p.length - 2) onTopOf = 0;
            else onTopOf++;

        } else if (curState !== "WAITING") {
            curState = "QUESTION"
        }
    }
}

function start() {
    backTime=0;
    reset=true
    if (travelTime<=1) {
        player.position.lerp(end, 1 - travelTime);
        travelTime -= 0.1;
        posLook=player.position;
        camera.lookAt(posLook)
    } else {
        endLook=player.position;
        lerpCamera(posLook,endLook,2-travelTime);
        travelTime-=0.02;
    }

    if (travelTime >= 0) setTimeout(start, 5);
    else setTimeout(go, 500);
}

function resetCamera(alpha){
    lerpCamera(player.position,oriLook,alpha)
}
function lerpCamera(v1,v2,alpha){
    let currentLookAt = new THREE.Vector3();
    currentLookAt.lerpVectors(v1, v2, alpha);
    camera.lookAt(currentLookAt);
}

function animate() {

    renderer.clear();
    renderer.render(scene, camera);


    if (lives !== 0) {
            switch (curState) {
            case "WAITING":
                break;
            case "ROLLING":
                if (timeA>=0){
                    watchDice(timeA);
                    timeA-=0.003;
                }
                //else roll();
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

function watchDice(alpha){
    console.log(oriLook.x+" "+oriLook.y+" "+oriLook.z)
    console.log(diceLook.x+" "+diceLook.y+" "+diceLook.z)
    lerpCamera(oriLook,diceLook,1-alpha)
    camera.position.lerp(new Vector3(12,8,6),1-alpha)
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

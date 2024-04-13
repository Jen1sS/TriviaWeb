import * as THREE from 'three';
import {MeshPhysicalMaterial, Vector3} from 'three';
import {AnimationManager, ModelImporter} from './ModelImporter.js';

//Necessari per ThreeJs
let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render
let camera = null;
let scene = null;    // la scena radice
let clock = null;    // Oggetto per la gestione del timinig della scena

let p = [];
let table;
let plane;

//SLICES
let slice = {};

//CASEKKE
let caselle = [];

//LUCE
let dl = null;
let dl2 = null;

//PLAYER
let player;
let aniP;

//Visuali della camera necessarie per lerping
let endLook;
let posLook;
const diceLook = new Vector3(12, 4, 6);
const oriLook = new Vector3(0, 0, 0);

let did = false //WIN
let loaded=false;

// LERPING
let travelTime;
let backTime = 0;
let pos;
let end;

//hearts
let hearts=[];
let heartLight=[];

let reset;
const loader = new THREE.TextureLoader();


//MODELS
let mi = new ModelImporter();
//ADD
let added = false;

let playerPath="../models/avatar.glb";
let dicePath="../models/dice.glb";

let won;

/*
 * Inizializza il motore e il gioco
 */
function initScene() {
    if (renderer != null) return;


    let width = window.innerWidth;
    let height = window.innerHeight * 0.9;

    //CREAZIONE RENDERER
    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    document.getElementById("map").appendChild(renderer.domElement);

    //SETUP CAMERA
    camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 500);
    camera.position.set(3.5, 7.5, 3.5);
    camera.lookAt(0, 0, 0);
    clock = new THREE.Clock();

    //CREAZIONE SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb5b6b6);

    //CREAZIONE CASELLE (ogni elemento in c corrisponde ad un colore)
    c = [0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c]
    const g = new THREE.PlaneGeometry(0.5, 0.5, 1);
    const m = [];

    //Assegnamento materiale con colore per casella
    for (let i = 0; i < c.length; i++) m.push(new MeshPhysicalMaterial({
        color: c[i],
        side: THREE.DoubleSide,
        metalness: 1
    }))

    //Creazione coordinate caselle
    for (let i = 0; i < c.length; i++) {
        switch (Math.floor(i / 9)) {
            case 0:
                p.push([(i / 2) - (c.length / 18), 2, 2.5]);
                break;
            case 1:
                p.push([p[8][0], 2, (p[8][2]) - ((i - 8) / 2)]);
                break;
            case 2:
                if (i === 26) p.push([p[25][0], 2, (p[25][2]) + ((i - 25) / 2)]);
                else p.push([(p[17][0]) - ((i - 17) / 2), 2, p[17][2]]);
                break;
            case 3:
                p.push([p[25][0], 2, (p[25][2]) + ((i - 25) / 2)]);
                break;
        }
    }


    //Creazione modello e posizionamento
    for (let i = 0; i < m.length; i++) {
        caselle.push(new THREE.Mesh(g, m[i]))
        caselle[i].castShadow = false;
        caselle[i].receiveShadow = true;
        caselle[i].position.y = p[i][1];
        caselle[i].position.x = p[i][0];
        caselle[i].position.z = p[i][2];
        caselle[i].rotation.x = Math.PI / 2;
        scene.add(caselle[i]);
    }

    //TODO: MODELLO NUOVO NON LO VEDO NON SO PERCHÈ
    mi.import(playerPath)


    //CREAZIONE TABELLONE
    const g3 = new THREE.BoxGeometry(5.2, 5.5, 0.5);
    const m3 = new THREE.MeshPhysicalMaterial({color: 0x7FD4FF});
    table = new THREE.Mesh(g3, m3);
    table.castShadow = true;
    table.receiveShadow = true;
    table.rotateX(Math.PI / 2);
    table.position.x = 0.125;
    table.position.z = 0.2;
    table.position.y = 1.74;

    //CREAZIONE PLANE
    const g4 = new THREE.PlaneGeometry(10000, 10000);
    const m4 = new THREE.MeshPhysicalMaterial({color: 0x33ADFF, side: THREE.DoubleSide});
    plane = new THREE.Mesh(g4, m4);
    plane.receiveShadow = true;
    plane.position.y = 1.2
    plane.rotateX(Math.PI / 2)

    //CREAZIONE DADO - NEW
    mi.import(dicePath);

    //CREAZIONE SLICE (1 per categoria)
    const angle = 2 * Math.PI / 5;
    const radius = 0.55;
    const cx = 0.125;
    const cz = 0.2;

    for (let i = 0; i < 5; i++) {
        const g6 = new THREE.ConeGeometry(0.5, 1, 4);
        const m6 = new THREE.MeshPhysicalMaterial({color: c[i]})
        slice[c[i]] = new THREE.Mesh(g6, m6);

        //POSIZIONAMENTO IN UN CERCHIO
        slice[c[i]].rotation.z = i * angle + Math.PI / 2;
        slice[c[i]].rotation.x = Math.PI / 2;
        slice[c[i]].position.set(cx + radius * Math.cos(i * angle), 1.49, cz + radius * Math.sin(i * angle))
        slice[c[i]].castShadow = true

        scene.add(slice[c[i]])
    }


    //CREAZIONE CUORI
    for (let i = 0; i < lives; i++) {
        mi.importWithName("../models/heart.glb","heart"+i);
    }
    //CREAZIONE LUCE DEL TABELLONE
    dl = new THREE.PointLight(0xFFFFFF, 35);
    dl.position.set(0, 5, 0);
    dl.castShadow = true;

    //CREAZIONE LUCE DEL DADO
    dl2 = new THREE.PointLight(0xFFFFFF, 35);
    dl2.position.set(12, 8, 6);
    dl2.castShadow = true;


    //AGGIUNTA ALLA SCENA (altri messi perche sono in un array)
    scene.add(dl);
    scene.add(dl2);
    scene.add(plane);
    scene.add(table);

    //Inizializzazione visuale per lerp
    posLook = new Vector3(0, 0, 0);


    document.getElementById("play").style.display = "none"
    renderer.setAnimationLoop(animate);
}

//LOADER
function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}


//GESTIONE MOVIMENTO
function go() {
    if (reset && backTime <= 1 && positions === 0) curState = "TRTCENTRE";
    else {
        reset = false;
        if (positions !== 0) {
            player.position.set(p[position][0], p[position][1] , p[position][2]);

            travelTime = 2;
            if (position+1===p.length) pos=0;
            else pos = position + 1;
            end = new Vector3(p[pos][0], p[pos][1] + 0.25, p[pos][2]);
            start()
            positions--;
            asked = false;

            position = pos;

        } else if (curState !== "WAITING") {
            curState = "QUESTION"
        }
    }
}


//LERPING MOVIMENTO
let animationStart=false;

function start() {
    backTime = 0;
    reset = true
    if (travelTime <= 1) {

        if (!animationStart) {
            aniP.transitionTo("walk", 0.2);
            animationStart=true;
        }

        player.position.lerp(end, 1 - travelTime);
        travelTime -= 0.003;
        posLook = player.position;
        camera.lookAt(posLook)
    } else {
        endLook = player.position;
        lerpCamera(posLook, endLook, 2 - travelTime);
        camera.position.lerp(new Vector3(3.5, 7.5, 3.5), 2 - travelTime)
        travelTime -= 0.005;
    }

    if (travelTime >= 0.01) setTimeout(start, 5);
    else{
        setTimeout(go, 100);
        animationStart=false;
        console.log("Start")
        aniP.transitionTo("idle", 0.2);
    }
}


//LERPING VISUALE
function resetCamera(alpha) {
    lerpCamera(player.position, oriLook, alpha)
}

function lerpCamera(v1, v2, alpha) {
    let currentLookAt = new THREE.Vector3();
    currentLookAt.lerpVectors(v1, v2, alpha);
    camera.lookAt(currentLookAt);
}

function watchDice(alpha) {
    lerpCamera(oriLook, diceLook, 1 - alpha)
    camera.position.lerp(new Vector3(12, 8, 6), 1 - alpha)
}

function animate() {
    dt = clock.getDelta();


    renderer.clear();
    renderer.render(scene, camera);

    if (aniP!==undefined) aniP.update(dt);

    updateDirection();


    if (mi.everythingLoaded()) {
        if (lives !== 0) {
            //AUTOMA A STATI FINITI
            switch (curState) {
                case "WAITING":
                    document.getElementById("play").style.display = "block"
                    added = true;

                    dice = mi.getModel(dicePath);
                    dice.position.set(12, 5, 6);
                    dice.scale.x = 0.02;
                    dice.scale.y = 0.02;
                    dice.scale.z = 0.02;

                    player = mi.getModel(playerPath);
                    player.position.set(p[position][0], p[position][1] , p[position][2]); //prendo posizione casella 0


                    if (!loaded){
                        loaded=true;

                        player.rotation.y+=Math.PI/2;

                        aniP = new AnimationManager(player);
                        aniP.import("../animations/idle.glb","idle");
                        aniP.import("../animations/walk.glb","walk");
                        aniP.import("../animations/win.glb","win");
                        aniP.import("../animations/lost.glb","lost");
                    } else if (aniP.everythingLoaded() && !aniP.isPlaying()){
                        aniP.playAnimation("idle");
                    }

                    for (let i = 0; i < lives; i++) {
                        hearts.push(mi.getModel("heart"+i));
                        hearts[i].position.set(p[8+i][0]+1.25, 1.145 , p[8+i][2]-i*0.7);
                        hearts[i].rotation.set(Math.PI/2,0,Math.PI/2);
                        hearts[i].scale.x=0.15;
                        hearts[i].scale.y=0.15;
                        hearts[i].scale.z=0.15;
                        hearts[i].receiveShadow=true;
                        hearts[i].castShadow=true;

                        heartLight.push(new THREE.PointLight(0xFF0000,3));
                        heartLight[i].position.set(p[8+i][0]+1.25, 2 , p[8+i][2]-i*0.7);

                        scene.add(hearts[i]);
                        scene.add(heartLight[i]);
                    }
                    scene.add(dice)
                    scene.add(player);
                    break;
                case "REVEAL":

                    aniP.transitionTo("win",0.2);
                    won=true;

                    revealGuessed();
                    break;
                case "TRTDICE": //TRT significa "Transition to"

                    if (!won){
                        aniP.transitionTo("lost",0.2);
                        if (hearts[lives-1].position.y>=0.5) {
                            hearts[lives].position.y -= 0.5 * dt;
                            heartLight[lives].position.y -= 0.8 * dt;
                        }
                    }

                    setTimeout(()=>{
                        posLook = diceLook;
                        if (timeA >= 0) {
                            watchDice(timeA);
                            timeA -= 0.003;
                        } else curState = "ROLLING";
                    },2000)
                    break;
                case "ROLLING":
                    roll();
                    break;
                case "QUESTION":
                    ask()
                case "MOVING":
                    if (oldPos === positions) go()
                    break;
                case "TRTCENTRE":
                    if (backTime <= 1) {
                        backTime += 0.02;
                        resetCamera(backTime);
                        posLook = oriLook;
                    } else curState = "QUESTION";
                    break;
                case "WIN":
                    if (dl.position.y > 3) {
                        dl.position.y -= 0.005;
                        dl2.position.y -= 0.005;
                    } else if (!did) {
                        document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,201,0,1) 100%)";
                        document.getElementsByTagName("header").item(0).innerHTML = "<img src=\"img/win.png\" alt=\"title\">";

                        for (let i = 0; i < lives; i++) document.getElementById("heartContainter").innerHTML = "";
                        for (let i = 0; i < lives; i++) document.getElementById("heartContainter").innerHTML += "<img src=\"img/winHeart.png\" class=\"heart\">\n";

                        document.getElementById("playerStats").style.background = "rgb(255,243,124)";
                        document.getElementById("playerStats").style.background = "linear-gradient(145deg, rgba(255,243,124,1) 0%, rgba(255,192,0,1) 100%)";


                        did = !did;
                    }
                    break;
            }
        } else {
            document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,0,0,1) 100%)"
            for (let i = 0; i < 5; i++) slice[c[i]].position.y -= 0.005;
            if (dl.position.y < 50) {
                dl.position.y += 0.05;
                dl2.position.y += 0.05;
            } else {
                setTimeout(() => {
                    document.getElementById("retry").style.display = "block";
                }, 1000)
            }
        }
    }
}

function updateDirection(){
    if (loaded) {
        switch (Math.floor(position / 9)) {
            case 0:
                player.rotation.y = Math.PI/2;
                break;
            case 1:
                player.rotation.y = Math.PI;
                break;
            case 2:
                player.rotation.y = Math.PI*1.5;
                break;
            case 3:
                player.rotation.y = Math.PI*2;
                break;
        }
    }
}

//REVEAL DEL SLICE DELLA MATERIA FATTA
function revealGuessed() {
    if (slice[color].position.y >= 2) {
        curState = "TRTDICE";

        //CHECK VITTORIA
        let r = true;
        for (let i = 0; i < 5; i++) {
            r = r && completed[c[i]];
        }
        if (r) curState = "WIN";
    } else slice[color].position.y += 0.005;
}

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}


window.onload = initScene;

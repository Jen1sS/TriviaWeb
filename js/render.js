import * as THREE from 'three';
import {Vector2, Vector3} from 'three';
import {ModelImporter} from './Classes/Importers.js';
import {Board} from "./Classes/Board.js";
import {Player} from "./Classes/Elements.js";


//Necessari per ThreeJs
let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render
let camera = null;
let scene = null;    // la scena radice
let clock = null;    // Oggetto per la gestione del timinig della scena

let defFov = 70;


//LUCE
let dl = null;

//PLAYER
let insertedP = false;
let addedP = false;

//World
let world;
let sky;
let island;
let addedW = false;

//Visuali della camera necessarie per lerping
let curLook = new THREE.Vector3(0, 5, 0);
//cutsene iniziale
const portLook = new THREE.Vector3(24, 1, 4);
const portPos = new THREE.Vector3(21.5, 2, 4);
const fallPos = new THREE.Vector3(24, -0.89, 4);
//#region livello 1
const l1Look = new THREE.Vector3(10, -3, -15);
const l1Pos = new THREE.Vector3(19.305838582776822,4, -5.5135277800541446);
const l1Points = [ // I TRE VECTOR SONO INIZIO,SECONDO PUNTO E FINE
    [new Vector2(20.59, -2.38), new Vector2(19.2, -3.2), new Vector2(18.6, -1.8), -0.3145], //HOME 1
    [new Vector2(18.4, -1.8), new Vector2(17.7, -2.6), new Vector2(18.3, -4.71), -2.2145], //HOME 2
    [new Vector2(18.3, -4.71), new Vector2(19.19, -4.988), new Vector2(19.39, -5.789), -2.7145], //HOME 3
    [new Vector2(19.39, -5.789), new Vector2(20.2, -6.29), new Vector2(21, -5.58), -3.7145], //HOME 4
    [new Vector2(21, -5.58), new Vector2(22, -5.1), new Vector2(22, -3.81), -4.5145], //HOME 5
    [new Vector2(22, -3.81), new Vector2(21.388, -2.09), new Vector2(16.488, -2.49), -1.4145], //NEXT LEVEL
    [new Vector2(22.19, -3.78), new Vector2(21.388, -2.09), new Vector2(20.59, -2.38), -2.1145] //FAILED LEVEL

]
let curPos = 0; //CHEAT MATTO 3: se metti curPos a 5 skippa il livello 1
//endregion

//#region livello 2
const l2Pos = new Vector3(5, 10, -10);
const l2AfterBridge = new Vector3(11.4039, 5, -2.688);
const l2Tol2p2 = [new Vector2(11.4039, -2.688), new Vector2(10.097, -1.989), new Vector2(8.597, -11.889)];
const l2Tol3 = [new Vector2(8.597, -11.889), new Vector2(3, -23), new Vector2(3.397, -9.083)];
const l2p2Pos = new Vector3(3, 10, -18);
//#endregion

//#region livello 3
const l3toCity = [
    [new Vector2(3.397, -9.083), new Vector2(3.6976, 8.0394), new Vector2(-2.9023, 1.1399)], //BRIDGE TO CITY
    [new Vector2(-2.9023, 1.1399), new Vector2(-3.89, -5.24), new Vector2(-8.39, -8.24)] //TOWER TO CITY
];
const l3Points = [
    [new Vector2(-8.39, -8.24), new Vector2(-3.98, -7.83), new Vector2(-3.98, -7.83), -4.08], //CASA 1
    [new Vector2(-3.98, -7.83), new Vector2(-4.88, -8.73), new Vector2(-4.88, -8.73), 2.48], //CASA 2
    [new Vector2(-4.88, -8.73), new Vector2(-5.98, -9.83), new Vector2(-5.98, -9.83), -3.41], // CASA 3
    [new Vector2(-5.98, -9.83), new Vector2(-7.78, -10.03), new Vector2(-7.78, -10.03), 3.16], //CASA 4
    [new Vector2(-7.78, -10.03), new Vector2(-6.28, -10.53), new Vector2(-5.58, -12.13), 2.82], //CASA 5 DIETRO CAMERA
    [new Vector2(-5.58, -12.13), new Vector2(-4.68, -11.13), new Vector2(-3.58, -10.73), 2.77], //CASA 5
    [new Vector2(-3.58, -10.73), new Vector2(-3.08, -9.83), new Vector2(-2.58, -9.83), 2.25], //CASA 6
    [new Vector2(-2.58, -9.83), new Vector2(-2.48, -8.53), new Vector2(-1.58, -8.33), 1.84], //CASA 7
    [new Vector2(-1.58, -8.33), new Vector2(-1.68, -7.03), new Vector2(-0.98, -6.53), 1.89], //CASA 8
    [new Vector2(-0.98, -6.53), new Vector2(-2.58, -10.03), new Vector2(-7.58, -13.13), -3.27], //CASA 9 DAVANTI
    [new Vector2(-7.58, -13.13), new Vector2(-8.58, -12.83), new Vector2(-9.68, -13.63), -3.07], //CASA 10
    [new Vector2(-9.68, -13.63), new Vector2(-11.08, -13.53), new Vector2(-11.98, -13.53), -2.56], //CASA 11
    [new Vector2(-11.98, -13.53), new Vector2(-12.58, -13.23), new Vector2(-13.28, -12.93), -2.66], //CASA 12
    [new Vector2(-13.28, -12.93), new Vector2(-14.18, -11.93), new Vector2(-14.18, -11.93), -2.66], //CASA 13
    [new Vector2(-14.18, -11.93), new Vector2(-15.08, -9.83), new Vector2(-15.08, -9.83), 4.96], //CASA 14
    [new Vector2(-15.08, -9.83), new Vector2(-15.48, -8.13), new Vector2(-15.48, -8.13), 4.96] //CASA 15
]
const l3Camera = [
    new Vector3(-2.08, 14, -9.18),//TO SECOND ROW
    new Vector3(-11.85, 13.64, -9.51), //TO FIRST ROW
]
//#endregion
//#region livello 4
const l4DoorCurve = [new Vector2(-15.48, -8.13), new Vector2(-13.27, -8.53), new Vector2(-13.17, -7.43)];
//#endregion


//MODELS
let mi = new ModelImporter();
//ADD
let added = false;

//debug
let debug = false;

/*
 * Inizializza il motore e il gioco
 */
async function initScene() {
    if (debug) curPos = 5;

    if (renderer != null) return;


    let width = window.innerWidth;
    let height = window.innerHeight;

    //#region CREAZIONE WORLD
    world = new Board();
    //#endregion
    //#region CREAZIONE RENDERER
    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("map").appendChild(renderer.domElement);
    //#endregion
    //#region SETUP CAMERA
    if (width < 1000) defFov = 90;
    camera = new THREE.PerspectiveCamera(defFov, width / height, 0.1, 500);
    camera.position.set(40, 30, 40);
    camera.lookAt(0, 5, 0)
    clock = new THREE.Clock();
    //#endregion
    //#region CREAZIONE SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    //#endregion
    //#region CREAZIONE PLAYER
    player = new Player();
    //#endregion
    //#region SETUP LUCI
    dl = new THREE.DirectionalLight(0xffffcc, 4);
    const ShadowmapSize = 8096;
    const increaseAmount = 50;
    dl.position.set(30, 40, 0);
    dl.lookAt(0, 0, 0);
    dl.castShadow = true;
    dl.shadow.mapSize = new THREE.Vector2(ShadowmapSize, ShadowmapSize);
    dl.shadow.bias = -0.0001;
    dl.shadow.camera.left -= increaseAmount;
    dl.shadow.camera.right += increaseAmount;
    dl.shadow.camera.top += increaseAmount;
    dl.shadow.camera.bottom -= increaseAmount;
    dl.shadow.camera.near = 1;
    dl.shadow.camera.far = 1000;

    let dl2 = new THREE.AmbientLight(0xffffff, 0.25); //rende le ombre meno black
    scene.add(dl2)
    scene.add(dl);
    //#endregion

    document.getElementById("play").style.display = "none"
    renderer.setAnimationLoop(animate);
}

function lerpCameraVision(v1, v2, alpha) {
    let currentLookAt = v1;
    currentLookAt.lerp(v2, alpha);
    camera.lookAt(currentLookAt);
}

//posizionamento camera a start
let transition = 0;
let falling = false;
let impact = falling;
let start = false;

function animate() {
    dt = clock.getDelta();

    renderer.clear();
    renderer.render(scene, camera);

    if (addedW) player.update(dt, world.getWorld());
    if (player.lives < 0) curState = "RESTART";

    if (mi.everythingLoaded()) {
        //AUTOMA A STATI FINITI
        if (addedW) sky.rotation.y += 0.05 * dt;
        switch (curState) {
            case "WAITING": //CARICAMENTO DEL MONDO
                added = true;

                //#region Loading elements
                if (player.readyToGenerate() && !addedP) {
                    addedP = true;
                    player.generate();
                    if (!insertedP) {
                        insertedP = true;
                        player.rotateY(4.12334) //circa 21pi/16
                        scene.add(player.getPlayer());
                    }
                }
                if (world.readyToUse() && !addedW) {
                    addedW = true;
                    scene.add(world.getWorld());
                    scene.add(world.getSkybox());
                    island = world.getWorld();
                    sky = world.getSkybox();
                }


                if (addedP && addedW) {
                    document.getElementById("play").style.display = "block"
                    island.rotation.y += 0.1 * dt;
                }

                break;
            case "PREPARING": //ATTIVATO DOPO AVER PREMUTO GIOCA

                if (island.rotation.y > 0.001) {
                    island.rotation.y -= (island.rotation.y * 5) * dt;
                } else if (transition < 0.1) {
                    island.rotation.y = 0;
                    sky.rotation.y = 0;
                    transition += 0.1 * dt;
                    lerpCameraVision(curLook, portLook, transition)
                    camera.position.lerp(portPos, transition)
                } else if (player.getPosition().y > 0.6) {
                    if (player.readyToPlay()) {
                        if (!falling) {
                            falling = true;
                            player.play("falling");
                        }

                        player.lerpPosition(fallPos, transition)
                        transition += 0.1 * dt;
                    }
                }

                let timeA = 1;
                let timeB = 1;
                if (debug) timeA = timeB = 1;
                if (!impact && player.getPosition().y < 0.8) {
                    impact = true;
                    player.playOnceWithTransition("impact");
                    setTimeout(() => {
                        curLook = portLook;
                        player.playOnceWithTransition("standing");
                        setTimeout(() => {
                            player.play("idle")
                            transition = 0;
                            curState = "CUTSCENE_INITIAL";
                        }, timeA) //15000 val giusto
                    }, timeB) //3000 val giusto
                }
                break;
            case "CUTSCENE_INITIAL": //PRIMA CUTSENE
                if (transition < 0.1) {
                    if (!start) {
                        start = true;
                        player.rotateY(3.8);
                        player.play("walk")
                    }
                    if (transition > 0.006) transition = 0.1;
                    camera.position.lerp(l1Pos, transition);
                    camera.lookAt(player.getPosition());
                    player.lerpPosition(new THREE.Vector3(20, 10, -3.5), transition);
                    transition += 0.001 * dt;
                } else if (start) {
                    start = !start;
                    transition = 0;
                    player.play("idle");
                    curState = "LVL1"
                }
                break;
            case "LVL1":
                camera.lookAt(player.getPosition());
                if (transition >= 1 && transition < 2) { //Caso in cui ruota su se stesso per andare alla prossima casa
                    if (curPos === 6 || curPos === 5) transition = 2.1; //Non lo fa se deve tornare all'inizio o va al prossimo livello
                    else { //Giro
                        player.play("rT");
                        player.lerpAngleY(l1Points[curPos][3], ((transition - 1)) / 10);
                        transition += 0.5 * dt;
                    }
                } else if (transition >= 0 && transition < 1) { //Deve camminare alla prossima casa
                    if (curPos === 5) player.play("walkW");
                    else if (curPos === 6) player.play("walkL");
                    else player.play("walk")

                    player.lerpWithBeizerCurve(l1Points[curPos][0], l1Points[curPos][1], l1Points[curPos][2], transition);
                    if (curPos === 5) transition += 0.25 * dt; //Se sta andando al ponte ci va più lentamente
                    else transition += 0.5 * dt;
                } else if (transition > 2 && !timeout && answered) { //cosi chiede solo una volta

                    if (curPos < 5) { //Quando sta navigando per le case
                        timeout = true;
                        setTimeout(() => {
                            //reset delle variabili per la prossima iterazione
                            resetLVL1()

                            if (curPos < 4) curPos++; //prossima casa
                            else if (streak >= 5) curPos = 5; //prossimo livello
                            else curPos = 6; //ritorno a casa 1

                        }, 500)
                    } else if (curPos === 6) { //Ritorno alla prima casa senza timeout
                        curPos = 0;
                        resetLVL1()
                    } else {
                        curState = "LVL2"
                        curPos = 0;
                        timeout = false;
                        asked = false;
                        answered = false;
                        transition = 0;
                    } //Prossimo livello
                } else if (!asked) { //Se deve ancora chiedere chiede la domanda
                    if (curPos < 5) {
                        ask(1);
                        asked = true;
                        player.play("idle");
                    } else answered = true;
                }
                break;
            case "LVL2":
                if (debug) player.setEnergy(15);
                //#region LEVEL 2 PART 1
                if (transition < 0.1) { // PREPARING CAMERA
                    player.play("idleW")
                    camera.position.lerp(l2Pos, transition)
                    lerpCameraVision(l1Look, player.getPosition(), transition);
                    transition += 0.1 * dt
                } else if (transition < 0.107) { //PATH TO BRIDGE TO NEXT LEVEL
                    player.play("walk");
                    player.lerpPosition(l2AfterBridge, transition - 0.1);
                    transition += 0.001 * dt;
                    guessed = true;
                } else if (transition < 1.107 && (player.getEnergy() > 0.1 && guessed) || (player.getEnergy() > -0.7 && !guessed)) { //CLIMBING THE MOUNTAIN
                    if (player.getEnergy() > -1) player.decreaseEnergy(0.1 * dt) //CHEAT MATTO 2: commenta la linea di codice
                    player.lerpWithBeizerCurve(l2Tol2p2[0], l2Tol2p2[1], l2Tol2p2[2], transition - 0.107, !guessed);
                    transition += 0.1 * dt * player.getEnergy();
                } //#endregion
                //#region LEVEL 2 PART 2
                if ((transition > 1.107 && transition < 2.107)) {
                    if ((player.getEnergy() > 0.1 && guessed) || (player.getEnergy() > -0.7 && !guessed)) {
                        if (transition < 1.207) {
                            camera.position.lerp(l2p2Pos, transition - 1.107);
                            transition += 0.1 * dt
                        } else transition += 0.1 * dt * player.getEnergy();
                        if (player.getEnergy() > -1) player.decreaseEnergy(0.1 * dt) //CHEAT MATTO 2: commenta la linea di codice
                        player.lerpWithBeizerCurve(l2Tol3[0], l2Tol3[1], l2Tol3[2], transition - 1.107, !guessed);
                    }
                } else if (transition > 2.107) { //condition to next level
                    player.play("idle");
                    if (!debug) player.setEnergy(0.7);
                    else curPos = 9;
                    curState = "LVL3";
                    transition = 0;
                }
                //#endregion
                //#region QUESTION MANAGEMENT
                if (transition > 0.107) {
                    if (!asked && ((player.getEnergy() < 0.1 && guessed) || (player.getEnergy() < -0.7 && !guessed))) { //condition to ask
                        player.play("tired");
                        setTimeout(() => {
                            ask(2)
                        }, 1000)
                        asked = true;
                        answered = false;
                    } else if (answered) { //action if answered
                        if (guessed) {
                            player.play("walkW");
                            asked = false;
                            answered = false;
                            player.setEnergy(0.7);
                        } else {
                            player.play("walkL");
                            asked = false;
                            answered = false;
                            player.getRotation().y -= Math.PI;
                            player.setEnergy(0);
                        }
                    }
                }
                //#endregion
                if (transition > 0.1) camera.lookAt(player.getPosition());
                break;
            case "LVL3":
                if (transition < 0.1) { //MOVING TO TOWER
                    camera.position.lerp(new Vector3(1.9, 13, 1.2), transition);
                } else if (transition < 1.1) { //WALK TO TORNANTE
                    player.play("walk");
                    camera.position.lerp(new Vector3(-1.8023, 14, -1.3600), (transition - 0.1) / 10)
                    player.lerpWithBeizerCurve(l3toCity[0][0], l3toCity[0][1], l3toCity[0][2], transition - 0.1, false);
                } else if (transition < 2.1) { //TORNANTE TO CITY
                    player.play("walkW");
                    camera.position.lerp(new Vector3(-3.86, 14, -5.32), (transition - 1.1) / 10)
                    player.lerpWithBeizerCurve(l3toCity[1][0], l3toCity[1][1], l3toCity[1][2], transition - 1.1, false);


                } else { //GAME IN CITY
                    if (transition < 3.1) {
                        if (curPos === 4) camera.position.lerp(l3Camera[0], (transition - 2.1) / 10);
                        else if (curPos === 11) camera.position.lerp(l3Camera[1], (transition - 2.1) / 10);

                        player.play("walk");
                        player.lerpWithBeizerCurve(l3Points[curPos][0], l3Points[curPos][1], l3Points[curPos][2], transition - 2.1);
                    } else if (transition < 3.2) {
                        player.play("rT");
                        player.lerpAngleY(l3Points[curPos][3], (transition - 3.1));
                    } else {
                        player.play("idle");
                        if (!asked && !debug) {
                            asked = true;
                            ask(3);

                        } else if ((asked && answered) || debug) {
                            answered = false;
                            asked = false;
                            if (!guessed) player.lives--;
                            if (curPos < l3Points.length - 1) {
                                curPos++;
                                transition = 2.11;
                            } else{
                                curState = "LVL4";
                                transition = 0;
                            }

                        }
                    }

                    player.play("idleW")
                }

                if (debug) transition += 0.1 * dt * player.getEnergy();
                else transition += 0.1 * dt ;
                camera.lookAt(player.getPosition())

                break;
            case "LVL4": // DISTANZA ESEMPIO/DT ESEMPIO = DISTANZA/DT
                if (transition<1){
                    player.lerpWithBeizerCurve(l4DoorCurve[0],l4DoorCurve[1],l4DoorCurve[2],transition,false)
                    player.play("walk");
                } else player.play("idle");

                if (finalQuestions!==0 && !asked && transition>1){
                    player.play("idle")
                    asked=true
                    askWorst(3)
                } else if (answered && !guessed) curState = "RESTART";
                else if (answered && guessed) {
                    player.play("win")
                    answered=false;
                    setTimeout(()=>{
                        asked=false;
                        finalQuestions--;
                    },5000)
                } else if (finalQuestions === 0) curState = "WIN"

                transition += dt * 0.3;
                camera.lookAt(player.getPosition())
                break;
            case "RESTART":
                delay += dt;
                if (!got) {
                    player.playOnceWithTransition("jump")
                    coord = new Vector3(player.getPosition().x, player.getPosition().y, player.getPosition().z);
                    got = true
                }
                if (delay > 1) {
                    camera.lookAt(coord);
                    player.getPosition().y += 5 * dt;
                    if (player.getPosition().y - 10 > camera.position.y) location.reload(true);
                }
                break
            case "WIN":
                break;
        }
    }

}

let timeout = false;
let asked = false;
let got = false;
let coord;
let delay = 0;
let finalQuestions = 5;

function resetLVL1() {
    timeout = false;
    answered = false;
    asked = false;
    transition = 0;
}

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

document.addEventListener('keydown', function (event) {
    if (!debug) {
        if (event.key === "r") ready = true;
        if (event.key === "p") {
            console.log("----DEBUG----")
            console.log("POSITION: (x)" + player.getPosition().x + " (y)" + player.getPosition().y + " (z)" + player.getPosition().z)
            console.log("ROTATION (y): " + player.getRotation().y)
            console.log("-------------")
        } else if (event.key === "l") console.log(player.getPosition().x + ", " + player.getPosition().z);

        if (event.key === "s") player.getPosition().x += 0.1;
        if (event.key === "w") player.getPosition().x -= 0.1;
        if (event.key === "a") player.getPosition().z += 0.1;
        if (event.key === "d") player.getPosition().z -= 0.1;
        if (event.key === "q") player.getRotation().y += 0.1;
        if (event.key === "e") player.getRotation().y -= 0.1;
    }
});
let ready = false;

window.onload = initScene;
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

const defFov = 70;


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
const portLook = new THREE.Vector3(23, 5, 4);
const portPos = new THREE.Vector3(18, 8, 4);
const fallPos = new THREE.Vector3(24, 0.58, 4);
//#region livello 1
const l1Look = new THREE.Vector3(10, -3, -15);
const l1Pos = new THREE.Vector3(22, 4, -1);
const l1Points = [ // I TRE VECTOR SONO INIZIO,SECONDO PUNTO E FINE
    [new Vector2(20.59, -2.38), new Vector2(19.2, -3.2), new Vector2(18.6, -1.8), -0.3145], //HOME 1
    [new Vector2(18.4, -1.8), new Vector2(17.7, -2.6), new Vector2(18.3, -4.71), -2.2145], //HOME 2
    [new Vector2(18.3, -4.71), new Vector2(19.19, -4.988), new Vector2(19.39, -5.789), -2.7145], //HOME 3
    [new Vector2(19.39, -5.789), new Vector2(20.2, -6.29), new Vector2(21, -5.58), -3.7145], //HOME 4
    [new Vector2(21, -5.58), new Vector2(22, -5.1), new Vector2(22.19, -3.78), -4.5145], //HOME 5
    [new Vector2(22.19, -3.78), new Vector2(21.388, -2.09), new Vector2(16.488, -2.49), -1.4145], //NEXT LEVEL
    [new Vector2(22.19, -3.78), new Vector2(21.388, -2.09), new Vector2(20.59, -2.38), -2.1145] //FAILED LEVEL

]
let curPos = 5; //CHEAT MATTO 3: se metti curPos a 5 skippa il livello 1
//endregion

//#region livello 2
const l2Pos = new Vector3(5, 10, -10);
const l2AfterBridge = new Vector3(11.4039, 5, -2.688);
const l2Tol2p2 = [new Vector2(11.4039, -2.688), new Vector2(10.097, -1.989), new Vector2(8.597, -11.889)];
const l2Tol3 = [new Vector2(8.597, -11.889), new Vector2(3, -23), new Vector2(3.397, -9.083)];
const l2p2Pos = new Vector3(3, 10, -18);
//#endregion

//MODELS
let mi = new ModelImporter();
//ADD
let added = false;

//LERP
let beizerAlpha = -1;

/*
 * Inizializza il motore e il gioco
 */
async function initScene() {

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
    //#region CREAZIONE LUCE DEL TABELLONE
    dl = new THREE.PointLight(0xffffcc, 10000);
    dl.position.set(30, 40, 0);
    dl.castShadow = true;
    const ShadowmapSize = 4096
    dl.shadow.mapSize = new THREE.Vector2(ShadowmapSize, ShadowmapSize);
    dl.shadow.bias = -0.002;
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


    if (mi.everythingLoaded()) {
        if (lives !== 0) {
            //AUTOMA A STATI FINITI
            if (addedW) {
                sky.rotation.y += 0.05 * dt;
            }
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
                            }, 1) //15000 val giusto
                        }, 1) //3000 val giusto
                    }
                    break;
                case "CUTSCENE_INITIAL": //PRIMA CUTSENE
                    if (transition < 0.1) {
                        camera.position.lerp(l1Pos, transition);
                        lerpCameraVision(curLook, l1Look, transition)
                        transition += 0.1 * dt;
                    } else if (transition < 0.2) {
                        if (!start) {
                            start = true;
                            player.rotateY(3.8);
                            player.play("walk")
                        }
                        if (transition > 0.106) transition = 0.2;
                        player.lerpPosition(new THREE.Vector3(20, 10, -3.5), transition - 0.1);
                        transition += 0.001 * dt;
                    } else if (start) {
                        start = !start;
                        beizerAlpha = 0;
                        player.play("idle");
                        curState = "LVL1"

                    }
                    break;
                case "LVL1":
                    if (beizerAlpha >= 1 && beizerAlpha < 2) { //Caso in cui ruota su se stesso per andare alla prossima casa
                        if (curPos === 6 || curPos === 5) beizerAlpha = 2.1; //Non lo fa se deve tornare all'inizio o va al prossimo livello
                        else { //Giro
                            player.play("rT")
                            player.lerpAngleY(l1Points[curPos][3], ((beizerAlpha - 1)) / 10);
                            beizerAlpha += 0.5 * dt;
                        }
                    } else if (beizerAlpha >= 0 && beizerAlpha < 1) { //Deve camminare alla prossima casa
                        if (curPos === 5) player.play("walkW");
                        else if (curPos === 6) player.play("walkL");
                        else player.play("walk")

                        player.lerpWithBeizerCurve(l1Points[curPos][0], l1Points[curPos][1], l1Points[curPos][2], beizerAlpha);
                        if (curPos === 5) beizerAlpha += 0.25 * dt; //Se sta andando al ponte ci va più lentamente
                        else beizerAlpha += 0.5 * dt;
                    } else if (beizerAlpha > 2 && !timeout && answered) { //cosi chiede solo una volta

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
                        if (player.getEnergy()>-1) player.decreaseEnergy(0.1 * dt) //CHEAT MATTO 2: commenta la linea di codice
                        player.lerpWithBeizerCurve(l2Tol2p2[0], l2Tol2p2[1], l2Tol2p2[2], transition - 0.107, !guessed);
                        transition += 0.1 * dt * player.getEnergy();
                    } //#endregion
                    //#region LEVEL 2 PART 2
                    if ((transition > 1.107 && transition < 2.107)){
                        if ((player.getEnergy() > 0.1 && guessed) || (player.getEnergy() > -0.7 && !guessed)) {
                            if (transition < 1.207) {
                                camera.position.lerp(l2p2Pos, transition - 1.107);
                                transition += 0.1 * dt
                            } else transition += 0.1 * dt * player.getEnergy();
                            if (player.getEnergy() > -1) player.decreaseEnergy(0.1 * dt) //CHEAT MATTO 2: commenta la linea di codice
                            player.lerpWithBeizerCurve(l2Tol3[0], l2Tol3[1], l2Tol3[2], transition - 1.107, !guessed);
                        }
                    } else if (transition > 2.107) player.play("idle")
                    //#endregion


                    if (transition > 0.107) {
                        if (!asked && ((player.getEnergy() < 0.1 && guessed) || (player.getEnergy() < -0.7 && !guessed))) {
                            player.play("idle");
                            ask(2);
                            asked = true;
                            answered = false;
                        } else if (answered) {
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

                    if (transition > 0.1) {
                        camera.lookAt(player.getPosition());
                    }

                    break;
            }
        }
    }
}

let timeout = false;
let asked = false;

function resetLVL1() {
    timeout = false;
    answered = false;
    asked = false;
    beizerAlpha = 0;
}

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

document.addEventListener('keydown', function (event) {
    console.log("----DEBUG----")
    console.log("POSITION: (x)" + player.getPosition().x + " (y)" + player.getPosition().y + " (z)" + player.getPosition().z)
    console.log("ROTATION (y): " + player.getRotation().y)
    console.log("-------------")
    if (event.key === "s") player.getPosition().x += 0.1;
    if (event.key === "w") player.getPosition().x -= 0.1;
    if (event.key === "a") player.getPosition().z += 0.1;
    if (event.key === "d") player.getPosition().z -= 0.1;
    if (event.key === "q") player.getRotation().y += 0.1;
    if (event.key === "e") player.getRotation().y -= 0.1;
});

window.onload = initScene;

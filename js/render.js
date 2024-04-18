import * as THREE from 'three';
import {AnimationManager, ModelImporter} from './Classes/Importers.js';
import {Board} from "./Classes/Board.js";
import {Player} from "./Classes/Elements.js";

//Necessari per ThreeJs
let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render
let camera = null;
let scene = null;    // la scena radice
let clock = null;    // Oggetto per la gestione del timinig della scena


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
//livello 1
const l1Look = new THREE.Vector3(10,-3,-15);
const l1Pos = new THREE.Vector3(22, 4, -1);

//MODELS
let mi = new ModelImporter();
//ADD
let added = false;

let finalAnimation;

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
    camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 500);
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
    dl = new THREE.PointLight(0xfffbcc, 5000);
    dl.position.set(30, 40, 0);
    dl.castShadow = true;
    dl.shadow.mapSize = new THREE.Vector2(4096, 4096);
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

function animate() {
    dt = clock.getDelta();


    renderer.clear();
    renderer.render(scene, camera);


    player.update(dt);


    if (mi.everythingLoaded()) {
        if (lives !== 0) {
            //AUTOMA A STATI FINITI
            if (addedW){
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
                                curState = "CUTSECE_INITIAL";
                            }, 15000) //15000 val giusto
                        }, 3000) //3000 val giusto
                    }
                    break;
                case "CUTSECE_INITIAL": //PRIMA CUTSENE
                    if (transition < 0.1) {
                        camera.position.lerp(l1Pos, transition);
                        lerpCameraVision(curLook,l1Look,transition);
                        transition += 0.1 * dt;
                    }
                    break;
            }
        } else {
        }
    }
}


window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.onload = initScene;

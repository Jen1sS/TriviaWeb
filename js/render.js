import * as THREE from 'three';
import {MeshPhysicalMaterial, Vector3} from 'three';
import {AnimationManager, ModelImporter} from './Classes/Importers.js';
import {Writer} from './Classes/Writer.js';
import {Board} from "./Classes/Board.js";
import {Dice, Hearts, Player} from "./Classes/Elements.js";

//Necessari per ThreeJs
let gl = null;       // Il canvas in cui renderizzare
let renderer = null; // Il motore di render
let camera = null;
let scene = null;    // la scena radice
let clock = null;    // Oggetto per la gestione del timinig della scena

//BOARD
let board;
let slice = {};

//PLANE
let plane;


//LUCE
let dl = null;
let dl2 = null;

//PLAYER
let insertedP = false;

//DICE
let diceLook;
let insertedD = false;

//HEARTS
let hearts;
let insertedH = false;


//Visuali della camera necessarie per lerping
let endLook;
let posLook;
const oriLook = new Vector3(0, 0, 0);

let did = false //WIN
let loaded = false;

// LERPING
let travelTime;
let backTime = 0;
let pos;
let end;


let reset;
const loader = new THREE.TextureLoader();


//MODELS
let mi = new ModelImporter();
//ADD
let added = false;

let finalAnimation;

//TEXT
let writer;
let num;
let numLight = [];

//POINTS
let lastPoints = 0;

/*
 * Inizializza il motore e il gioco
 */
async function initScene() {
    if (renderer != null) return;


    let width = window.innerWidth;
    let height = window.innerHeight;

    //CREAZIONE RENDERER
    renderer = new THREE.WebGLRenderer({antialias: "true", powerPreference: "high-performance"});
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setClearColor("black", 1);
    renderer.shadowMap.enabled = true;
    document.getElementById("map").appendChild(renderer.domElement);

    //SETUP CAMERA
    camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 500);
    camera.position.set(3.5, 9.5, 3.5);
    camera.lookAt(0, 0, 0);
    clock = new THREE.Clock();

    //CREAZIONE SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    //CREAZIONE TABELLONE
    board = new Board();
    board.generate();

    c = board.getColors(); //da fixare


    slice = board.getSlices();
    const cells = board.getCells();

    for (let i = 0; i < slice.length; i++) scene.add(slice[i])
    for (let i = 0; i < cells.length; i++) scene.add(cells[i])
    scene.add(board.getTable())

    //CREAZIONE PLANE
    const g4 = new THREE.PlaneGeometry(10000, 10000);
    const m4 = new THREE.MeshPhysicalMaterial({color: 0x33ADFF, side: THREE.DoubleSide});
    plane = new THREE.Mesh(g4, m4);
    plane.receiveShadow = true;
    plane.position.y = 1.2
    plane.rotateX(Math.PI / 2)

    //CREAZIONE DADO - NEW
    dice = new Dice();
    diceLook = dice.getDicePosition();

    //CREAZIONE PLAYER
    player = new Player();


    //CREAZIONE CUORI
    hearts = new Hearts();

    //CREAZIONE LUCE DEL TABELLONE
    dl = new THREE.PointLight(0xFFFFFF, 20);
    dl.position.set(0, 5, 0);
    dl.castShadow = true;

    //CREAZIONE LUCE DEL DADO
    dl2 = new THREE.PointLight(0xFFFFFF, 20);
    dl2.position.set(12, 8, 6);
    dl2.castShadow = true;

    //NUMERI
    writer = new Writer(new Vector3(board.getCellPosition(0)[0] + 0.7, 1.2, board.getCellPosition(0)[2] + 1.1), scene);
    writer.write("000");


    //AGGIUNTA ALLA SCENA (altri messi perche sono in un array)
    scene.add(dl);
    scene.add(dl2);
    scene.add(plane);

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
            player.setPosition(board.getCellPosition(player.getOnCell())[0], board.getCellPosition(player.getOnCell())[1], board.getCellPosition(player.getOnCell())[2]);

            travelTime = 2;
            if (player.getOnCell() + 1 === board.getCells().length) pos = 0;
            else pos = player.getOnCell() + 1;
            end = new Vector3(board.getCellPosition(pos)[0], board.getCellPosition(pos)[1], board.getCellPosition(pos)[2]);
            start()
            positions--;
            asked = false;

            player.setOnCell(pos)

        } else if (curState !== "WAITING") {
            curState = "QUESTION"
        }
    }
}


//LERPING MOVIMENTO
let animationStart = false;

function start() {
    backTime = 0;
    reset = true
    if (travelTime <= 1) {

        if (!animationStart) {
            player.play("walk")
            animationStart = true;
        }

        player.lerpPosition(end, 1 - travelTime);
        travelTime -= 0.0001;
        posLook = player.getPosition();
        camera.lookAt(posLook)
    } else {
        endLook = player.getPosition();
        lerpCamera(posLook, endLook, 2 - travelTime);
        camera.position.lerp(new Vector3(3.5, 7.5, 3.5), 2 - travelTime)
        travelTime -= 0.005;
    }

    if (travelTime >= 0.98) setTimeout(start, 5);
    else {
        setTimeout(go, 100);
        animationStart = false;
        player.play("idle")
    }
}


//LERPING VISUALE
function resetCamera(alpha) {
    lerpCamera(player.getPosition(), oriLook, alpha)
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


    player.update(dt);


    if (points !== lastPoints) {
        for (let i = 0; i < num.length; i++) {
            scene.remove(num[i]);
            scene.remove(numLight[i]);
        }
        writer.write(points + "");
    }
    if (writer.ready()) {
        lastPoints = points;

        num = writer.get(1.2);
        for (let i = 0; i < num.length; i++) {
            numLight.push(new THREE.PointLight(0x0000FF, 3));
            numLight[i].position.set(num[i].position.x, num[i].position.y + 0.2, num[i].position.z);
            numLight[i].castShadow = true;
            numLight[i].receiveShadow = true;
            scene.add(num[i]);
            scene.add(numLight[i]);
        }
    }


    if (mi.everythingLoaded()) {
        if (lives !== 0) {
            //AUTOMA A STATI FINITI
            switch (curState) {
                case "WAITING":
                    document.getElementById("play").style.display = "block"
                    added = true;


                    if (player.readyToGenerate()) {
                        player.generate(board);
                        if (!insertedP) {
                            insertedP = true;
                            scene.add(player.getPlayer());
                        }

                        if (player.readyToPlay()) {
                            player.play("idle")
                        }
                    }


                    if (dice.readyToGenerate()) {
                        dice.generate();
                        if (!insertedD) {
                            insertedD = true;
                            scene.add(dice.getDice());
                        }
                    }

                    if (hearts.readyToGenerate()) {
                        hearts.generate(board);
                        if (!insertedH) {
                            insertedH = true;
                            let el = hearts.getElements()
                            for (let i = 0; i < el.length; i++) for (let j = 0; j < el[i].length; j++) scene.add(el[i][j]);
                        }
                    }

                    break;
                case "REVEAL":

                    player.play("win")

                    revealGuessed();
                    break;
                case "TRTDICE": //TRT significa "Transition to"

                    if (!won) {
                        player.play("lost")
                        if (hearts.getLastHeartY() >= 0.3) hearts.moveLastHeartY(-0.5 * dt);
                    }

                    setTimeout(() => {
                        posLook = diceLook;
                        if (timeA >= 0) {
                            watchDice(timeA);
                            timeA -= 0.003;
                        } else curState = "ROLLING";
                    }, 2000)
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
                    }
                    if (!finalAnimation) {
                        finalAnimation = true;
                        setTimeout(() => {
                            player.play("victory")
                        }, 1000)
                    }

                    break;
            }
        } else {
            if (!finalAnimation) {
                finalAnimation = true;
                setTimeout(() => {
                    player.playOnce("death")
                }, 1000)
            }

            if (hearts.getLastHeartY() >= 0.3) hearts.moveLastHeartY(-0.5 * dt);

            for (let i = 0; i < 5; i++) board.getSlice(c[i]).position.y -= 0.005;
            if (dl.position.y < 50) {
                dl.position.y += 0.05;
                dl2.position.y += 0.05;
            } else {
                setTimeout(() => {
                    location.reload()
                }, 3000)
            }
        }
    }
}
//REVEAL DEL SLICE DELLA MATERIA FATTA
function revealGuessed() {
    if (board.getSlice(color).position.y >= 2) {
        curState = "TRTDICE";

        //CHECK VITTORIA
        let r = true;
        for (let i = 0; i < 5; i++) {
            r = r && completed[c[i]];
        }
        if (r) curState = "WIN";
    } else board.getSlice(color).position.y += 0.005;
}

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}


window.onload = initScene;

import {AnimationManager, ModelImporter} from "./Importers.js";
import {Vector3} from "three";
import * as THREE from "three";

const mi = new ModelImporter();

export class Player {
    constructor() {
        this.player = null;
        this.aniP = null;
        this.generated = false;
        this.position = 0; //seleziona la pos iniziale
        this.raycaster = new THREE.Raycaster();


        mi.importWithName("../models/avatar.glb", "player")
    }

    readyToGenerate() {
        return mi.everythingLoaded();
    }

    readyToPlay() {
        if (this.aniP === null) return false;
        return this.aniP.everythingLoaded()
    }

    generate() {
        if (!this.generated) {
            this.generated = true;
            this.player = mi.getModel("player");
            this.player.position.set(24, 50, 4); //prendo posizione casella 0
            this.player.scale.set(0.7, 0.7, 0.7);
            this.player.rotation.y += Math.PI / 2;

            mi.addShadows("player");

            this.aniP = new AnimationManager(this.player);
            this.aniP.import("../animations/idle.glb", "idle");
            this.aniP.import("../animations/falling.glb", "falling");
            this.aniP.import("../animations/impact.glb", "impact");
            this.aniP.import("../animations/standing.glb", "standing");
            this.aniP.import("../animations/walk.glb", "walk");
        }
    }

    play(animation) {
        if (!this.aniP.isPlaying()) this.aniP.playAnimation(animation);
        else this.aniP.transitionTo(animation, 0.5)
    }

    playOnce(animation) {
        this.aniP.doOnce(animation, 0.5)
    }

    playOnceWithTransition(animation) {
        this.aniP.transitionAndDoOnce(animation, 0.5)
    }

    getPlayer() {
        return this.player;
    }

    rotateY(angle) {
        this.player.rotation.y = angle;
    }

    setPosition(x, y, z) {
        this.player.position.set(x, y, z);
    }

    getPosition() {
        return this.player.position;
    }

    getOnCell() {
        return this.position;
    }

    setOnCell(value) {
        this.position = value;
    }

    lerpPosition(destination, alpha) {
        this.player.position.lerp(destination, alpha);
    }
    update(dt, island) {
        if (this.aniP !== null) this.aniP.update(dt);


        if (this.player !== null && curState !== "WAITING" && curState !== "PREPARING") {
            console.log(this.player.rotation.y)

            this.player.position.y+=0.4; //offset cosi il player pare al suo posto
            this.raycaster.set(this.player.position, new THREE.Vector3(0, -1, 0));
            this.player.position.y-=0.4;

            // Check for intersections with the island
            const intersects = this.raycaster.intersectObject(island);

            if (intersects.length === 0 || intersects[0].distance > 0.1) {
                console.log(intersects[0])
                this.player.position.y = intersects[0].point.y + 0.1;
            }
        }
    }

}
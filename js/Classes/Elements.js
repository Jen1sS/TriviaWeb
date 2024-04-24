import {AnimationManager, ModelImporter} from "./Importers.js";
import * as THREE from "three";

const mi = new ModelImporter();

export class Player {
    constructor() {
        this.player = null;
        this.aniP = null;
        this.generated = false;
        this.energy = 0.7; // def 0.7
        this.position = 0; //seleziona la pos iniziale
        this.lives = 3;
        this.raycaster = new THREE.Raycaster();
        this.destination = 0;


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
            this.player.scale.set(0.5, 0.5, 0.5);
            this.player.rotation.y += Math.PI / 2;

            mi.addShadows("player");

            this.aniP = new AnimationManager(this.player);
            this.aniP.import("../animations/idle.glb", "idle");
            this.aniP.import("../animations/falling.glb", "falling");
            this.aniP.import("../animations/impact.glb", "impact");
            this.aniP.import("../animations/standing.glb", "standing");
            this.aniP.import("../animations/walk.glb", "walk");
            this.aniP.import("../animations/lost.glb", "lost");
            this.aniP.import("../animations/win.glb", "win");
            this.aniP.import("../animations/rightTurn.glb", "rT");
            this.aniP.import("../animations/walkW.glb", "walkW");
            this.aniP.import("../animations/walkL.glb", "walkL");
            this.aniP.import("../animations/idleW.glb", "idleW");
            this.aniP.import("../animations/tired.glb", "tired");
            this.aniP.import("../animations/jump.glb", "jump");
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

    getRotation() {
        return this.player.rotation;
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

    lerpWithBeizerCurve(p1, p2, p3, alpha, reverse) {
        this.destination = calcDistance();
        this.player.position.x = beizerFormula(p1.x, p2.x, p3.x, alpha);
        this.player.position.z = beizerFormula(p1.y, p2.y, p3.y, alpha);

        this.player.lookAt(
            beizerFormula(p1.x, p2.x, p3.x, alpha + 0.1 * dt),
            this.player.position.y,
            beizerFormula(p1.y, p2.y, p3.y, alpha + 0.1 * dt)
        )

        if (reverse !== undefined) if (reverse) {
            this.player.lookAt(
                beizerFormula(p1.x, p2.x, p3.x, alpha - 0.1 * dt),
                this.player.position.y,
                beizerFormula(p1.y, p2.y, p3.y, alpha - 0.1 * dt)
            )
        }
    }

    lerpAngleY(v2, alpha) {
        let targetQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), v2);
        this.player.quaternion.slerp(targetQuaternion, alpha);
    }

    getEnergy() {
        return this.energy;
    }

    decreaseEnergy(decrease) {
        this.energy -= decrease;
    }

    setEnergy(value) {
        this.energy = value;
    }

    update(dt, island) {
        if (this.aniP !== null) {
            this.aniP.update(dt);
            if (curState === "LVL2" || curState === "LVL3") this.aniP.setPlaybackSpeed(Math.abs(this.energy*1.5))
        }

        if (this.player !== null && curState !== "WAITING" && curState !== "PREPARING" && curState !== "RESTART") {

            this.player.position.y += 0.4; //offset cosi il player pare al suo posto
            this.raycaster.set(this.player.position, new THREE.Vector3(0, -1, 0));
            this.player.position.y -= 0.4;

            // Check for intersections with the island
            const intersects = this.raycaster.intersectObject(island);
            if (intersects.length === 0 || intersects[0].distance > 0.0001) {
                if (intersects.length > 0) this.player.position.y = intersects[0].point.y + 0.0001;
            }
        }
    }
}

function calcDistance() {

}

function beizerFormula(p1, p2, p3, alpha) {
    const alphaC = 1 - alpha;
    return alphaC ** 2 * p1 + 2 * alphaC * alpha * p2 + alpha ** 2 * p3;
}
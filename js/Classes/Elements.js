import {AnimationManager, ModelImporter} from "./Importers.js";
import {Vector3} from "three";
import * as THREE from "three";

const mi = new ModelImporter();

export class Dice {
    constructor() {
        this.dice = null;
        this.position = new Vector3(12, 5, 6);
        this.generated = false;

        this.rolled = 0;

        this.cumt;
        this.or;
        this.rotations = { // faccie dado
            1: [0, Math.PI * 0.5, Math.PI * 1.5],
            2: [Math.PI * 0.5, Math.PI, Math.PI * 1.5],
            3: [0, 0, 0],
            4: [Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5],
            5: [Math.PI * 0.5, 0, Math.PI * 1.5],
            6: [0, 0, Math.PI * 0.5],
        }

        mi.importWithName("../models/dice.glb", "dice");
    }

    readyToGenerate() {
        return mi.everythingLoaded();
    }

    generate() {
        if (!this.generated) {
            this.generated = true;
            this.dice = mi.getModel("dice");
            this.dice.position.set(this.position.x, this.position.y, this.position.z);

            this.dice.scale.x = 0.02;
            this.dice.scale.y = 0.02;
            this.dice.scale.z = 0.02;
        }
    }

    getDicePosition() {
        return this.position;
    }

    roll(speed) {
        switch (randBetween(2, 0)) {
            case 0:
                this.dice.rotation.x += speed * dt;
                break;
            case 1:
                this.dice.rotation.y += speed * dt;
                break;
            case 2:
                this.dice.rotation.z += speed * dt;
                break;
        }
    }

    initializeStraighten(rolled) {
        this.rolled = rolled;
        this.cumt = 0;
        this.or = [this.dice.rotation.x, this.dice.rotation.y, this.dice.rotation.z]
    }

    straighten(dt) {
        this.cumt += dt;

        if (this.cumt < 7) {
            this.dice.rotation.x = erp(this.or[0], this.rotations[this.rolled][0], this.cumt / 5);
            this.dice.rotation.y = erp(this.or[1], this.rotations[this.rolled][1], this.cumt / 5);
            this.dice.rotation.z = erp(this.or[2], this.rotations[this.rolled][2], this.cumt / 5);
        } else {
            this.dice.rotation.x = this.rotations[this.rolled][0];
            this.dice.rotation.y = this.rotations[this.rolled][1];
            this.dice.rotation.z = this.rotations[this.rolled][2];
            return true;
        }
        return false;
    }

    getDice() {
        return this.dice;
    }
}
export class Player {
    constructor() {
        this.player = null;
        this.aniP = null;
        this.generated = false;
        this.position = 0;


        mi.importWithName("../models/avatar.glb", "player")
    }
    readyToGenerate() {
        return mi.everythingLoaded();
    }
    readyToPlay() {
        if (this.aniP===null) return false;
        return this.aniP.everythingLoaded()
    }
    generate(board) {
        if (!this.generated) {
            this.generated = true;
            this.player = mi.getModel("player");
            this.player.position.set(board.getCellPosition(this.position)[0], board.getCellPosition(this.position)[1], board.getCellPosition(this.position)[2]); //prendo posizione casella 0
            this.player.rotation.y += Math.PI / 2;

            this.aniP = new AnimationManager(this.player);
            this.aniP.import("../animations/idle.glb", "idle");
            this.aniP.import("../animations/walk.glb", "walk");
            this.aniP.import("../animations/win.glb", "win");
            this.aniP.import("../animations/lost.glb", "lost");
            this.aniP.import("../animations/death.glb", "death");
            this.aniP.import("../animations/victory.glb", "victory");
        }
    }
    play(animation) {
        if (!this.aniP.isPlaying()) this.aniP.playAnimation(animation);
        else this.aniP.transitionTo(animation, 0.2)
    }
    playOnce(animation){
        this.aniP.doOnce(animation, 0.2)
    }
    getPlayer() {
        return this.player;
    }
    rotateY(angle){
        this.player.rotation.y = angle;
    }
    setPosition(x,y,z){
        this.player.position.set(x,y,z);
    }
    getPosition(){
        return this.player.position;
    }

    getOnCell(){
        return this.position;
    }

    setOnCell(value){
        this.position=value;
    }

    lerpPosition(destination,alpha){
        this.player.position.lerp(destination, alpha);
    }
    update(dt){
        if (this.aniP !== null) this.aniP.update(dt);
    }

}
export class Hearts {
    constructor() {
        this.hearts=[];
        this.heartLight=[];
        this.generated = false;


        for (let i = 0; i < lives; i++) mi.importWithName("../models/heart.glb", "heart" + i);
    }
    readyToGenerate(){
        return mi.everythingLoaded();
    }
    generate(board){
        if (!this.generated) {
            this.generated=true;
            for (let i = 0; i < lives; i++) {
                this.hearts.push(mi.getModel("heart" + i));
                this.hearts[i].position.set(board.getCellPosition(8 + i)[0] + 1.25, 1.145, board.getCellPosition(8 + i)[2] - i * 0.7);
                this.hearts[i].rotation.set(Math.PI / 2, 0, Math.PI / 2);
                this.hearts[i].scale.x = 0.15;
                this.hearts[i].scale.y = 0.15;
                this.hearts[i].scale.z = 0.15;
                this.hearts[i].receiveShadow = true;
                this.hearts[i].castShadow = true;

                this.heartLight.push(new THREE.PointLight(0xFF0000, 3));
                this.heartLight[i].position.set(board.getCellPosition(8 + i)[0] + 1.25, 2, board.getCellPosition(8 + i)[2] - i * 0.7);
                this.heartLight[i].castShadow = true;
                this.heartLight[i].receiveShadow = true;
            }
        }
    }
    getElements(){
        let el=[];
        el.push(this.hearts);
        el.push(this.heartLight);
        return el;
    }
    moveLastHeartY(pos){
        this.hearts[lives].position.y += pos;
        this.heartLight[lives].position.y += pos;
    }
    getLastHeartY(){
        return this.hearts[lives].position.y;
    }
}
import {GLTFLoader} from "gltf";
import {AnimationMixer} from "three";
import * as THREE from "three";

const loaderGLTF = new GLTFLoader();


export class ModelImporter {
    constructor() {
        this.elToAdd = 0;
        this.elementsLoaded = {};
    }

    async import(path) {
        this.importWithName(path,path)
    }

    async importWithName(path,name) {
        this.elToAdd++;
        await loaderGLTF.load(
            // resource URL
            path,
            // called when the resource is loaded
            (modello) => {
                this.elToAdd--;
                this.elementsLoaded[name] = modello.scene;
            },
            // called while loading is progressing
            (xhr) => {
                if (xhr.loaded === xhr.total) {
                    console.log("ModelImporter - loaded " + name);
                } else {
                    //console.log("ModelImporter - loading " + path);
                }
            },
            // called when loading has errors
            (error) => {
                console.log("ModelImporter - error:" + error);
            }
        );
    }

    everythingLoaded() {
        return this.elToAdd === 0;
    }

    getModel(pathOrName) {
        return this.elementsLoaded[pathOrName];
    }
}

export class AnimationManager {
    constructor(linker) {
        this.elToAdd = 0;
        this.animations = {};
        this.activeAction = null;
        this.lastAction = null;
        this.mixer = new AnimationMixer(linker);
        this.playing = false;
    }

    async import(path, name) {
        this.elToAdd++;
        await loaderGLTF.load(
            // resource URL
            path,
            // called when the resource is loaded
            (animation) => {
                this.elToAdd--;
                this.animations[name] = animation.animations[0];
            },
            // called while loading is progressing
            (xhr) => {
                if (xhr.loaded === xhr.total) {
                    console.log("AnimationImporter - loaded " + path);
                } else {
                    //console.log("AnimationImporter - loading " + path);
                }
            },
            // called when loading has errors
            (error) => {
                console.log("AnimationImporter - error:" + error);
            }
        );
    }

    everythingLoaded() {
        return this.elToAdd === 0;
    }

    isPlaying() {
        return this.playing
    }

    playAnimation(name) {
        this.activeAction = this.mixer.clipAction(this.animations[name]);
        this.activeAction.play();
        this.playing = true;
    }


    //TODO: FA MA MALE CHIEDI AL SAMMA
    lastCalled;
    transitionTo(name, time) {
        if (this.lastCalled!==name) {
            const nextAction = this.mixer.clipAction(this.animations[name]);
            this.activeAction.crossFadeTo(nextAction, time, false);
            setTimeout(() => {
                this.stopAll();
                this.playAnimation(name)
            }, time);
            this.playing = true;
        }

        this.lastCalled=name;

    }

    stopAll() {
        this.mixer.stopAllAction();
    }

    update(dt) {
        this.mixer.update(dt);
    }
}
import {GLTFLoader} from "gltf";
import {AnimationMixer} from "three";

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

    addShadows(pathOrName){
        this.elementsLoaded[pathOrName].traverse(function (node) {
            if (node.isMesh){
                node.castShadow=true;
                node.receiveShadow=true;
            }
        });
    }

    everythingLoaded() {
        return this.elToAdd === 0;
    }

    getModel(pathOrName) {
        return this.elementsLoaded[pathOrName];
    }

    clear(){
        this.elementsLoaded={};
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


    lastCalled;
    transitionTo(name, time) {
        if (this.lastCalled!==name) {

            this.lastAction=this.activeAction;
            this.activeAction = this.mixer.clipAction(this.animations[name]);


            this.lastAction.play();
            this.lastAction.crossFadeTo(this.activeAction, time, false);
            this.activeAction.enabled=true;
            this.activeAction.play();


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

    doOnce(name,time){
        const nextAction = this.mixer.clipAction(this.animations[name]);
        nextAction.clampWhenFinished=true;
        nextAction.repetitions=1;

        this.activeAction.crossFadeTo(nextAction, time, false);
        setTimeout(() => {
            this.stopAll();
            this.playAnimation(name)
            this.playing = false;
        }, time);
        this.playing = true;
        this.lastCalled=name;

    }

    transitionAndDoOnce(name,time){
        this.lastAction=this.activeAction;
        this.activeAction = this.mixer.clipAction(this.animations[name]);


        this.lastAction.play();
        this.lastAction.crossFadeTo(this.activeAction, time, false);
        this.activeAction.enabled=true;
        this.activeAction.clampWhenFinished=true;
        this.activeAction.repetitions=1;
        this.activeAction.play();

        this.playing = true;
    }
}
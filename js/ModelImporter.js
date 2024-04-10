import {GLTFLoader} from "gltf";
import {AnimationMixer} from "three";
import * as THREE from "three";
const loaderGLTF = new GLTFLoader();


export class ModelImporter {
    constructor(){
        this.elToAdd=0;
        this.elementsLoaded={};
    }

    async import(path) {
        this.elToAdd++;
        await loaderGLTF.load(
            // resource URL
            path,
            // called when the resource is loaded
            (modello) => {
                this.elToAdd--;
                this.elementsLoaded[path]=modello.scene;
            },
            // called while loading is progressing
            (xhr) => {
                if (xhr.loaded === xhr.total) {
                    console.log("ModelImporter - loaded " + path);
                } else {
                    console.log("ModelImporter - loading " + path );
                }
            },
            // called when loading has errors
            (error) => {
                console.log("ModelImporter - error:" + error);
            }
        );
    }

    everythingLoaded(){
        return this.elToAdd===0;
    }

    getModel(path){
        return this.elementsLoaded[path];
    }
}

export class AnimationManager {
    constructor(linker){
        this.elToAdd=0;
        this.animations={};
        this.mixer=new AnimationMixer(linker);

        this.currentAnimation=THREE.AnimationAction;
        this.playing=false;
    }

    async import(path,name) {
        this.elToAdd++;
        await loaderGLTF.load(
            // resource URL
            path,
            // called when the resource is loaded
            (animation) => {
                this.elToAdd--;
                this.animations[name]=animation.animations[0];
            },
            // called while loading is progressing
            (xhr) => {
                if (xhr.loaded === xhr.total) {
                    console.log("AnimationImporter - loaded " + path);
                } else {
                    console.log("AnimationImporter - loading " + path );
                }
            },
            // called when loading has errors
            (error) => {
                console.log("AnimationImporter - error:" + error);
            }
        );
    }
    everythingLoaded(){
        return this.elToAdd===0;
    }

    isPlaying(){
        return this.playing
    }

    playAnimation(name){
        this.currentAnimation=this.mixer.clipAction(this.animations[name]);
        this.currentAnimation.play();
        this.playing=true;
    }

    update(dt){
        this.mixer.update(dt);
    }
}
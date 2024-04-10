import {GLTFLoader} from "gltf";
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
                    console.log("ModeImporter - loaded " + path);
                } else {
                    console.log("ModeImporter - loading " + path );
                }

            },
            // called when loading has errors
            (error) => {
                console.log("ModeImporter - error:" + error);
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

class AnimationImporter {

}
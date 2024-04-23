import * as THREE from "three";
import {MeshPhysicalMaterial} from "three";
import {ModelImporter} from "./Importers.js";

const mi = new ModelImporter();

export class Board {
    constructor() {
        this.island = null;
        this.skybox = null;

        mi.importWithName("../models/worlda.glb","world");
        mi.importWithName("../models/skybox.glb","skybox");
    }

    readyToUse(){
        if (mi.everythingLoaded() && this.island===null){
            mi.addShadows("world");
            this.island = mi.getModel("world");
            this.skybox = mi.getModel("skybox");
            this.skybox.scale.set(0.5,0.5,0.5)
        }
        return mi.everythingLoaded();
    }

    getWorld(){
        return this.island;
    }

    getSkybox(){
        return this.skybox;
    }
}
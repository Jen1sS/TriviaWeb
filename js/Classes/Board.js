import * as THREE from "three";
import {MeshPhysicalMaterial} from "three";
import {ModelImporter} from "./Importers.js";
import * as CANNON from  "../../node_modules/cannon-es/dist/cannon-es.js"


let generated;
const mi = new ModelImporter();

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, 0, -9.82) // m/s²
});

export class Board {
    constructor() {
        this.island = null;
        this.skybox = null;

        mi.importWithName("../models/world.glb","world");
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
import * as THREE from 'three';
import {ModelImporter} from "./ModelImporter.js";

let mi = new ModelImporter();

export class Writer {
    constructor(pos) {
        this.pos = pos;
        this.lastReq = "";
        this.elements = []
        this.got = false;
    }

    write(text) {
        if (this.lastReq !== text) {
            this.got = false;
            mi.clear();
            this.elements = [];
            //for (let i = 0; i < text.length; i++) mi.importWithName("../models/heart.glb", i) //debug
            for (let i = 0; i < text.length; i++) mi.importWithName("../models/numbers/" + text.charAt(i) + ".glb", i)
        }
        this.lastReq = text;
    }

    ready() {
        return mi.everythingLoaded() && !this.got;
    }



    get(distance) {
        if (!this.got) {
            this.got = true;
            for (let i = 0; i < this.lastReq.length; i++) {
                this.elements.push(mi.getModel(i));
                this.elements[i].position.set(this.pos.x+i*distance,this.pos.y,this.pos.z);
                this.elements[i].rotation.x=-Math.PI/2;
                this.elements[i].scale.set(2,2,2);
            }
        }
        return this.elements;
    }
}
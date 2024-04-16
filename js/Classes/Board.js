import * as THREE from "three";
import {MeshPhysicalMaterial} from "three";
import {ModelImporter} from "./Importers.js";


let generated;
const mi = new ModelImporter();

export class Board {
    constructor() {
        this.cells = [];
        this.table = null;
        this.island = null;
        this.skybox = null;
        this.slices = {};
        this.ready = false;

        this.cellColor = [0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c, 0xfbff00, 0xd900ff, 0x1e00ff, 0x00f2ff, 0x00ff3c]
        this.cellG = new THREE.PlaneGeometry(0.5, 0.5, 1);
        this.cellM = [];
        this.cellP = [];

        this.tableG = new THREE.BoxGeometry(5.2, 5.5, 0.5);
        this.tableM = new THREE.MeshPhysicalMaterial({color: 0x7FD4FF});

        this.slicesG = new THREE.ConeGeometry(0.5, 1, 4);
        this.slicesM = [];

        mi.importWithName("../models/world.glb","world");
        mi.importWithName("../models/skybox.glb","skybox");
    }

    generate() {
        if (!generated && mi.everythingLoaded()) {
            generated = true;
            //#region Generazione Caselle
            for (let i = 0; i < this.cellColor.length; i++) this.cellM.push(new MeshPhysicalMaterial({
                color: this.cellColor[i],
                side: THREE.DoubleSide,
                metalness: 1
            }))

            for (let i = 0; i < this.cellColor.length; i++) {
                //Assegnamento materiale con colore per casella
                this.cellM.push(new MeshPhysicalMaterial({
                    color: this.cellColor[i],
                    side: THREE.DoubleSide,
                    metalness: 1
                }))

                //Creazione coordinate caselle
                switch (Math.floor(i / 9)) {
                    case 0:
                        this.cellP.push([(i / 2) - (this.cellColor.length / 18), 2, 2.5]);
                        break;
                    case 1:
                        this.cellP.push([this.cellP[8][0], 2, (this.cellP[8][2]) - ((i - 8) / 2)]);
                        break;
                    case 2:
                        if (i === 26) this.cellP.push([this.cellP[25][0], 2, (this.cellP[25][2]) + ((i - 25) / 2)]);
                        else this.cellP.push([(this.cellP[17][0]) - ((i - 17) / 2), 2, this.cellP[17][2]]);
                        break;
                    case 3:
                        this.cellP.push([this.cellP[25][0], 2, (this.cellP[25][2]) + ((i - 25) / 2)]);
                        break;
                }

                //Creazione modello e posizionamento
                this.cells.push(new THREE.Mesh(this.cellG, this.cellM[i]))
                this.cells[i].castShadow = false;
                this.cells[i].receiveShadow = true;
                this.cells[i].position.y = this.cellP[i][1];
                this.cells[i].position.x = this.cellP[i][0];
                this.cells[i].position.z = this.cellP[i][2];
                this.cells[i].rotation.x = Math.PI / 2;
            }
            //#endregion

            //#region Generazione Table
            //mi.addShadows("world")
            this.island = mi.getModel("world");
            this.skybox = mi.getModel("skybox")
            this.skybox.scale.set(0.5,0.5,0.5)

            this.table = new THREE.Mesh(this.tableG, this.tableM);
            this.table.castShadow = true;
            this.table.receiveShadow = true;
            this.table.rotateX(Math.PI / 2);
            this.table.position.x = 0.125;
            this.table.position.z = 0.2;
            this.table.position.y = 1.74;
            //#endregion

            //#region Generazione Slice
            const angle = 2 * Math.PI / 5;
            const radius = 0.55;
            const cx = 0.125;
            const cz = 0.2;

            for (let i = 0; i < 5; i++) {
                this.slicesM.push(new THREE.MeshPhysicalMaterial({color: this.cellColor[i]}));
                this.slices[this.cellColor[i]] = new THREE.Mesh(this.slicesG, this.slicesM[i]);

                //POSIZIONAMENTO IN UN CERCHIO
                this.slices[this.cellColor[i]].rotation.z = i * angle + Math.PI / 2;
                this.slices[this.cellColor[i]].rotation.x = Math.PI / 2;
                this.slices[this.cellColor[i]].position.set(cx + radius * Math.cos(i * angle), 1.49, cz + radius * Math.sin(i * angle))
                this.slices[this.cellColor[i]].castShadow = true

            }
            //#endregion
        }

    }

    readyToGenerate(){
        return mi.everythingLoaded();
    }

    hasGenerated(){
        return generated;
    }

    getCells(){
        return this.cells;
    }

    getTable(){
        return this.table;
    }

    getSlices(){
        const el = [];
        for (let i = 0; i < 5; i++) el.push(this.slices[this.cellColor[i]]);
        return el;
    }

    getSlice(color){
        return this.slices[color];
    }

    getWorld(){
        return this.island;
    }

    getSkybox(){
        return this.skybox;
    }

    getCellPosition(number){
        return this.cellP[number];
    }

    getColors(){
        return this.cellColor;
    }
}
import {Mesh} from "../../engine/core/Mesh";
import {SpherePrimitive} from "../../engine/geometries/SpherePrimitive";
import {Material} from "../../engine/materials/Material";
import { Texture } from "../../engine/textures/Texture";
import {GameObject} from "../core/GameObject";
import * as CANNON from "cannon-es"
import {quat} from "gl-matrix";

export class Sky extends GameObject {
    body?: CANNON.Body;

    constructor() {
        super({
            name: "Sky sphere",
            // Invert one of the axis, so that the vertices face
            // towards the player (will not be culled).
            scale: [1, 1, -1],
            mesh: new Mesh({
                primitives: [
                    new SpherePrimitive({
                        radius: 20,
                        subdivisionsAxis: 10,
                        subdivisionsHeight: 10
                    })
                ]
            })
        });
    }

    async start(): Promise<void> {
        // A hack to make the sky brighter.
        const brightnessFactor = 5;
        this.mesh.setMaterial(new Material({
            baseColorFactor: [brightnessFactor, brightnessFactor, brightnessFactor, brightnessFactor],
            baseColorTexture: new Texture({
                image: await this.fetchImage("./models/sky.jpg")
            }),
        }));

        // At the top and bottom of the sphere the texture is weirdly mapped.
        // Rotate it by 90deg so that part isn't visible from the labyrinth floor.
        quat.fromEuler(this.rotation, 90, 0, 0);
        this.updateMatrix();
    }

    update(dt: number, time: number): void {
        // TODO: Animate - rotate the sky slowly?
    }

    private fetchImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', e => resolve(image));
            image.addEventListener('error', reject);
            image.src = new URL(url, window.location.origin).toString();
        });
    }


}

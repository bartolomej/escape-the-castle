import {GameObject} from "../core/GameObject";
import {Object3D} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";

export type FloorOptions = {
    physicsMaterial: CANNON.Material;
}

export class Floor extends GameObject {
    public body: CANNON.Body;
    private readonly physicsMaterial: CANNON.Material;

    constructor(object: Object3D, options: FloorOptions) {
        super();
        Object.assign(this, object);
        this.physicsMaterial = options.physicsMaterial;
    }

    async load(): Promise<void> {
        this.body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            position: new CANNON.Vec3(...this.translation),
            material: this.physicsMaterial,
            // TODO: Why doesn't the below rotation work?
            // quaternion: new CANNON.Quaternion(...this.rotation),
            // Make the floor face up towards Z-direction.
            quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
            shape: new CANNON.Plane()
        });
    }

    update(): void {
        this.translation = this.body.position.toArray();
        this.updateMatrix();
    }

}

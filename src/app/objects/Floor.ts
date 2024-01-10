import {GameObject} from "../core/GameObject";
import {Object3D} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";
import {BufferView} from "../../engine/core/BufferView";

export class Floor extends GameObject {
    public body: CANNON.Body;

    constructor(object: Object3D) {
        super();
        Object.assign(this, object);
    }

    async start(): Promise<void> {
        this.body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            position: new CANNON.Vec3(...this.translation),
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

import {GameObject} from "../core/GameObject";
import {Object3D} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";
import {BufferView} from "../../engine/core/BufferView";
import {meshToCannonShape} from "../utils";

type WallOptions = {
    physicsMaterial: CANNON.Material;
}

export class Door extends GameObject {
    public body: CANNON.Body;
    private readonly physicsMaterial: CANNON.Material;

    constructor(object: Object3D, options: WallOptions) {
        super();
        Object.assign(this, object);
        this.physicsMaterial = options.physicsMaterial;
    }

    async start(): Promise<void> {
        // Approximate dimensions obtained by resetting the root node transformations
        // and comparing the true door size against other objects in the scene
        // with known dimensions (e.g. sky sphere).
        const originalDimensions = new CANNON.Vec3(10, 20, 3);
        const scaledDimensions = originalDimensions.vmul(new CANNON.Vec3(...this.scale));
        const shape = new CANNON.Box(scaledDimensions);

        this.body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
            shape
        });
    }

    update(): void {
        this.translation = this.body.position.toArray();
        this.updateMatrix();
    }

}

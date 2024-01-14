import {GameObject} from "../core/GameObject";
import {Object3D} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";
import {BufferView} from "../../engine/core/BufferView";
import {meshToCannonShape} from "../utils";

type WallOptions = {
    physicsMaterial: CANNON.Material;
}

export class Wall extends GameObject {
    public body: CANNON.Body;
    private readonly physicsMaterial: CANNON.Material;

    constructor(object: Object3D, options: WallOptions) {
        super();
        Object.assign(this, object);
        this.physicsMaterial = options.physicsMaterial;

        const shape = meshToCannonShape(this.mesh);

        shape.setScale(new CANNON.Vec3(...this.scale));

        this.body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
            shape
        });
    }

    async start(): Promise<void> {}

    update(): void {
        this.translation = this.body.position.toArray();
        this.updateMatrix();
    }

}

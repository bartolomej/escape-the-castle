import {GameObject, GameObjectOptions} from "../core/GameObject";
import * as CANNON from "cannon-es";
import {Mesh} from "../../engine/core/Mesh";
import {CubePrimitive} from "../../engine/geometries/CubePrimitive";

export class Cube extends GameObject {
    public body: CANNON.Body;

    constructor(options: GameObjectOptions) {
        super(options);
        this.name = options.name ?? "Cube";
    }

    async load(): Promise<void> {
        const size = 1;

        this.mesh = new Mesh({
            primitives: [
                new CubePrimitive({
                    size,
                })
            ]
        });

        this.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Box(new CANNON.Vec3(size, size, size)),
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
        });
    }

    update(): void {
        this.translation = this.body.position.toArray();
        this.updateMatrix();
    }

}

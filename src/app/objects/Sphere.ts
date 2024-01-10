import {GameObject, GameObjectOptions} from "../core/GameObject";
import {Mesh} from "../../engine/core/Mesh";
import {SpherePrimitive} from "../../engine/geometries/SpherePrimitive";
import * as CANNON from "cannon-es";

export class Sphere extends GameObject {
    public body: CANNON.Body;

    constructor(options: GameObjectOptions) {
        super(options);
        this.name = options.name ?? "Sphere";
    }

    async start(): Promise<void> {
        const radius = 1;

        this.mesh = new Mesh({
            primitives: [
                new SpherePrimitive({
                    radius,
                    subdivisionsHeight: 100,
                    subdivisionsAxis: 100
                })
            ]
        });

        this.body = new CANNON.Body({
            mass: 0.01,
            shape: new CANNON.Sphere(radius),
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
        });
    }

    update(): void {
        this.translation = this.body.position.toArray();
        this.updateMatrix();
    }

}

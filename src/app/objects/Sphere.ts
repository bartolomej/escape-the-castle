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
            mass: 5,
            shape: new CANNON.Sphere(radius),
        });

        this.body.angularVelocity.set(0, 10, 0)
        this.body.angularDamping = 0.5
    }

    update(): void {}

}

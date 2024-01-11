import {GameObject, GameObjectOptions} from "../core/GameObject";
import {Mesh} from "../../engine/core/Mesh";
import {SpherePrimitive} from "../../engine/geometries/SpherePrimitive";
import * as CANNON from "cannon-es";

export type SphereOptions = GameObjectOptions & {
    physicsMaterial: CANNON.Material;
    radius: number;
}

export class Sphere extends GameObject {
    public body: CANNON.Body;
    private readonly physicsMaterial: CANNON.Material;
    private readonly radius: number;

    constructor(options: SphereOptions) {
        super(options);
        this.name = options.name ?? "Sphere";
        this.physicsMaterial = options.physicsMaterial;
        this.radius = options.radius;
    }

    async start(): Promise<void> {

        this.mesh = new Mesh({
            primitives: [
                new SpherePrimitive({
                    radius: this.radius,
                    subdivisionsHeight: 100,
                    subdivisionsAxis: 100
                })
            ]
        });

        this.body = new CANNON.Body({
            mass: 0.01,
            material: this.physicsMaterial,
            shape: new CANNON.Sphere(this.radius),
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
        });
    }

    update(): void {
        this.translation = this.body.position.toArray();
        this.updateMatrix();
    }

}

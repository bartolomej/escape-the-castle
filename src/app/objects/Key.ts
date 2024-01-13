import {GameObject, GameObjectOptions} from "../core/GameObject";
import {Object3D} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";
import {meshToCannonShape} from "../utils";

type KeyOptions = GameObjectOptions & {
    physicsMaterial: CANNON.Material;
}

export class Key extends GameObject {
    public body: CANNON.Body;
    private readonly physicsMaterial: CANNON.Material;
    private readonly shape: CANNON.Shape;

    constructor(object: Object3D, options: KeyOptions) {
        super();
        Object.assign(this, {...object, ...options});
        this.physicsMaterial = options.physicsMaterial;
    }

    async start(): Promise<void> {
        //const shape = meshToCannonShape(this.mesh);
        //const shape = new CANNON.Box(new CANNON.Vec3(...this.scale));
        const shape = new CANNON.Sphere(0.2);
        //shape.setScale(new CANNON.Vec3(...this.scale));

        this.body = new CANNON.Body({
            // TODO: Collision with walls (labyrinth) don't work properly (but they do with the player object)
            mass: 0.01,
            material: this.physicsMaterial,
            //position: new CANNON.Vec3(...this.generateCoordinates().toArray()/*...this.translation*/),
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
            shape
        });
    }

    update(): void {
        this.translation = this.body.position.toArray();
        this.rotation = this.body.quaternion.toArray();
        this.updateMatrix();

        this.pickedUp();
    }

    generateCoordinates(): CANNON.Vec3 {
        const x = Math.floor(Math.random() * 5) + 1;
        const z = Math.floor(Math.random() * 5) + 1;
        return new CANNON.Vec3(x, 0.25, z);
    }

    pickedUp(): void {

        this.body.addEventListener("collide", () => {
            //console.log("collide");
            //this.body.position = new CANNON.Vec3(...this.generateCoordinates().toArray()/*...this.translation*/)
        });
    }
}

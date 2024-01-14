import {GameObject, GameObjectOptions} from "../core/GameObject";
import {Object3D} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";
import {quat} from "gl-matrix";
import { Howl } from "howler";

type KeyOptions = GameObjectOptions & {
    physicsMaterial: CANNON.Material;
}

export class Key extends GameObject {
    public body: CANNON.Body;
    private readonly physicsMaterial: CANNON.Material;

    private sound = new Howl({
        src: ['./sounds/kill_sound.mp3'],
        html5: true,
        volume: 1,
    });

    constructor(object: Object3D, options: KeyOptions) {
        super();
        Object.assign(this, {...object, ...options});
        this.physicsMaterial = options.physicsMaterial;
    }

    async load(): Promise<void> {
        // This is the smallest sphere size that doesn't fall
        // thought the floor trimesh when being dropped from the sky.
        // Lowering this will make it too small for the current simulation precision.
        const smallestSizeWithRealTimeSimulation = 0.15;

        // Ideally this key would be modeled as a trimesh or box shape,
        // but collisions between trimesh <-> trimesh and trimesh <-> box aren't supported yet.
        // See:
        // - https://github.com/pmndrs/cannon-es/issues/21
        // - https://pmndrs.github.io/cannon-es/docs/#supported-shape-collision-pairs
        const shape = new CANNON.Sphere(smallestSizeWithRealTimeSimulation);

        this.body = new CANNON.Body({
            mass: 0.01,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
            shape
        });
    }

    update(dt: number, time: number): void {
        // Don't use the rotation from physical body,
        // as we want the rendered key to be static.
        this.translation = this.body.position.toArray();

        // Animate horizontal key rotation.
        const rotationX = (time * 100) % 360;
        quat.fromEuler(this.rotation, rotationX, 0, -90);

        this.updateMatrix();
    }

    despawn(): void {
        this.body.position = new CANNON.Vec3(0, -10, 0);
        this.body.mass = 0;
        this.sound.play();
    }
}

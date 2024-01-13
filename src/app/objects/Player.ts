import {GameObjectOptions} from "../core/GameObject";
import {PerspectiveCamera} from "../../engine/cameras/PerspectiveCamera";
import {quat, vec3} from "gl-matrix";
import * as CANNON from "cannon-es"
import {Sphere} from "./Sphere";

type PlayerOptions = GameObjectOptions & {
    physicsMaterial: CANNON.Material;
}

export class Player extends Sphere {
    public body: CANNON.Body;
    public controls: PlayerControls;
    public camera: PerspectiveCamera;

    constructor(options: PlayerOptions) {
        super({
            ...options,
            name: "Player",
            radius: 0.2,
            mass: 10
        });
        this.camera = new PerspectiveCamera({
            fov: 1.8,
            // Must be small enough so that player can't see through walls when it touches them.
            near: 0.05
        });

        this.addChild(this.camera);
    }


    async start(): Promise<void> {
        await super.start();

        this.controls = new PlayerControls(this.body);
    }

    update(dt: number, time: number): void {
        this.controls.update();
        const [x,y,z] = this.controls.rotation.map((x: number) => x * 180 / Math.PI);
        this.camera.rotation = quat.fromEuler(quat.create(), x, y, z);
        this.camera.updateMatrix();
        super.update(dt, time);
    }
}

type PlayerControlsOptions = {
    velocityFactor?: number,
    mouseSensitivity?: number,
}

class PlayerControls {
    private readonly pressedKeys: { [key: string]: boolean };
    public velocityFactor: number;
    private mouseSensitivity: number;
    public rotation: vec3 = [0,0,0]; // euler rotation vector with angles x,y,z

    constructor (private readonly body: CANNON.Body, options: PlayerControlsOptions = {}) {
        this.velocityFactor = options.velocityFactor ?? 0.04;
        this.mouseSensitivity = options.mouseSensitivity || 0.01;

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.pressedKeys = {};
    }

    update () {
        const { body, velocityFactor, rotation } = this;

        const forward = vec3.fromValues(-Math.sin(rotation[1]), 0, -Math.cos(rotation[1]));
        const right = vec3.fromValues(Math.cos(rotation[1]), 0, -Math.sin(rotation[1]));
        const up = vec3.fromValues(0, 5, 0);

        const inputVelocity = vec3.create();
        if (this.pressedKeys['KeyW']) {
            vec3.add(inputVelocity, inputVelocity, forward);
        }
        if (this.pressedKeys['KeyS']) {
            vec3.sub(inputVelocity, inputVelocity, forward);
        }
        if (this.pressedKeys['KeyD']) {
            vec3.add(inputVelocity, inputVelocity, right);
        }
        if (this.pressedKeys['KeyA']) {
            vec3.sub(inputVelocity, inputVelocity, right);
        }
        if (this.pressedKeys['Space']) {
            vec3.add(inputVelocity, inputVelocity, up);
        }

        vec3.scale(inputVelocity, inputVelocity, velocityFactor);


        body.velocity = body.velocity.vadd(new CANNON.Vec3(...inputVelocity));
    }

    enable () {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable () {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.pressedKeys) {
            this.pressedKeys[key] = false;
        }
    }

    private mousemoveHandler (e: MouseEvent) {
        const dx = e.movementX;
        const dy = e.movementY;
        const { rotation, mouseSensitivity } = this;

        rotation[0] -= dy * mouseSensitivity;
        rotation[1] -= dx * mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (rotation[0] > halfpi) {
            rotation[0] = halfpi;
        }
        if (rotation[0] < -halfpi) {
            rotation[0] = -halfpi;
        }

        rotation[1] = ((rotation[1] % twopi) + twopi) % twopi;
    }

    private keydownHandler (e: KeyboardEvent) {
        this.pressedKeys[e.code] = true;
    }

    private keyupHandler (e: KeyboardEvent) {
        this.pressedKeys[e.code] = false;
    }

}

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
            radius: 0.2
        });
        this.camera = new PerspectiveCamera({
            fov: 1.8,
        });

        this.addChild(this.camera);
    }


    async start(): Promise<void> {
        await super.start();

        this.controls = new PlayerControls(this.body);
    }

    update(dt: number, time: number): void {
        this.controls.update(dt);
        const [x,y,z] = this.controls.rotation.map((x: number) => x * 180 / Math.PI);
        this.camera.rotation = quat.fromEuler(quat.create(), x, y, z);
        this.camera.updateMatrix();
        super.update(dt, time);
    }
}

type PlayerControlsOptions = {
    velocity?: vec3,
    friction?: number,
    acceleration?: number,
    maxSpeed?: number,
    mouseSensitivity?: number,
}

class PlayerControls {
    private readonly keys: { [key: string]: boolean };
    public velocity: vec3;
    private friction: number;
    private acceleration: number;
    private maxSpeed: number;
    private mouseSensitivity: number;
    public rotation: vec3 = [0,0,0]; // euler rotation vector with angles x,y,z

    constructor (private readonly body: CANNON.Body, options: PlayerControlsOptions = {}) {
        this.velocity = options.velocity || vec3.create();
        this.friction = options.friction || 0.2;
        this.acceleration = options.acceleration || 1;
        this.maxSpeed = options.maxSpeed || 5;
        this.mouseSensitivity = options.mouseSensitivity || 0.01;

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
    }

    update (dt: number) {
        const { body, velocity, acceleration, friction, maxSpeed, rotation } = this;

        const forward = vec3.fromValues(-Math.sin(rotation[1]), 0, -Math.cos(rotation[1]));
        const right = vec3.fromValues(Math.cos(rotation[1]), 0, -Math.sin(rotation[1]));

        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        const inputVelocity = vec3.scale(vec3.create(), acc, dt);
        // vec3.scaleAndAdd(velocity, velocity, acc, dt * acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA']) {
            // vec3.scale(velocity, velocity, 1 - friction);
        }

        // 4: limit speed
        const len = vec3.len(velocity);
        if (len > maxSpeed) {
            // vec3.scale(velocity, velocity, maxSpeed / len);
        }


        // 5: update translation
        body.velocity = body.velocity.vadd(new CANNON.Vec3(...inputVelocity));
        // body.position.addScaledVector(dt, new CANNON.Vec3(...velocity));
        // vec3.scaleAndAdd(object.translation, object.translation, velocity, dt);

        // 6: update the final transform
        // object.updateMatrix();
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

        for (let key in this.keys) {
            this.keys[key] = false;
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


        // TODO: Update transform of the object/camera?
    }

    private keydownHandler (e: KeyboardEvent) {
        this.keys[e.code] = true;
    }

    private keyupHandler (e: KeyboardEvent) {
        this.keys[e.code] = false;
    }

}

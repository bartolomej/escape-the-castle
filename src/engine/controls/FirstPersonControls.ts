import { mat4, quat, vec3 } from "gl-matrix";
import { Object3D } from "../core/Object3D";
import {Camera} from "../cameras/Camera";

type FirstPersonControlsOptions = {
  velocity?: vec3,
  friction?: number,
  acceleration?: number,
  maxSpeed?: number,
  mouseSensitivity?: number,
}

export default class FirstPersonControls {
  private readonly keys: { [key: string]: boolean };
  public velocity: vec3;
  private friction: number;
  private acceleration: number;
  private maxSpeed: number;
  private mouseSensitivity: number;
  private rotation: vec3 = [0,0,0]; // euler rotation vector with angles x,y,z

  constructor (private readonly object: Object3D, options: FirstPersonControlsOptions = {}) {
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
    const { object, velocity, acceleration, friction, maxSpeed, rotation } = this;

    const forward = vec3.set(vec3.create(),
      -Math.sin(rotation[1]), 0, -Math.cos(rotation[1]));
    const right = vec3.set(vec3.create(),
      Math.cos(rotation[1]), 0, -Math.sin(rotation[1]));

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
    vec3.scaleAndAdd(velocity, velocity, acc, dt * acceleration);

    // 3: if no movement, apply friction
    if (!this.keys['KeyW'] &&
      !this.keys['KeyS'] &&
      !this.keys['KeyD'] &&
      !this.keys['KeyA']) {
      vec3.scale(velocity, velocity, 1 - friction);
    }

    // 4: limit speed
    const len = vec3.len(velocity);
    if (len > maxSpeed) {
      vec3.scale(velocity, velocity, maxSpeed / len);
    }

    // 5: update translation
    vec3.scaleAndAdd(object.translation, object.translation, velocity, dt);

    // 6: update the final transform
    const t = object.matrix;
    mat4.identity(t);
    mat4.translate(t, t, object.translation);
    mat4.rotateY(t, t, object.rotation[1]);
    mat4.rotateX(t, t, object.rotation[0]);
    object.updateMatrix();
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
    const { object, rotation, mouseSensitivity } = this;

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

    const [x,y,z] = rotation.map((x: number) => x * 180 / Math.PI);
    const q = quat.fromEuler(quat.create(), x, y, z);
    const v = vec3.clone(object.translation);
    const s = vec3.clone(object.scale);
    mat4.fromRotationTranslationScale(object.matrix, q, v, s);

    object.updateTransform();
  }

  private keydownHandler (e: KeyboardEvent) {
    this.keys[e.code] = true;
  }

  private keyupHandler (e: KeyboardEvent) {
    this.keys[e.code] = false;
  }

}

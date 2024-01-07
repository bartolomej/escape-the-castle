import {vec3} from "gl-matrix";
import {Object3D, Object3DOptions} from "../core/Object3D";

export type LightOptions = Partial<Light> & Object3DOptions;

export class Light extends Object3D {
  color: vec3;
  direction: vec3;

  constructor(options: LightOptions = {}) {
    super(options);
    this.name = "Light";
    this.color = options.color ?? [0, 0, 0];
    this.direction = options.direction ?? [0, 0, 0];
  }

}

import {vec3} from "gl-matrix";
import {Object3D, Object3DOptions} from "../core/Object3D";

export type LightOptions = Partial<Light> & Object3DOptions;

export class Light extends Object3D {
  ambientColor: vec3;
  diffuseColor: vec3;
  specularColor: vec3;
  attenuatuion: vec3;
  shininess: number;

  constructor(options: LightOptions = {}) {
    super(options);
    this.name = "Light";
    this.ambientColor = options.ambientColor ?? [51, 51, 51];
    this.diffuseColor = options.diffuseColor ?? [0, 0, 0];
    this.specularColor = options.specularColor ?? [0, 0, 0];
    this.attenuatuion = options.attenuatuion ?? [1.0, 0, 0.02];
    this.shininess = options.shininess ?? 10;
  }

}

import {Light} from "./Light";
import {vec3} from "gl-matrix";
import {Object3DOptions} from "../core/Object3D";

export type DirectionalLightOptions = Object3DOptions & {
    direction?: vec3;
    color?: vec3;
};

// Default light direction is from top to bottom.
const defaultDirection: vec3 = [0, 1, 0];

export class DirectionalLight extends Light {
    direction: vec3;

    constructor(options: DirectionalLightOptions = {}) {
        super(options);
        this.name = "DirectionalLight";
        this.color = options.color ?? [50, 50, 50];
        this.direction = options.direction ?? defaultDirection;
    }
}

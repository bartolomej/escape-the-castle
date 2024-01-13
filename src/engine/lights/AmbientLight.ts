import {Light, LightOptions} from "./Light";
import {vec3} from "gl-matrix";

type AmbientLightOptions = Partial<LightOptions> & {
    color?: vec3;
}

export class AmbientLight extends Light {
    constructor(options: AmbientLightOptions) {
        super(options);
        this.name = options.name ?? "AmbientLight";
        this.color = options.color ?? [51, 51, 51];
    }
}

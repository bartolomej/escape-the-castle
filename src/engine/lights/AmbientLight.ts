import {Light, LightOptions} from "./Light";
import {vec3} from "gl-matrix";

type AmbientLightOptions = Partial<Pick<LightOptions, "name">> & {
    color?: vec3;
}

export class AmbientLight extends Light {
    constructor(options: AmbientLightOptions) {
        super();

        this.name = options.name ?? "AmbientLight";
        this.ambientColor = options.color ?? [51, 51, 51];
    }
}

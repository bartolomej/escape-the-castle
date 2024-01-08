import {Light, LightOptions} from "./Light";

type PointLightOptions = LightOptions;

export class PointLight extends Light {
    constructor(options: PointLightOptions) {
        super(options);
    }
}

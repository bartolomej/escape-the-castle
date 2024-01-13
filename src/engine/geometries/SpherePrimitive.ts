import {primitives} from "twgl.js";
import {TwglPrimitive} from "./TwglPrimitive";
import {PrimitiveOptions} from "../core/Primitive";

type SphereGeometryOptions = PrimitiveOptions & {
    radius: number;
    // Number of steps around the sphere
    subdivisionsAxis: number;
    // Number of steps vertically on the sphere.
    subdivisionsHeight: number;
}


export class SpherePrimitive extends TwglPrimitive {
    constructor(options: SphereGeometryOptions) {
        super({
            ...options,
            vertices: primitives.createSphereVertices(
                options.radius,
                options.subdivisionsAxis,
                options.subdivisionsHeight
            )
        });
    }
}

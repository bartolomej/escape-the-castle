import {primitives} from "twgl.js";
import {TwglPrimitive} from "./TwglPrimitive";
import {PrimitiveOptions} from "../core/Primitive";

type CubePrimitiveOptions = PrimitiveOptions & {
    size: number;
}

export class CubePrimitive extends TwglPrimitive {
    constructor(options: CubePrimitiveOptions) {
        super({
            ...options,
            vertices: primitives.createCubeVertices(options.size),
        });
    }
}

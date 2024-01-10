import {primitives} from "twgl.js";
import {TwglPrimitive} from "./TwglPrimitive";

type CubePrimitiveOptions ={
    size: number;
}

export class CubePrimitive extends TwglPrimitive {
    constructor(options: CubePrimitiveOptions) {
        super(primitives.createCubeVertices(options.size));
    }
}

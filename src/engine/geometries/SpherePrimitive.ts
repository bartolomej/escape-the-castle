import {primitives} from "twgl.js";
import {Primitive, PrimitiveAttributeName} from "../core/Primitive";
import {Accessor} from "../core/Accessor";
import {BufferView} from "../core/BufferView";
import ArrayBufferView = NodeJS.ArrayBufferView;

type SphereGeometryOptions = {
    radius: number;
    // Number of steps around the sphere
    subdivisionsAxis: number;
    // Number of steps vertically on the sphere.
    subdivisionsHeight: number;
}


export class SpherePrimitive extends Primitive {
    constructor(options: SphereGeometryOptions) {
        // See: https://github.com/greggman/twgl.js/blob/956fafcb74dcfbd6e667b4aa23cee09b8cfaa690/src/primitives.js#L567-L640
        const vertices = primitives.createSphereVertices(
            options.radius,
            options.subdivisionsAxis,
            options.subdivisionsHeight
        );
        const attributes: Record<PrimitiveAttributeName, Accessor> = {
            POSITION: new Accessor({
                numComponents: 3,
                componentType: 5126,
                count: vertices.position.length,
                bufferView: bufferViewFromTypedArray(vertices.position as never)
            }),
            NORMAL: new Accessor({
                numComponents: 3,
                componentType: 5126,
                count: vertices.normal.length,
                bufferView: bufferViewFromTypedArray(vertices.normal as never)
            }),
            TEXCOORD_0: new Accessor({
                numComponents: 2,
                componentType: 5126,
                count: vertices.texcoord.length,
                bufferView: bufferViewFromTypedArray(vertices.texcoord as never)
            }),
        }

        function bufferViewFromTypedArray(typedArray: ArrayBufferView) {
            return new BufferView({
                buffer: typedArray.buffer,
                byteLength: typedArray.byteLength,
                byteOffset: typedArray.byteOffset,
                byteStride: 0
            })
        }
        super({
            indices: new Accessor({
                numComponents: 3,
                componentType: 5123,
                count: vertices.indices.length,
                bufferView: bufferViewFromTypedArray(vertices.indices as never)
            }),
            attributes
        })
    }
}

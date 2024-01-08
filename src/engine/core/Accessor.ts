import {BufferView} from "./BufferView";

/**
 * An accessor object refers to a bufferView and contains properties that define the type and layout of the data of this bufferView.
 * See: https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_005_BuffersBufferViewsAccessors.md#accessors
 */
export class Accessor {
    bufferView: BufferView;
    byteOffset: number;
    // https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#accessor-data-types
    componentType: number;
    normalized: boolean;
    count: number;
    numComponents: number;
    min: number;
    max: number;

    constructor(options: Partial<Accessor>) {
        this.bufferView = options.bufferView || null;
        this.byteOffset = options.byteOffset || 0;
        this.componentType = options.componentType || 5120;
        this.normalized = options.normalized || false;
        this.count = options.count || 0;
        this.numComponents = options.numComponents || 0;
        this.min = options.min || null;
        this.max = options.max || null;
    }

}

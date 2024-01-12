import * as CANNON from "cannon-es";
import {BufferView} from "../engine/core/BufferView";
import {Mesh} from "../engine/core/Mesh";

export function meshToCannonShape(mesh: Mesh): CANNON.Trimesh {
    // We can assume there will only be a single primitive on imported objects.
    // Later we should maybe refactor it so that mesh = primitive.
    if (mesh.primitives.length > 1) {
        throw new Error(`Expected a single primitive per mesh, got: ${JSON.stringify(mesh.primitives)}`)
    }
    const primitive = mesh.primitives[0];

    return new CANNON.Trimesh(
        getVertices(primitive.attributes.POSITION.bufferView),
        getIndices(primitive.indices.bufferView),
    );
}

function getVertices(bufferView: BufferView) {
    const float32View = new Float32Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength / Float32Array.BYTES_PER_ELEMENT);
    return Array.from(float32View);
}

function getIndices(bufferView: BufferView) {
    const uint16View = new Uint16Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength / Uint16Array.BYTES_PER_ELEMENT);
    return Array.from(uint16View);
}

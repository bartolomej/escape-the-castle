import {GameObject} from "../core/GameObject";
import {Object3D} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";
import {BufferView} from "../../engine/core/BufferView";

export class Wall extends GameObject {
    public body: CANNON.Body;

    constructor(object: Object3D) {
        super();
        Object.assign(this, object);
    }

    async start(): Promise<void> {
        // We can assume there will only be a single primitive on imported objects.
        // Later we should maybe refactor it so that mesh = primitive.
        if (this.mesh.primitives.length > 1) {
            throw new Error("Expected a single primitive per mesh")
        }
        const primitive = this.mesh.primitives[0];

        this.body = new CANNON.Body({
            type: CANNON.BODY_TYPES.STATIC,
            position: new CANNON.Vec3(...this.translation),
            quaternion: new CANNON.Quaternion(...this.rotation),
            shape: new CANNON.Trimesh(
                getVertices(primitive.attributes.POSITION.bufferView),
                getIndices(primitive.indices.bufferView),
            )
        });
    }

    update(): void {
        this.translation = this.body.position.toArray();
        this.updateMatrix();
    }

}

function getVertices(bufferView: BufferView) {
    const float32View = new Float32Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength / Float32Array.BYTES_PER_ELEMENT);
    return Array.from(float32View);
}

function getIndices(bufferView: BufferView) {
    const uint16View = new Uint16Array(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength / Uint16Array.BYTES_PER_ELEMENT);
    return Array.from(uint16View);
}

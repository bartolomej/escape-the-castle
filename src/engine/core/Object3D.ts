import { vec3, mat4, quat } from 'gl-matrix';
import {Mesh} from "./Mesh";

export type Object3DOptions = Partial<Omit<Object3D, "parent">>

export type TraversalOptions = {
    onEnter?: (object: Object3D) => void;
    onLeave?: (object: Object3D) => void;
}

export class Object3D {
    translation: vec3;
    rotation: quat;
    scale: vec3;
    matrix: mat4;
    children: Object3D[];
    name: string;
    parent: Object3D | null;
    mesh: Mesh;

    constructor(options: Object3DOptions = {}) {
        this.name = options.name ?? "Object3D";

        this.translation = options.translation
            ? vec3.clone(options.translation)
            : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation
            ? quat.clone(options.rotation)
            : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale
            ? vec3.clone(options.scale)
            : vec3.fromValues(1, 1, 1);
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();

        if (options.matrix) {
            this.updateTransform();
        } else if (options.translation || options.rotation || options.scale) {
            this.updateMatrix();
        }

        this.mesh = options.mesh || null;

        this.children = options.children ?? [];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;
    }

    /**
     * Traverses the current node and all it's descendants.
     */
    traverse(options: TraversalOptions) {
        options?.onEnter?.(this);
        for (const child of this.children) {
            child.traverse(options);
        }
        options?.onLeave?.(this)
    }

    updateTransform() {
        mat4.getRotation(this.rotation, this.matrix);
        mat4.getTranslation(this.translation, this.matrix);
        mat4.getScaling(this.scale, this.matrix);
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale);
    }


    getGlobalTransform(): mat4 {
        if (!this.parent) {
            return mat4.clone(this.matrix);
        } else {
            let transform = this.parent.getGlobalTransform();
            return mat4.mul(transform, transform, this.matrix);
        }
    }

    addChild(node: Object3D) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node: Object3D) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    clone(): Object3D {
        return new Object3D({
            ...this,
            children: this.children.map(child => child.clone()),
        });
    }

}

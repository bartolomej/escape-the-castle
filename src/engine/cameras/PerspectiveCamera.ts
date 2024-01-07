import {mat4} from "gl-matrix"

import {Camera, CameraOptions} from './Camera';

export type PerspectiveCameraOptions = CameraOptions & {
    aspect?: number;
    fov?: number;
    near?: number;
    far?: number;
}

export class PerspectiveCamera extends Camera {
    aspect: number;
    fov: number;
    near: number;
    far: number;

    constructor(options: PerspectiveCameraOptions = {}) {
        super(options);

        this.aspect = options.aspect ?? 1.5;
        this.fov = options.fov ?? 1.5;
        this.near = options.near ?? 0.1;
        this.far = options.far ?? Infinity;
        this.projection = mat4.create();

        this.updateProjection();
    }

    updateProjection() {
        mat4.perspective(this.projection,
            this.fov, this.aspect,
            this.near, this.far);
    }

}

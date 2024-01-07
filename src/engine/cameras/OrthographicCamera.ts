import {mat4} from "gl-matrix"

import {Camera, CameraOptions} from './Camera';

type OrthographicCameraOptions = CameraOptions & {
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
    near?: number;
    far?: number;
}

export class OrthographicCamera extends Camera {
    public left: number;
    public right: number;
    public bottom: number;
    public top: number;
    public near: number;
    public far: number;

    constructor(options: OrthographicCameraOptions = {}) {
        super(options);

        this.left = options.left ?? -1;
        this.right = options.right ?? 1;
        this.bottom = options.bottom ?? -1;
        this.top = options.top ?? 1;
        this.near = options.near ?? -1;
        this.far = options.far ?? 1;
        this.projection = mat4.create();

        this.updateProjection();
    }

    updateProjection() {
        mat4.ortho(this.projection,
            this.left, this.right,
            this.bottom, this.top,
            this.near, this.far);
    }

}

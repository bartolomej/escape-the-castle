import {mat4} from "gl-matrix"

import { Camera } from './Camera.js';

export class PerspectiveCamera extends Camera {

    constructor(options = {}) {
        super(options);

        this.aspect = options.aspect || 1.5;
        this.fov = options.fov || 1.5;
        this.near = options.near || 1;
        this.far = options.far || Infinity;
        this.projection = mat4.create();

        this.updateMatrix();
    }

    updateMatrix() {
        super.updateMatrix();
        mat4.perspective(this.projection,
            this.fov, this.aspect,
            this.near, this.far);
    }

}

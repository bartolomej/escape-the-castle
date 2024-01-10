import { vec3 } from 'gl-matrix';
import { Object3D } from './Object3D';

class KeyObject extends Object3D {

    name: string;
    model: string;
    translation: vec3;
    position: { x: number, y: number, z: number };

    constructor() {
        super();
        // Additional initialization code for KeyObject
        this.name = "Key";
        this.translation = [0, 1, -5];
        this.model = "./models/key.gltf";

        // Position: X and Y are random between 0 and 20, keep Z at 0 for now
        this.position = {
            x: Math.random() * 20,
            y: Math.random() * 20,
            z: 0
        };
    }

    Update(): void {

    }
}

export default KeyObject;

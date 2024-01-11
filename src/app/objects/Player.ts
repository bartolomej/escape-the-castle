import {GameObjectOptions} from "../core/GameObject";
import FirstPersonControls from "../../engine/controls/FirstPersonControls";
import {PerspectiveCamera} from "../../engine/cameras/PerspectiveCamera";
import * as CANNON from "cannon-es"
import {Sphere} from "./Sphere";

type PlayerOptions = GameObjectOptions & {
    physicsMaterial: CANNON.Material;
}

export class Player extends Sphere {
    public body: CANNON.Body;
    public controls: FirstPersonControls;
    public camera: PerspectiveCamera;

    constructor(options: PlayerOptions) {
        super({
            ...options,
            name: "Player",
            radius: 0.2
        });
        this.camera = new PerspectiveCamera({
            fov: 1.8,
        });
        this.controls = new FirstPersonControls(this);

        this.addChild(this.camera);
    }


    async start(): Promise<void> {
        return super.start();
    }

    update(dt: number, time: number): void {
        // TODO: Fix player movement to work with physics simulation
        this.controls.update(dt);
        super.update(dt, time);
    }
}

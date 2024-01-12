import {Scene} from "../../engine/Scene";
import {GameObject} from "./GameObject";
import * as CANNON from "cannon-es";
import {Player} from "../objects/Player";

export class GameScene extends Scene {
    world: CANNON.World;

    constructor() {
        super();
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0),
        });
    }

    /**
     * State initialization.
     */
    public async start(): Promise<void> {
        for (const node of this.nodes) {
            if (node instanceof GameObject) {
                await node.start()
                this.world.addBody(node.body);
            }
        }
    }

    /**
     * Update internal object state before rendering.
     */
    public update(dt: number, time: number): void {
        this.world.fixedStep();

        this.traverse({
            onEnter: node => {
                if (node instanceof GameObject) {
                    node.update(dt, time);
                }
            }
        })
    }

    public resize(aspectRatio: number): void {
        this.traverse({
            onEnter: node => {
                if (node instanceof Player) {
                    node.camera.aspect = aspectRatio;
                    node.camera.updateMatrix();
                }
            }
        })
    }
}

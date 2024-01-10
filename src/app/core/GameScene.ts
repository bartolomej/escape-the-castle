import {Scene} from "../../engine/Scene";
import {GameObject} from "./GameObject";
import * as CANNON from "cannon-es";

export abstract class GameScene extends Scene {
    world: CANNON.World;

    constructor() {
        super();
        this.world = new CANNON.World();
    }

    public addNode(...nodes: GameObject[]) {
        super.addNode(...nodes);

        for (const node of nodes) {
            this.world.addBody(node.body);
        }
    }

    /**
     * State initialization.
     */
    public abstract start(): Promise<void>;

    /**
     * Update internal object state before rendering.
     */
    public update(): void {
        this.traverse({
            onEnter: node => {
                if (node instanceof GameObject) {
                    node.update();
                }
            }
        })
    }
}

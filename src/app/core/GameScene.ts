import {Scene} from "../../engine/Scene";
import {GameObject} from "./GameObject";
import * as CANNON from "cannon-es";
import {Player} from "../objects/Player";

export abstract class GameScene extends Scene {
    world: CANNON.World;

    constructor() {
        super();
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0),
        });
    }

    /**
     * Asset loading stage.
     */
    public async load(): Promise<void> {
        const loadPromises: Promise<void>[] = [];

        this.traverse({
            onEnter: node => {
                if (node instanceof GameObject) {
                    loadPromises.push(node.load());
                }
            }
        });

        // Finish for all load calls to complete before initializing world.
        await Promise.all(loadPromises);

        this.traverse({
            onEnter: node => {
                if (node instanceof GameObject && node.body) {
                    // Object mesh and physics body should be initialized by now.
                    this.world.addBody(node.body);
                }
            }
        })
    }

    /**
     * State initialization just before game loop is started.
     */
    public abstract start(): void;

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

import {Object3D, Object3DOptions} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";

export type GameObjectOptions = Object3DOptions;

/**
 * Should be extended by all objects in the game scene.
 */
export abstract class GameObject extends Object3D {
    /**
     * Physics body used for simulation.
     *
     * This object's state is automatically updated before `this.update` is called.
     */
    public abstract body: CANNON.Body;

    /**
     * State initialization.
     */
    public abstract start(): Promise<void>;

    /**
     * Update code (input, animations, AI ...)
     * @param dt Delta time from the last update frame.
     * @param time Elapsed time since the call of `this.start`.
     */
    public abstract update(dt: number, time: number): void;
}

import {Object3D, Object3DOptions} from "../../engine/core/Object3D";
import * as CANNON from "cannon-es";

export type GameObjectOptions = Object3DOptions;

/**
 * Should be extended by all objects in the game scene.
 */
export abstract class GameObject extends Object3D {
    /**
     * Physics body used for simulation.
     */
    public body: CANNON.Body;

    /**
     * State initialization.
     */
    public abstract start(): Promise<void>;

    /**
     * Update internal object state before rendering.
     */
    public abstract update(): void;
}

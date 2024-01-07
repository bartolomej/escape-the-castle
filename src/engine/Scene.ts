import { Object3D } from './core/Object3D.js';

export type SceneOptions = Partial<Scene>;

type TraversalOptions = {
    onEnter?: (object: Object3D) => void;
    onLeave?: (object: Object3D) => void;
}

export class Scene {
    nodes: Object3D[];

    constructor(options?: SceneOptions) {
        this.nodes = options?.nodes ?? [];
    }

    addNode(node: Object3D) {
        this.nodes.push(node);
    }

    traverse(options: TraversalOptions) {
        for (const node of this.nodes) {
            this.traverseNode(node, options);
        }
    }

    traverseNode(object: Object3D, options: TraversalOptions) {
        options?.onEnter?.(object);
        for (const child of object.children) {
            this.traverseNode(child, options);
        }
        options?.onLeave?.(object)
    }

    getTotalLights() {
        let totalLights = 0;
        this.traverse({
            onEnter: (object) => {
                if (object.light) {
                    totalLights++
                }
            }
        });
        return totalLights;
    }

    getNodesWithProperty(property: string) {
        const nodes: Object3D[] = [];
        this.traverse({
            onEnter: (node) => {
                if (node.hasOwnProperty(property)) {
                    nodes.push(node);
                }
            }
        });
        return nodes;
    }

    getCameraNodes() {
        return this.getNodesWithProperty("camera")
    }

    getLightNodes() {
        return this.getNodesWithProperty("light");
    }

    findNodes(regex: string) {
        const nodes: Object3D[] = [];
        this.traverse({
            onEnter: (object) => {
                if (new RegExp(regex).test(object.name)) {
                    nodes.push(object);
                }
            }
        });
        return nodes;
    }

    findNode(regex: string) {
        return this.findNodes(regex)[0];
    }

    clone(): Scene {
        return new Scene({
            ...this,
            nodes: this.nodes.map(node => node.clone()),
        });
    }
}

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

    addNode(...node: Object3D[]) {
        this.nodes.push(...node);
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

    findNodesByName(regex: string) {
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

    findNodes(filter: (object: Object3D) => boolean) {
        const nodes: Object3D[] = [];
        this.traverse({
            onEnter: (object) => {
                if (filter(object)) {
                    nodes.push(object);
                }
            }
        });
        return nodes;
    }

}

import {Object3D, TraversalOptions} from './core/Object3D.js';

export type SceneOptions = Partial<Scene>;

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
            node.traverse(options)
        }
    }

    findNodesByName(name: string) {
        const nodes: Object3D[] = [];
        this.traverse({
            onEnter: (object) => {
                if (object.name === name) {
                    nodes.push(object);
                }
            }
        });
        return nodes;
    }

    findNodesByNamePattern(regex: string) {
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

import {GameScene} from "../core/GameScene";
import {GLTFLoader} from "../../engine/loaders/GLTFLoader";

export class LabyrinthScene extends GameScene {
    async start(): Promise<void> {
        const gltfLoader = new GLTFLoader();
        await gltfLoader.load('./models/level.gltf');
        const gltfScene = await gltfLoader.loadScene(gltfLoader.defaultScene);
        this.addNode(...gltfScene.nodes)
    }
}

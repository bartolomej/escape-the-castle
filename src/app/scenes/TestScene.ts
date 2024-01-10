import {GameScene} from "../core/GameScene";
import {GLTFLoader} from "../../engine/loaders/GLTFLoader";
import {Sphere} from "../objects/Sphere";
import {Cube} from "../objects/Cube";
import {AmbientLight} from "../../engine/lights/AmbientLight";
import {DirectionalLight} from "../../engine/lights/DirectionalLight";
import {Wall} from "../objects/Wall";
import {Floor} from "../objects/Floor";

export class TestScene extends GameScene {
    async start(): Promise<void> {
        const gltfLoader = new GLTFLoader();
        await gltfLoader.load('./models/test.gltf');
        const gltfScene = await gltfLoader.loadScene(gltfLoader.defaultScene);

        const gltfWalls = gltfScene.findNodesByName("Wall.*");

        for (const wall of gltfWalls) {
            this.addNode(new Wall(wall))
        }

        const gltfFloor = gltfScene.findNodesByName("Floor")[0];

        this.addNode(new Floor(gltfFloor))

        this.addNode(new Sphere({
            translation: [3,10,-5]
        }));

        this.addNode(new Cube({
            scale: [1,5,1],
            translation: [-3,1,-5]
        }));

        this.addNode(new Cube({
            name: "Stretched cube",
            scale: [1,5,5],
            translation: [-6,1,-5]
        }));

        this.addNode(new AmbientLight({
            color: [0, 0, 100],
        }));

        this.addNode(new DirectionalLight({
            color: [100, 100, 100],
            translation: [0, 10, 0],
            direction: [1,1,0]
        }));

        await super.start();
    }

}

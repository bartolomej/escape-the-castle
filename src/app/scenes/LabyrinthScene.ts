import {GameScene} from "../core/GameScene";
import {GLTFLoader} from "../../engine/loaders/GLTFLoader";
import {Wall} from "../objects/Wall";
import * as CANNON from "cannon-es";
import {Sphere} from "../objects/Sphere";
import {Player} from "../objects/Player";

export class LabyrinthScene extends GameScene {
    async start(): Promise<void> {
        const gltfLoader = new GLTFLoader();
        await gltfLoader.load('./models/level.gltf');
        const gltfScene = await gltfLoader.loadScene(gltfLoader.defaultScene);

        const wallMaterial = new CANNON.Material();
        const movableObjectMaterial = new CANNON.Material();

        this.addNode(...gltfScene.findNodesByName("Light"))

        const labyrinth = gltfScene.findNodesByName("Plane")[0];

        this.addNode(new Wall(labyrinth, {
            physicsMaterial: wallMaterial
        }));

        this.addNode(new Sphere({
            radius: 0.1,
            physicsMaterial: movableObjectMaterial,
            translation: [3, 10, -5]
        }));

        this.addNode(new Player({
            physicsMaterial: movableObjectMaterial,
            translation: [0,2,0],
        }));

        this.world.addContactMaterial(new CANNON.ContactMaterial(
            wallMaterial,
            movableObjectMaterial,
            {friction: 0.0, restitution: 0.5}
        ));

        await super.start();
    }
}

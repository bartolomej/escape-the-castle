import {GameScene} from "../core/GameScene";
import {GLTFLoader} from "../../engine/loaders/GLTFLoader";
import {Sphere} from "../objects/Sphere";
import {Cube} from "../objects/Cube";
import {AmbientLight} from "../../engine/lights/AmbientLight";
import {DirectionalLight} from "../../engine/lights/DirectionalLight";
import {Wall} from "../objects/Wall";
import {Floor} from "../objects/Floor";
import * as CANNON from "cannon-es";
import {Player} from "../objects/Player";

export class TestScene extends GameScene {
    async start(): Promise<void> {
        const gltfLoader = new GLTFLoader();
        await gltfLoader.load('./models/test.gltf');
        const gltfScene = await gltfLoader.loadScene(gltfLoader.defaultScene);

        const floorMaterial = new CANNON.Material();

        const gltfWalls = gltfScene.findNodesByNamePattern("Wall.*");

        for (const wall of gltfWalls) {
            this.addNode(new Wall(wall, {physicsMaterial: floorMaterial}))
        }

        const gltfFloor = gltfScene.findNodesByNamePattern("Floor")[0];

        this.addNode(new Floor(gltfFloor, {physicsMaterial: floorMaterial}))

        const movableObjectMaterial = new CANNON.Material();
        this.addNode(new Sphere({
            radius: 1,
            physicsMaterial: movableObjectMaterial,
            translation: [3, 10, -5]
        }));

        this.addNode(new Cube({
            scale: [1, 5, 1],
            translation: [-3, 1, -5]
        }));

        this.addNode(new Cube({
            name: "Stretched cube",
            scale: [1, 5, 5],
            translation: [-6, 1, -5]
        }));

        this.addNode(new AmbientLight({
            color: [0, 0, 100],
        }));

        this.addNode(new DirectionalLight({
            color: [100, 100, 100],
            translation: [0, 10, 0],
            direction: [1, 1, 0]
        }));

        this.world.addContactMaterial(new CANNON.ContactMaterial(
            floorMaterial,
            movableObjectMaterial,
            {friction: 0.0, restitution: 1}
        ));

        this.addNode(new Player({
            physicsMaterial: movableObjectMaterial,
            translation: [0,2,0],
        }));

        await super.start();
    }

}

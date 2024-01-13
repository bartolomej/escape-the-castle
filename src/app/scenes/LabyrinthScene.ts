import {GameScene} from "../core/GameScene";
import {GLTFLoader} from "../../engine/loaders/GLTFLoader";
import {Wall} from "../objects/Wall";
import * as CANNON from "cannon-es";
import {Sphere} from "../objects/Sphere";
import {Player} from "../objects/Player";
import {Key} from "../objects/Key";
import {PointLight} from "../../engine/lights/PointLight";

export class LabyrinthScene extends GameScene {
    async start(): Promise<void> {
        const labyrinthMeshLoader = new GLTFLoader();
        await labyrinthMeshLoader.load('./models/level.gltf');
        const labyrinthMeshScene = await labyrinthMeshLoader.loadScene(labyrinthMeshLoader.defaultScene);

        const keyMeshLoader = new GLTFLoader();
        await keyMeshLoader.load("./models/key.gltf");
        const keyMeshScene = await keyMeshLoader.loadScene(keyMeshLoader.defaultScene);

        const keyMesh = keyMeshScene.findNodesByName("Key")[0];

        if (!keyMesh) {
            throw new Error("Key not found in the loaded scene")
        }

        const propMaterial = new CANNON.Material();
        const wallMaterial = new CANNON.Material();
        const playerMaterial = new CANNON.Material();

        const keyScale = 0.05;
        this.addNode(new Key(keyMesh, {
            physicsMaterial: propMaterial,
            translation: [0, 2, 0],
            rotation: [0, 0, 0, 0],
            scale: [keyScale, keyScale, keyScale]
        }));

        this.addNode(...labyrinthMeshScene.findNodesByName("Light"))

        const labyrinthMesh = labyrinthMeshScene.findNodesByName("Wall")[0];

        this.addNode(new Wall(labyrinthMesh, {
            physicsMaterial: wallMaterial
        }));

        this.addNode(new Sphere({
            radius: 0.1,
            physicsMaterial: propMaterial,
            translation: [2, 2, 2],
        }));

        this.addNode(new Player({
            physicsMaterial: playerMaterial,
            translation: [0, 2, 0],
        }));

        await super.start();
    }
}

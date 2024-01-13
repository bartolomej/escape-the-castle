import {GameScene} from "../core/GameScene";
import {GLTFLoader} from "../../engine/loaders/GLTFLoader";
import {Wall} from "../objects/Wall";
import * as CANNON from "cannon-es";
import {Sphere} from "../objects/Sphere";
import {Player} from "../objects/Player";
import {Key} from "../objects/Key";
import {Object3D} from "../../engine/core/Object3D";
import {Mesh} from "../../engine/core/Mesh";
import {SpherePrimitive} from "../../engine/geometries/SpherePrimitive";
import {Material} from "../../engine/materials/Material";
import {AmbientLight} from "../../engine/lights/AmbientLight";

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
        const key = new Key(keyMesh, {
            physicsMaterial: propMaterial,
            translation: [0, 2, 0],
            rotation: [0, 0, 0, 0],
            scale: [keyScale, keyScale, keyScale]
        })
        this.addNode(key);

        this.addNode(...labyrinthMeshScene.findNodesByName("Light"));

        const sky = new Object3D({
            // Invert one of the axis, so that the vertices face
            // towards the player (will not be culled).
            scale: [1, 1, -1],
            mesh: new Mesh({
                primitives: [
                    new SpherePrimitive({
                        material: new Material({
                            baseColorFactor: [0.2, 0.5, 0.6, 0.2],
                        }),
                        radius: 20,
                        subdivisionsAxis: 10,
                        subdivisionsHeight: 10
                    })
                ]
            })
        });

        this.addNode(sky)

        this.addNode(new AmbientLight({
            color: [255, 255, 255],
            intensity: 0.3
        }))

        const labyrinthMesh = labyrinthMeshScene.findNodesByName("Wall")[0];

        this.addNode(new Wall(labyrinthMesh, {
            physicsMaterial: wallMaterial
        }));

        this.addNode(new Sphere({
            radius: 0.1,
            physicsMaterial: propMaterial,
            translation: [2.3, 2, 2],
        }));

        const player = new Player({
            physicsMaterial: playerMaterial,
            translation: [0, 2, 0],
        })
        this.addNode(player);

        await super.start();

        key.body.addEventListener("collide", (event: any) => {
            if (event.body === player.body) {
                // TODO: handle collision
                console.log("collided with player", event)
            }
        });
    }
}

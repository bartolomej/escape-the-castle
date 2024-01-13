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
import {Door} from "../objects/Door";

// https://pmndrs.github.io/cannon-es/docs/classes/Body.html#COLLIDE_EVENT_NAME
type CollideEventData = {
    body: CANNON.Body;
    target: CANNON.Body;
    contact: CANNON.ContactEquation;
}

export class LabyrinthScene extends GameScene {
    private keys: Key[];
    private player: Player;

    async start(): Promise<void> {
        const labyrinthMeshLoader = new GLTFLoader();
        await labyrinthMeshLoader.load('./models/level.gltf');
        const labyrinthMeshScene = await labyrinthMeshLoader.loadScene(labyrinthMeshLoader.defaultScene);

        const keyMeshLoader = new GLTFLoader();
        await keyMeshLoader.load("./models/key.gltf");
        const keyMeshScene = await keyMeshLoader.loadScene(keyMeshLoader.defaultScene);

        const door = labyrinthMeshScene.findNodesByName("Door")[0];

        if (!door) {
            throw new Error("Door not found in the loaded scene")
        }

        const keyMesh = keyMeshScene.findNodesByNamePattern("Key")[0];

        if (!keyMesh) {
            throw new Error("Key not found in the loaded scene")
        }

        const propMaterial = new CANNON.Material();
        const wallMaterial = new CANNON.Material();
        const playerMaterial = new CANNON.Material();

        this.addNode(new Door(door, {
            physicsMaterial: wallMaterial
        }));

        const keyScale = 0.05;
        // The logic shouldn't assume how many keys there are in total.
        // Add more keys if needed.
        this.keys = [
            // Every time we reuse a mesh instance, we must clone it.
            new Key(keyMesh.clone(), {
                physicsMaterial: propMaterial,
                translation: [1, 3, 0],
                rotation: [0, 0, 0, 0],
                scale: [keyScale, keyScale, keyScale]
            })
        ];
        this.addNode(...this.keys);

        this.addNode(...labyrinthMeshScene.findNodesByNamePattern("Light"));

        const sky = new Object3D({
            name: "Sky sphere",
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

        const labyrinthMesh = labyrinthMeshScene.findNodesByNamePattern("Wall")[0];

        const wall = new Wall(labyrinthMesh, {
            physicsMaterial: wallMaterial
        });

        this.addNode(wall);

        this.addNode(new Sphere({
            radius: 0.1,
            physicsMaterial: propMaterial,
            translation: [2.3, 2, 2],
        }));

        this.player = new Player({
            physicsMaterial: playerMaterial,
            translation: [0, 2, 0],
        })
        this.addNode(this.player);

        await super.start();

        this.player.body.addEventListener(
            CANNON.Body.COLLIDE_EVENT_NAME,
            this.handlePlayerCollision.bind(this)
        );
    }


    private handlePlayerCollision(event: CollideEventData) {
        const keyTarget = this.keys.find(key => key.body === event.body);
        const isCollisionWithKey = keyTarget !== undefined;

        if (isCollisionWithKey) {
            console.log("Player collided with key: ", keyTarget)
            keyTarget.despawn();
        }
    }
}

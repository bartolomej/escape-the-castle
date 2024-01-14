import {GameScene} from "../core/GameScene";
import {GLTFLoader} from "../../engine/loaders/GLTFLoader";
import {Wall} from "../objects/Wall";
import * as CANNON from "cannon-es";
import {Sphere} from "../objects/Sphere";
import {Player} from "../objects/Player";
import {Key} from "../objects/Key";
import {AmbientLight} from "../../engine/lights/AmbientLight";
import {Door} from "../objects/Door";
import {Sky} from "../objects/Sky";

// https://pmndrs.github.io/cannon-es/docs/classes/Body.html#COLLIDE_EVENT_NAME
type CollideEventData = {
    body: CANNON.Body;
    target: CANNON.Body;
    contact: CANNON.ContactEquation;
}

export class LabyrinthScene extends GameScene {
    private keys: Key[];
    private winDoor: Door;
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

        this.winDoor = (new Door(door, {
            physicsMaterial: wallMaterial
        }));

        this.addNode(this.winDoor);


        const upperBound = { x: 7.042649269104004, y: 0.7042649374047656, z: 7.042649269104004 }
        const lowerBound = { x: -7.042649269104004, y: 0, z: -7.042649269104004 };

        const keyScale = 0.05;
        // The logic shouldn't assume how many keys there are in total.
        // Add more keys if needed.
        this.keys = [
            // Every time we reuse a mesh instance, we must clone it.
            new Key(keyMesh.clone(), {
                physicsMaterial: propMaterial,
                translation: [1,3,1],
                //translation: [this.getRandomCoordinate(upperBound.x, lowerBound.x), 0.2, this.getRandomCoordinate(upperBound.z, lowerBound.z)],
                rotation: [0, 0, 0, 0],
                scale: [keyScale, keyScale, keyScale]
            }),
            new Key(keyMesh.clone(), {
                physicsMaterial: propMaterial,
                translation: [1,3,1],
                //translation: [this.getRandomCoordinate(upperBound.x, lowerBound.x), 0.2, this.getRandomCoordinate(upperBound.z, lowerBound.z)],
                rotation: [0, 0, 0, 0],
                scale: [keyScale, keyScale, keyScale]
            }),
            new Key(keyMesh.clone(), {
                physicsMaterial: propMaterial,
                translation: [1,3,1],
                //translation: [this.getRandomCoordinate(upperBound.x, lowerBound.x), 0.2, this.getRandomCoordinate(upperBound.z, lowerBound.z)],
                rotation: [0, 0, 0, 0],
                scale: [keyScale, keyScale, keyScale]
            })
        ];
        this.addNode(...this.keys);

        this.addNode(...labyrinthMeshScene.findNodesByNamePattern("Light"));

        this.addNode(new Sky())

        this.addNode(new AmbientLight({
            color: [45, 80, 160],
            intensity: 0.5
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
        const doorTarget = this.winDoor.body === event.body;

        if (keyTarget) {
            console.log("Player collided with key: ", keyTarget)
            keyTarget.despawn();
            this.player.pickupKey(keyTarget);
        }

        const hasWon = this.player.foundKeys.length === this.keys.length;
        if (doorTarget && hasWon) {
            console.log("Player collided with door: ", doorTarget)
            alert("You win!");
        }
    }

    getRandomCoordinate(upperSt: number, lowerSt: number) {
        const randomSt = Math.random() * (upperSt - lowerSt) + lowerSt;

        return randomSt;
    }
}

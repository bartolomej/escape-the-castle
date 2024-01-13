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

export class LabyrinthScene extends GameScene {
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

        // const keyScale = 0.05;
        // const key = new Key(keyMesh, {
        //     physicsMaterial: propMaterial,
        //     translation: [0, 2, 0],
        //     rotation: [0, 0, 0, 0],
        //     scale: [keyScale, keyScale, keyScale]
        // })
        // this.addNode(key);

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

        // this.addNode(new Wall(labyrinthMesh, {
        //     physicsMaterial: wallMaterial
        // }));

        const wall = (new Wall(labyrinthMesh, {
            physicsMaterial: wallMaterial
        }));

        this.addNode(wall);

        const upperBound = { x: 7.042649269104004, y: 0.7042649374047656, z: 7.042649269104004 }
        const lowerBound = { x: -7.042649269104004, y: 0, z: -7.042649269104004 };

        const keyScale = 0.05;
        const key = new Key(keyMesh, {
            physicsMaterial: propMaterial,
            translation: [1, 3, 0],
            //translation: this.getRandomPosition(wall.body.aabb.upperBound, wall.body.aabb.lowerBound),
            //translation: [this.getRandomCoordinate(upperBound.x, lowerBound.x), 2, this.getRandomCoordinate(upperBound.z, lowerBound.z)],
            rotation: [0, 0, 0, 0],
            scale: [keyScale, keyScale, keyScale]
        })
        const key2 = new Key(keyMesh, {
            physicsMaterial: propMaterial,
            translation: [1, 2.5, 0],
            //translation: this.getRandomPosition(wall.body.aabb.upperBound, wall.body.aabb.lowerBound),
            //translation: [this.getRandomCoordinate(upperBound.x, lowerBound.x), 2, this.getRandomCoordinate(upperBound.z, lowerBound.z)],
            rotation: [0, 0, 0, 0],
            scale: [keyScale, keyScale, keyScale]
        })
        const key3 = new Key(keyMesh, {
            physicsMaterial: propMaterial,
            translation: [1, 3.5, 0],
            //translation: this.getRandomPosition(wall.body.aabb.upperBound, wall.body.aabb.lowerBound),
            //translation: [this.getRandomCoordinate(upperBound.x, lowerBound.x), 2, this.getRandomCoordinate(upperBound.z, lowerBound.z)],
            rotation: [0, 0, 0, 0],
            scale: [keyScale, keyScale, keyScale]
        })
        this.addNode(key);
        this.addNode(key2);
        this.addNode(key3);

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

        // key.body.addEventListener("collide", (event: any) => {
        //     if (event.body === player.body) {
        //         // TODO: handle collision
        //         player.keysFound++;
        //         console.log("collided with player", event, player.keysFound)
        //         key.despawn();
        //     }
        // });

        const handleCollision = (key: Key) => {
            return (event: any) => {
                if (event.body === player.body) {
                    // TODO: handle collision
                    player.keysFound++;
                    console.log("collided with player", event, player.keysFound);
                    key.despawn();
                    console.log(wall.body.aabb);
                }
            };
        };

        key.body.addEventListener("collide", handleCollision(key));
        key2.body.addEventListener("collide", handleCollision(key2));
        key3.body.addEventListener("collide", handleCollision(key3));
    }

    getRandomPosition(lowerBound: { x: number, y: number, z: number }, upperBound: { x: number, y: number, z: number }) {
        const randomX = Math.random() * (upperBound.x - lowerBound.x) + lowerBound.x;
        const randomY = 0;//Math.random() * (upperBound.y - lowerBound.y) + lowerBound.y;
        const randomZ = Math.random() * (upperBound.z - lowerBound.z) + lowerBound.z;

        return { x: randomX, y: randomY, z: randomZ };
    }

    getRandomCoordinate(upperSt: number, lowerSt: number) {
        const randomSt = Math.random() * (upperSt - lowerSt) + lowerSt;

        return randomSt;
    }
}

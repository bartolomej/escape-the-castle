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

        const generateKey = () => {
            const keyScale = 0.05;
            const randomPosition = this.getRandomKeyWorldPosition(wall.body.aabb);
            // Position it above the wall level,
            // so that it can't land within the wall.
            randomPosition.y = 2;
            // Every time we reuse a mesh instance, we must clone it.
            return new Key(keyMesh.clone(), {
                physicsMaterial: propMaterial,
                translation: [randomPosition.x, randomPosition.y, randomPosition.z],
                rotation: [0, 0, 0, 0],
                scale: [keyScale, keyScale, keyScale]
            })
        }

        // TODO: Generate variable number of keys if needed
        this.keys = [
            generateKey(),
            generateKey(),
            generateKey(),
            generateKey(),
        ];
        this.addNode(...this.keys);

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

        this.timer(this.player);

        this.player.body.addEventListener(
            CANNON.Body.COLLIDE_EVENT_NAME,
            this.handlePlayerCollision.bind(this)
        );
    }

    private getRandomKeyWorldPosition(worldAabb: CANNON.AABB): CANNON.Vec3 {
        // Downscale the bounds by some factor
        // so that we are not too close to the edges and fall off the world.
        const borderScalingFactor = 0.9
        return this.getRandomVector(
            worldAabb.lowerBound.scale(borderScalingFactor),
            worldAabb.upperBound.scale(borderScalingFactor),
        )
    }

    private getRandomVector(min: CANNON.Vec3, max: CANNON.Vec3) {
        return new CANNON.Vec3(
            this.getRandomScalar(min.x, max.x),
            this.getRandomScalar(min.y, max.y),
            this.getRandomScalar(min.z, max.z),
        )
    }

    private getRandomScalar(min: number, max: number) {
        return Math.random() * (max - min) + min;
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
            this.player.controls.disable();
        }
    }

    timer( player: Player){
        var sec = 30;
        var timer = setInterval(function(){
            console.log(sec);
            sec--;
            if (sec < 0) {
                clearInterval(timer);
                alert("You lose!");
                player.controls.disable();
                this.gameEnd = true;
            }
        }, 1000);
    }
}

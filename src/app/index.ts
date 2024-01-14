import "./style.css"
import {WebGlApplication} from "../engine/WebGlApplication";
import {Pane} from 'tweakpane';

// @ts-ignore
import { WebGLRenderer } from "../engine/renderers/webgl/WebGLRenderer";
import {quat} from "gl-matrix";
import {TestScene} from "./scenes/TestScene";
import {GameScene} from "./core/GameScene";
import {LabyrinthScene} from "./scenes/LabyrinthScene";
import {Player} from "./objects/Player";

const useTestScene = false;
const showDebugControls = false;

class App extends WebGlApplication {

  private renderer: WebGLRenderer;
  public scene: GameScene;
  public player: Player;

  cameraConfig = {
    fov: 1.8,
  }
  rotatingObjectConfig = {
    name: "Monkey",
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  }

  async loadScene() {
    if (useTestScene) {
      this.scene = new TestScene();
    } else {
      this.scene = new LabyrinthScene();
    }

    // Loads the scene nodes
    await this.scene.start();

    // Log scene in console for easier debugging.
    console.log(this.scene);

    const player = this.scene.findNodes(node => node instanceof Player)[0];
    if (player) {
      this.player = player as Player;
    } else {
      throw new Error("Player not found in the scene");
    }

    this.renderer = new WebGLRenderer(this.gl, {clearColor: [1,1,1,1]});
    this.renderer.prepareScene(this.scene);
  }

  update (dt:number, time:number) {
    // Rotate object specified in UI controls
    this.rotateTargetObject();

    // Update all objects in the scene
    this.scene.update(dt, time);

    // Update camera config in case changed
    this.player.camera.fov = this.cameraConfig.fov;
    this.player.camera.updateProjection();
  }

  private rotateTargetObject() {
    const matchingObjects = this.scene.findNodesByNamePattern(this.rotatingObjectConfig.name);

    for (const object of matchingObjects) {
      quat.fromEuler(
          object.rotation,
          this.rotatingObjectConfig.rotationX,
          this.rotatingObjectConfig.rotationY,
          this.rotatingObjectConfig.rotationZ
      );
      object.updateMatrix();
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.player.camera);
    }
  }

  resize(aspectRatio: number) {
    this.scene.resize(aspectRatio);
  }

  enableCamera() {
    this.canvas.requestPointerLock();
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        this.player.controls.enable();
      } else {
        this.player.controls.disable();
      }
    })
  }

}

async function setupDebugControls (app: App) {
  const pane = new Pane();

  const cameraFolder = pane.addFolder({title: "Camera"})
  const enableCameraButton = cameraFolder.addButton({
    title: "Enable",
  });
  enableCameraButton.on("click", () => app.enableCamera());
  cameraFolder.addBinding(app.cameraConfig, "fov", {
    min: 0,
    max: 3
  });

  const objectFolder = pane.addFolder({ title: "Transform"});
  objectFolder.addBinding(app.rotatingObjectConfig, "name");
  objectFolder.addBinding(app.rotatingObjectConfig, "rotationX", {
    min: -90,
    max: 90
  });
  objectFolder.addBinding(app.rotatingObjectConfig, "rotationY", {
    min: -90,
    max: 90
  });
  objectFolder.addBinding(app.rotatingObjectConfig, "rotationZ", {
    min: -90,
    max: 90
  });

  const sceneFolder = pane.addFolder({ title: "Scene"});
  sceneFolder.addBinding(app.scene.world.gravity, "x", {
    min: -10,
    max: 10
  });
  sceneFolder.addBinding(app.scene.world.gravity, "y", {
    min: -10,
    max: 10
  });
  sceneFolder.addBinding(app.scene.world.gravity, "z", {
    min: -10,
    max: 10
  });
}

document.addEventListener('DOMContentLoaded', async () => {

  const startButton = document.getElementById("start-game");
  const startScreen = document.getElementById("start-screen");
  const canvas = document.querySelector('canvas');


  const app = new App(canvas);

  canvas.addEventListener("click", () => app.enableCamera())

  startButton.innerText = "Loading...";
  startButton.toggleAttribute("disabled");
  await app.loadScene();
  startButton.innerText = "Start";
  startButton.toggleAttribute("disabled");

  startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    canvas.style.display = 'unset';

    app.start();
    app.enableCamera();

    if (showDebugControls) {
      setupDebugControls(app);
    }
  })
});

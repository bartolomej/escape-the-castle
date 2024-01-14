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
import {UiController} from "./UiController";

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

  async start() {
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

    super.start();
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
  const uiController = UiController.create();
  const app = new App(uiController.canvas);

  uiController.showStartScreen();
  uiController.canvas.addEventListener("click", () => app.enableCamera())

  async function startGame() {
    app.stop();

    // For now just re-load the whole scene,
    // as our game initialization logic is tightly coupled to the loading logic.
    // TODO: Separate loading from initialization
    uiController.setIsStartScreenLoading(true);
    await app.start();
    uiController.setIsStartScreenLoading(false);

    uiController.showGameScreen();

    app.enableCamera();

    if (showDebugControls) {
      setupDebugControls(app);
    }
  }

  uiController.startButton.addEventListener("click", () => startGame());
  uiController.restartButton.addEventListener("click", () => startGame());
  uiController.startOverButton.addEventListener("click", () => startGame());
});

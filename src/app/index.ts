import "./style.css"
import {WebGlApplication} from "../engine/WebGlApplication";
import {Pane} from 'tweakpane';

// @ts-ignore
import { WebGLRenderer } from "../engine/renderers/webgl/WebGLRenderer";
import FirstPersonControls from "../engine/controls/FirstPersonControls";
import { PerspectiveCamera } from "../engine/cameras/PerspectiveCamera";
import {quat} from "gl-matrix";
import {TestScene} from "./scenes/TestScene";
import {GameScene} from "./core/GameScene";
import {LabyrinthScene} from "./scenes/LabyrinthScene";

const useTestScene = true;

class App extends WebGlApplication {

  private renderer: WebGLRenderer;
  private scene: GameScene;
  public camera: PerspectiveCamera;
  private controls: FirstPersonControls;

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

    await this.scene.start()

    this.camera = new PerspectiveCamera({
      fov: 1.8,
      translation: [0,2,0],
    });
    this.controls = new FirstPersonControls(this.camera);

    this.renderer = new WebGLRenderer(this.gl, {clearColor: [1,1,1,1]});
    this.renderer.prepareScene(this.scene);
    this.resize();

    super.start();
    console.log(this.scene)
  }

  update (dt: number) {
    if (!this.scene) {
      return;
    }

    // Rotate object specified in UI controls
    this.rotateTargetObject();

    // Update all objects in the scene
    this.scene.update();

    // Update camera config in case changed
    this.camera.fov = this.cameraConfig.fov;
    this.camera.updateProjection();

    // Update camera transformation based on control inputs.
    this.controls?.update(dt);
  }

  private rotateTargetObject() {
    const matchingObjects = this.scene.findNodesByName(this.rotatingObjectConfig.name);

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
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const aspectRatio = w / h;

    if (this.camera && this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = aspectRatio;
      this.camera.updateMatrix();
    }
  }

  enableCamera() {
    this.canvas.requestPointerLock();
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        this.controls.enable();
      } else {
        this.controls.disable();
      }
    })
  }

}

async function main () {
  const canvas = document.querySelector('canvas');
  const app = new App(canvas);

  await app.start()

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

  const monkeyFolder = pane.addFolder({ title: "Transform"});
  monkeyFolder.addBinding(app.rotatingObjectConfig, "name");
  monkeyFolder.addBinding(app.rotatingObjectConfig, "rotationX", {
    min: -90,
    max: 90
  });
  monkeyFolder.addBinding(app.rotatingObjectConfig, "rotationY", {
    min: -90,
    max: 90
  });
  monkeyFolder.addBinding(app.rotatingObjectConfig, "rotationZ", {
    min: -90,
    max: 90
  });
}

document.addEventListener('DOMContentLoaded', main);

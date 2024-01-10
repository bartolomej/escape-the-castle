import "./style.css"
import {WebGlApplication} from "../engine/WebGlApplication";
import {Pane} from 'tweakpane';

// @ts-ignore
import { WebGLRenderer } from "../engine/renderers/webgl/WebGLRenderer";
import FirstPersonControls from "../engine/controls/FirstPersonControls";
import { PerspectiveCamera } from "../engine/cameras/PerspectiveCamera";
import ShaderMaterial from "../engine/materials/ShaderMaterial";
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
  private shaderMaterial: ShaderMaterial;

  cameraConfig = {
    fov: 1.8,
  }
  monkeyConfig = {
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

    this.camera = new PerspectiveCamera({
      fov: this.cameraConfig.fov,
      translation: [0,2,0],
    });
    this.controls = new FirstPersonControls(this.camera);

    this.renderer = new WebGLRenderer(this.gl, {clearColor: [1,1,1,1]});
    this.renderer.prepareScene(this.scene);
    this.resize();

    console.log(this.scene)
  }

  update (dt: number, t: number) {
    if (!this.scene) {
      return;
    }

    this.scene.update();

    const monkey = this.scene.findNodesByName("Suzanne")[0];
    if (monkey) {
      quat.fromEuler(
          monkey.rotation,
          this.monkeyConfig.rotationX,
          this.monkeyConfig.rotationY,
          this.monkeyConfig.rotationZ
      );
      monkey.updateMatrix();
    }

    this.camera.fov = this.cameraConfig.fov;
    this.camera.updateProjection();

    this.controls?.update(dt);
    this.shaderMaterial?.setUniform("time", t);
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

function main () {
  const canvas = document.querySelector('canvas');
  const app = new App(canvas);

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

  const monkeyFolder = pane.addFolder({ title: "Monkey"});
  monkeyFolder.addBinding(app.monkeyConfig, "rotationX", {
    min: -90,
    max: 90
  });
  monkeyFolder.addBinding(app.monkeyConfig, "rotationY", {
    min: -90,
    max: 90
  });
  monkeyFolder.addBinding(app.monkeyConfig, "rotationZ", {
    min: -90,
    max: 90
  });
}

document.addEventListener('DOMContentLoaded', main);

import "./style.css"
import Application from "../engine/Application";
import {Pane} from 'tweakpane';

// shaders
// @ts-ignore
import fragment from "./shaders/curl.glsl";
import { WebGLRenderer } from "../engine/renderers/webgl/WebGLRenderer";
import { Scene } from "../engine/Scene";
import { Object3D } from "../engine/core/Object3D";
import { GLTFLoader } from "../engine/loaders/GLTFLoader";
import FirstPersonControls from "../engine/controls/FirstPersonControls";
import { PerspectiveCamera } from "../engine/cameras/PerspectiveCamera";
import ShaderMaterial from "../engine/materials/ShaderMaterial";
import {AmbientLight} from "../engine/lights/AmbientLight";
import {quat} from "gl-matrix";

class App extends Application {

  private renderer: WebGLRenderer;
  private scene: Scene;
  public camera: Object3D;
  private loader: GLTFLoader;
  private controls: FirstPersonControls;
  private shaderMaterial: ShaderMaterial;

  monkey = {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  }

  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load('./models/test.gltf');

    this.scene = await this.loader.loadScene(this.loader.defaultScene);

    this.scene.nodes = this.scene.nodes.filter(node => !node.name.includes("Light"));

    this.scene.addNode(new AmbientLight({
      color: [100, 50, 50]
    }));

    this.shaderMaterial = new ShaderMaterial({
      fragmentShader: fragment,
      uniforms: {
        time: {
          type: "1f",
          value: 0,
        },
        frequencies: {
          type: "1fv",
          value: []
        }
      }
    });
    // this.scene.findNodes(".*").forEach(wall => {
    //   wall.mesh?.setMaterial(this.shaderMaterial);
    // })

    this.camera = new Object3D({
      translation: [0,2,0],
      camera: new PerspectiveCamera({
        fov: 2
      })
    })
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

    const monkey = this.scene.findNodesByName("Suzanne")[0];
    quat.fromEuler(
        monkey.rotation,
        this.monkey.rotationX,
        this.monkey.rotationY,
        this.monkey.rotationZ
    );
    monkey.updateMatrix();

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

    if (this.camera) {
      if (this.camera.camera instanceof PerspectiveCamera) {
        this.camera.camera.aspect = aspectRatio;
      }
      this.camera.camera.updateMatrix();
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

  const monkeyFolder = pane.addFolder({ title: "Monkey"});
  monkeyFolder.addBinding(app.monkey, "rotationX", {
    min: -90,
    max: 90
  });
  monkeyFolder.addBinding(app.monkey, "rotationY", {
    min: -90,
    max: 90
  });
  monkeyFolder.addBinding(app.monkey, "rotationZ", {
    min: -90,
    max: 90
  });
}

document.addEventListener('DOMContentLoaded', main);

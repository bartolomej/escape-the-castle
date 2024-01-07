import "./style.css"
import Application from "../engine/Application";
import { GUI } from 'dat.gui';

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
import { Light } from "../engine/lights/Light";
import {AmbientLight} from "../engine/lights/AmbientLight";

class App extends Application {

  private renderer: WebGLRenderer;
  private scene: Scene;
  public camera: Object3D;
  private loader: GLTFLoader;
  private controls: FirstPersonControls;
  private shaderMaterial: ShaderMaterial;
  private fftSize: number = 32;

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
          value: new Array(this.fftSize).fill(0)
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
  const gui = new GUI();
  gui.add(app, 'enableCamera');
  // @ts-ignore
  window.app = app;
}

document.addEventListener('DOMContentLoaded', main);

import "./style.css"
import Application from "../engine/Application";
import {Pane} from 'tweakpane';

// @ts-ignore
import { WebGLRenderer } from "../engine/renderers/webgl/WebGLRenderer";
import { Scene } from "../engine/Scene";
import { GLTFLoader } from "../engine/loaders/GLTFLoader";
import FirstPersonControls from "../engine/controls/FirstPersonControls";
import { PerspectiveCamera } from "../engine/cameras/PerspectiveCamera";
import ShaderMaterial from "../engine/materials/ShaderMaterial";
import {quat} from "gl-matrix";
import {SpherePrimitive} from "../engine/geometries/SpherePrimitive";
import {Object3D} from "../engine/core/Object3D";
import {Mesh} from "../engine/core/Mesh";
import {CubePrimitive} from "../engine/geometries/CubePrimitive";

const useTestScene = false;

class App extends Application {

  private renderer: WebGLRenderer;
  private scene: Scene;
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
      this.scene = await RoomTestScene.load();
    } else {
      this.scene = await LabyrinthScene.load();
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

class RoomTestScene extends Scene {
  static async load() {
    const gltfLoader = new GLTFLoader();
    await gltfLoader.load('./models/test.gltf');
    const gltfScene = await gltfLoader.loadScene(gltfLoader.defaultScene);
    const roomScene = new RoomTestScene();
    roomScene.addNode(...gltfScene.nodes);
    return roomScene;
  }

  constructor() {
    super();
    this.init();
  }

  private init() {
    console.log("initing", this.nodes)
    this.addNode(new Object3D({
      name: "Sphere",
      mesh: new Mesh({
        primitives: [
          new SpherePrimitive({
            radius: 1,
            subdivisionsHeight: 100,
            subdivisionsAxis: 100
          })
        ]
      }),
      translation: [3,1,-5]
    }));

    this.addNode(new Object3D({
      name: "Cube",
      mesh: new Mesh({
        primitives: [
          new CubePrimitive({
            size: 1,
          })
        ]
      }),
      scale: [1,5,1],
      translation: [-3,1,-5]
    }));

    this.addNode(new Object3D({
      name: "Manual wall",
      mesh: new Mesh({
        primitives: [
          new CubePrimitive({
            size: 1,
          })
        ]
      }),
      scale: [1,5,5],
      translation: [-6,1,-5]
    }));

    // this.addNode(new AmbientLight({
    //   color: [0, 0, 100],
    // }));
    //
    // this.addNode(new DirectionalLight({
    //   color: [100, 100, 100],
    //   translation: [0, 10, 0],
    //   direction: [1,1,0]
    // }));
  }
}

class LabyrinthScene extends Scene {
  static async load() {
    const gltfLoader = new GLTFLoader();
    await gltfLoader.load('./models/level.gltf');
    const gltfScene = await gltfLoader.loadScene(gltfLoader.defaultScene);
    const labyrinthScene = new LabyrinthScene();
    labyrinthScene.addNode(...gltfScene.nodes)
    return labyrinthScene;
  }

}

import {mat4, vec3, vec4} from 'gl-matrix';

import {WebGL, WebGLProgramBundle} from "./WebGL";
import { Light } from "../../lights/Light";

import {CoreShaderOptions, createFragmentShader, createVertexShader} from "./core-shaders";
import ShaderMaterial, {ShaderUniform, UniformType} from "../../materials/ShaderMaterial";
import {Scene} from "../../Scene";
import {Object3D} from "../../core/Object3D";
import {Mesh} from "../../core/Mesh";
import {PrimitiveAttributeName, Primitive} from "../../core/Primitive";
import {TextureSampler} from "../../textures/TextureSampler";
import {Texture} from "../../textures/Texture";
import {Material} from "../../materials/Material";
import {BufferView} from "../../core/BufferView";
import {Camera} from "../../cameras/Camera";
import {DirectionalLight} from "../../lights/DirectionalLight";
import {AmbientLight} from "../../lights/AmbientLight";
import {PointLight} from "../../lights/PointLight";

// This class prepares all assets for use with WebGL
// and takes care of rendering.

type WebGLRendererOptions = {
  clearColor: vec4;
}

export class WebGLRenderer {
  private readonly gl: WebGL2RenderingContext;
  private readonly clearColor: vec4;
  private readonly defaultTexture: WebGLTexture;
  private programs: Map<any, WebGLProgramBundle>;
  private glObjects: Map<any, any>;

  constructor (gl: WebGL2RenderingContext, options?: WebGLRendererOptions) {
    this.gl = gl;
    this.clearColor = options.clearColor ?? [1,1,1,1];
    this.glObjects = new Map();
    this.programs = new Map();

    this.defaultTexture = WebGL.createTexture(gl, {
      data: new Uint8Array([255, 255, 255, 255]),
      width: 1,
      height: 1,
    });

    const [r, g, b, a] = this.clearColor;
    gl.clearColor(r, g, b, a);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
  }

  get defaultProgram() {
    return this.programs.get("default")
  }

  preparePrograms(options: CoreShaderOptions) {
    const program = WebGL.buildProgram(this.gl, {
      vertex: createVertexShader(options),
      fragment: createFragmentShader(options)
    });
    this.programs.set("default", program);
  }

  prepareBufferView (bufferView: BufferView) {
    if (this.glObjects.has(bufferView)) {
      return this.glObjects.get(bufferView);
    }

    const buffer = new DataView(
      bufferView.buffer,
      bufferView.byteOffset,
      bufferView.byteLength);

    const glBuffer = WebGL.createBuffer(this.gl, {
      target: bufferView.target,
      data: buffer
    });
    this.glObjects.set(bufferView, glBuffer);
    return glBuffer;
  }

  prepareSampler (sampler: TextureSampler) {
    if (this.glObjects.has(sampler)) {
      return this.glObjects.get(sampler);
    }

    const glSampler = WebGL.createSampler(this.gl, sampler);
    this.glObjects.set(sampler, glSampler);
    return glSampler;
  }

  prepareImage (image: HTMLImageElement) {
    if (this.glObjects.has(image)) {
      return this.glObjects.get(image);
    }

    const glTexture = WebGL.createTexture(this.gl, { image });
    this.glObjects.set(image, glTexture);
    return glTexture;
  }

  prepareTexture (texture: Texture) {
    const gl = this.gl;

    this.prepareSampler(texture.sampler);
    const glTexture = this.prepareImage(texture.image);

    const mipmapModes = [
      gl.NEAREST_MIPMAP_NEAREST,
      gl.NEAREST_MIPMAP_LINEAR,
      gl.LINEAR_MIPMAP_NEAREST,
      gl.LINEAR_MIPMAP_LINEAR,
    ];

    if (!texture.hasMipmaps && mipmapModes.includes(texture.sampler.min)) {
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.generateMipmap(gl.TEXTURE_2D);
      texture.hasMipmaps = true;
    }
  }

  prepareMaterial (material: Material) {
    if (material instanceof ShaderMaterial) {
      this.prepareShaderMaterial(material);
    }
    if (material.baseColorTexture) {
      this.prepareTexture(material.baseColorTexture);
    }
    if (material.metallicRoughnessTexture) {
      this.prepareTexture(material.metallicRoughnessTexture);
    }
    if (material.normalTexture) {
      this.prepareTexture(material.normalTexture);
    }
    if (material.occlusionTexture) {
      this.prepareTexture(material.occlusionTexture);
    }
    if (material.emissiveTexture) {
      this.prepareTexture(material.emissiveTexture);
    }
  }

  prepareShaderMaterial(material: ShaderMaterial) {
    try {
      const program = WebGL.buildProgram(this.gl, {
        // TODO: add support for custom vertex shaders?
        vertex: createVertexShader({
          // Doesn't matter what we use here, as lights are not applied in custom shaders yet.
          numberOfLights: 1
        }),
        fragment: material.fragmentShader,
      });
      this.programs.set(material, program);
    } catch (e) {
      throw new Error("ShaderMaterial error: " + e)
    }
  }

  preparePrimitive (primitive: Primitive) {
    if (this.glObjects.has(primitive)) {
      return this.glObjects.get(primitive);
    }

    this.prepareMaterial(primitive.material);

    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    if (primitive.indices) {
      const bufferView = primitive.indices.bufferView;
      bufferView.target = gl.ELEMENT_ARRAY_BUFFER;
      const buffer = this.prepareBufferView(bufferView);
      gl.bindBuffer(bufferView.target, buffer);
    }

    // This is an application-scoped convention (originating from glTF), matching the shaders.
    const attributeNameToIndexLookup: Record<PrimitiveAttributeName, number> = {
      POSITION: 0,
      TEXCOORD_0: 1,
      NORMAL: 2,
    }

    for (const name in primitive.attributes) {
      const typedName = name as PrimitiveAttributeName;
      const accessor = primitive.attributes[typedName];
      const bufferView = accessor.bufferView;
      const attributeIndex = attributeNameToIndexLookup[typedName]

      if (attributeIndex !== undefined) {
        bufferView.target = gl.ARRAY_BUFFER;
        const buffer = this.prepareBufferView(bufferView);
        gl.bindBuffer(bufferView.target, buffer);
        gl.enableVertexAttribArray(attributeIndex);
        gl.vertexAttribPointer(
          attributeIndex,
          accessor.numComponents,
          accessor.componentType,
          accessor.normalized,
          bufferView.byteStride,
          accessor.byteOffset);
      }
    }

    this.glObjects.set(primitive, vao);
    return vao;
  }

  prepareMesh (mesh: Mesh) {
    for (const primitive of mesh.primitives) {
      this.preparePrimitive(primitive);
    }
  }

  prepare3dObject (object: Object3D) {
    if (object.mesh) {
      this.prepareMesh(object.mesh);
    }
    for (const child of object.children) {
      this.prepare3dObject(child);
    }
  }

  prepareScene (scene: Scene) {
    let lights = scene.findNodes(node => node instanceof Light);
    const numberOfLights = lights.length;

    if (numberOfLights === 0) {
      throw new Error("Scene must have at least 1 light")
    }

    // rebuild programs if complete scene info is known on startup
    this.preparePrograms({
      numberOfLights
    })
    for (const node of scene.nodes) {
      this.prepare3dObject(node);
    }
  }

  render (scene: Scene, camera: Camera) {
    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let viewModelMatrix = mat4.create();
    let modelMatrix = mat4.create();
    let modelViewMatrixStack: mat4[] = [];
    let modelMatrixStack: mat4[] = [];

    const viewMatrix = camera.getGlobalTransform();
    mat4.invert(viewMatrix, viewMatrix);
    mat4.copy(viewModelMatrix, viewMatrix);

    let lightCount = 0;

    scene.traverse({
      onEnter: object => {
        modelViewMatrixStack.push(mat4.clone(viewModelMatrix));
        modelMatrixStack.push(mat4.clone(modelMatrix));

        mat4.mul(viewModelMatrix, viewModelMatrix, object.matrix);
        mat4.mul(modelMatrix, modelMatrix, object.matrix);

        if (object instanceof Light) {
          this.renderLight(object, lightCount)
          lightCount++;
        }

        this.renderObject3D(object, {
          viewModel: viewModelMatrix,
          model: modelMatrix,
          projection: camera.projection
        });
      },
      onLeave: () => {
        viewModelMatrix = modelViewMatrixStack.pop();
        modelMatrix = modelMatrixStack.pop();
      }
    });
  }

  renderLight(light: Light, lightIndex: number) {
    const { gl, defaultProgram: program } = this;

    function arrayParamName(name: string) {
      return `${name}[${lightIndex}]`
    }

    function getLightType() {
      // Must be kept in sync with constants in core fragment shader.
      switch (true) {
        case light instanceof AmbientLight:
          return 0;
        case light instanceof DirectionalLight:
          return 1;
        case light instanceof PointLight:
          return 2;
        default:
          throw new Error(`Unknown light type: ${JSON.stringify(light)}`)
      }
    }

    let color = vec3.clone(light.color);
    vec3.scale(color, color, 1.0 / 255.0);
    gl.uniform3fv(program.uniforms[arrayParamName("uLightColor")], color);

    let position: vec3 = [0, 0, 0];
    mat4.getTranslation(position, light.matrix);

    gl.uniform3fv(program.uniforms[arrayParamName("uLightPosition")], position);
    gl.uniform1i(program.uniforms[arrayParamName("uLightType")], getLightType());
    gl.uniform1f(program.uniforms[arrayParamName("uLightIntensity")], light.intensity);

    if (light instanceof DirectionalLight) {
      gl.uniform3fv(program.uniforms[arrayParamName("uLightDirection")], light.direction);
    }
  }

  renderObject3D (object3d: Object3D, matrices: {
    viewModel: mat4,
    projection: mat4,
    model: mat4
  }) {
    const program = this.defaultProgram;
    this.gl.uniformMatrix4fv(program.uniforms.uModel, false, matrices.model);
    this.gl.uniformMatrix4fv(program.uniforms.uViewModel, false, matrices.viewModel);

    if (object3d.mesh) {
      for (const primitive of object3d.mesh.primitives) {
        this.renderPrimitive(primitive, matrices);
      }
    }

    for (const child of object3d.children) {
      this.renderObject3D(child, matrices);
    }
  }

  renderPrimitive (primitive: Primitive, matrices: {
    viewModel: mat4,
    projection: mat4,
    model: mat4
  }) {
    const gl = this.gl;

    const vao = this.glObjects.get(primitive);
    const material = primitive.material;
    let program = this.defaultProgram;

    if (material instanceof ShaderMaterial) {
      program = this.programs.get(material);
    }

    gl.useProgram(program.program);

    // set standard uniform values
    gl.uniformMatrix4fv(program.uniforms.uProjection, false, matrices.projection);
    gl.uniformMatrix4fv(program.uniforms.uViewModel, false, matrices.viewModel);
    gl.uniform1i(program.uniforms.uTexture, 0);

    if (material instanceof ShaderMaterial) {
      this.setShaderUniformValues(program, material)
    }

    const texture = material.baseColorTexture;
    const glTexture = this.glObjects.get(texture?.image);
    const glSampler = this.glObjects.get(texture?.sampler);

    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glTexture || this.defaultTexture);
    gl.bindSampler(0, glSampler);

    if (primitive.indices) {
      const mode = primitive.mode;
      const count = primitive.indices.count;
      const type = primitive.indices.componentType;
      gl.drawElements(mode, count, type, 0);
    } else {
      const mode = primitive.mode;
      const count = primitive.attributes.POSITION.count;
      gl.drawArrays(mode, 0, count);
    }
  }

  private setShaderUniformValues(program: WebGLProgramBundle, material: ShaderMaterial) {
    for (const name in material.uniforms) {
      const uniform = material.uniforms[name];
      const func: `uniform${UniformType}` = `uniform${uniform.type}`;
      for (const webGLName of this.getGlUniformParamNames(name, uniform)) {
        const location = program.uniforms[webGLName];
        if (this.gl[func]) {
          const shouldSpreadValue = typeof uniform.value === "object" && !uniform.type.endsWith("v");
          if (shouldSpreadValue) {
            // @ts-ignore
            this.gl[func](location, ...uniform.value);
          } else {
            // @ts-ignore
            this.gl[func](location, uniform.value);
          }
        } else {
          throw new Error(`GLSL uniform type ${uniform.type} not supported!`)
        }
      }
    }
  }

  private getGlUniformParamNames(uniformName: string, uniform: ShaderUniform) {
    const isVectorUniform = uniform.type.endsWith("v");

    if (!isVectorUniform) {
      return [uniformName];
    }

    if (typeof uniform.value !== "object") {
      throw new Error(`Expected array uniform value: ${uniform}`)
    }

    const indexedNames = [];
    for (let i = 0; i < uniform.value.length; i++) {
      indexedNames.push(`${uniformName}[${i}]`);
    }
    return indexedNames;
  }

}

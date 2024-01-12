import { TextureSampler } from '../textures/TextureSampler';
import {Texture, TextureOptions} from '../textures/Texture';
import {Material, MaterialOptions} from '../materials/Material';
import {isPrimitiveAttributeName, Primitive, PrimitiveOptions} from '../core/Primitive';
import {Mesh, MeshOptions} from '../core/Mesh';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera';
import { OrthographicCamera } from '../cameras/OrthographicCamera';
import {Object3D} from '../core/Object3D';
import {Scene, SceneOptions} from '../Scene';
import { deep } from "../Utils";
import { Light } from "../lights/Light";
import {BufferView} from "../core/BufferView";
import {Accessor} from "../core/Accessor";
import {Camera} from "../cameras/Camera";
import {PointLight} from "../lights/PointLight";
import {quat, vec3} from 'gl-matrix';

// This class loads all GLTF resources and instantiates
// the corresponding classes. Keep in mind that it loads
// the resources in series (care to optimize?).

export class GLTFLoader {
    cache: any;
    private gltfUrl: URL
    private gltf: any;
    defaultScene: number;

    constructor() {
        this.gltf = null;
        this.gltfUrl = null;
        this.cache = new Map();
    }

    private async fetchJson(url: string): Promise<unknown> {
        let response = await fetch(url);
        return await response.json();
    }

    private async fetchBuffer(url: string): Promise<ArrayBuffer> {
        let response = await fetch(url);
        return await response.arrayBuffer();
    }

    private fetchImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', e => resolve(image));
            image.addEventListener('error', reject);
            image.src = url;
        });
    }

    findByNameOrIndex(mapping: any, nameOrIndex: string | number) {
        if (typeof nameOrIndex === 'number') {
            return mapping[nameOrIndex];
        } else {
            return mapping.find((element: any) => element.name === nameOrIndex);
        }
    }

    async load(url: string) {
        this.gltfUrl = new URL(url, window.location.origin);
        this.gltf = await this.fetchJson(url);
        this.defaultScene = this.gltf.scene || 0;
    }

    async loadImage(nameOrIndex: string | number): Promise<HTMLImageElement> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.images, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        if (gltfSpec.uri) {
            const url = new URL(gltfSpec.uri, this.gltfUrl);
            const image = await this.fetchImage(url.toString());
            this.cache.set(gltfSpec, image);
            return image;
        } else {
            const bufferView = await this.loadBufferView(gltfSpec.bufferView);
            const blob = new Blob([bufferView], { type: gltfSpec.mimeType });
            const url = URL.createObjectURL(blob);
            const image = await this.fetchImage(url);
            URL.revokeObjectURL(url);
            this.cache.set(gltfSpec, image);
            return image;
        }
    }

    async loadBuffer(nameOrIndex: string | number): Promise<ArrayBuffer> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.buffers, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const url = new URL(gltfSpec.uri, this.gltfUrl);
        const buffer = await this.fetchBuffer(url.toString());
        this.cache.set(gltfSpec, buffer);
        return buffer;
    }

    async loadBufferView(nameOrIndex: string | number): Promise<BufferView> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.bufferViews, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const bufferView = new BufferView({
            ...gltfSpec,
            buffer: await this.loadBuffer(gltfSpec.buffer),
        });
        this.cache.set(gltfSpec, bufferView);
        return bufferView;
    }

    async loadAccessor(nameOrIndex: string | number): Promise<Accessor> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.accessors, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const accessorTypeToNumComponentsLookup = new Map([
            ["SCALAR", 1],
            ["VEC2", 2],
            ["VEC3", 3],
            ["VEC4", 4],
            ["MAT2", 4],
            ["MAT3", 9],
            ["MAT4", 16],
        ])

        const accessor = new Accessor({
            ...gltfSpec,
            bufferView    : await this.loadBufferView(gltfSpec.bufferView),
            numComponents : accessorTypeToNumComponentsLookup.get(gltfSpec.type),
        });
        this.cache.set(gltfSpec, accessor);
        return accessor;
    }

    async loadSampler(nameOrIndex: string | number) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.samplers, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const sampler = new TextureSampler({
            min   : gltfSpec.minFilter,
            mag   : gltfSpec.magFilter,
            wrapS : gltfSpec.wrapS,
            wrapT : gltfSpec.wrapT,
        });
        this.cache.set(gltfSpec, sampler);
        return sampler;
    }

    async loadTexture(nameOrIndex: string | number): Promise<Texture> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.textures, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        let options: TextureOptions = {};
        if (gltfSpec.source !== undefined) {
            options.image = await this.loadImage(gltfSpec.source);
        }
        if (gltfSpec.sampler !== undefined) {
            options.sampler = await this.loadSampler(gltfSpec.sampler);
        }

        const texture = new Texture(options);
        this.cache.set(gltfSpec, texture);
        return texture;
    }

    async loadMaterial(nameOrIndex: string | number): Promise<Material> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.materials, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        let options: MaterialOptions = {};
        const pbr = gltfSpec.pbrMetallicRoughness;
        if (pbr !== undefined) {
            if (pbr.baseColorTexture !== undefined) {
                options.baseColorTexture = await this.loadTexture(pbr.baseColorTexture.index);
                options.baseColorTexCoord = pbr.baseColorTexture.texCoord;
            }
            if (pbr.metallicRoughnessTexture !== undefined) {
                options.metallicRoughnessTexture = await this.loadTexture(pbr.metallicRoughnessTexture.index);
                options.metallicRoughnessTexCoord = pbr.metallicRoughnessTexture.texCoord;
            }
            options.baseColorFactor = pbr.baseColorFactor;
            options.metallicFactor = pbr.metallicFactor;
            options.roughnessFactor = pbr.roughnessFactor;
        }

        if (gltfSpec.normalTexture !== undefined) {
            options.normalTexture = await this.loadTexture(gltfSpec.normalTexture.index);
            options.normalTexCoord = gltfSpec.normalTexture.texCoord;
            options.normalFactor = gltfSpec.normalTexture.scale;
        }

        if (gltfSpec.occlusionTexture !== undefined) {
            options.occlusionTexture = await this.loadTexture(gltfSpec.occlusionTexture.index);
            options.occlusionTexCoord = gltfSpec.occlusionTexture.texCoord;
            options.occlusionFactor = gltfSpec.occlusionTexture.strength;
        }

        if (gltfSpec.emissiveTexture !== undefined) {
            options.emissiveTexture = await this.loadTexture(gltfSpec.emissiveTexture.index);
            options.emissiveTexCoord = gltfSpec.emissiveTexture.texCoord;
            options.emissiveFactor = gltfSpec.emissiveFactor;
        }

        options.alphaMode = gltfSpec.alphaMode;
        options.alphaCutoff = gltfSpec.alphaCutoff;
        options.doubleSided = gltfSpec.doubleSided;

        const material = new Material(options);
        this.cache.set(gltfSpec, material);
        return material;
    }

    async loadMesh(nameOrIndex: string | number): Promise<Mesh> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.meshes, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        let options: MeshOptions = { primitives: [] };
        for (const primitiveSpec of gltfSpec.primitives) {
            let primitiveOptions: PrimitiveOptions = {
                attributes: {
                    NORMAL: null,
                    TEXCOORD_0: null,
                    POSITION: null,
                }
            };
            for (const name in primitiveSpec.attributes) {
                if (!isPrimitiveAttributeName(name)) {
                    throw new Error(`Unsupported primitive attribute: ${name}`)
                }
                primitiveOptions.attributes[name] = await this.loadAccessor(primitiveSpec.attributes[name]);
            }
            if (primitiveSpec.indices !== undefined) {
                primitiveOptions.indices = await this.loadAccessor(primitiveSpec.indices);
            }
            if (primitiveSpec.material !== undefined) {
                primitiveOptions.material = await this.loadMaterial(primitiveSpec.material);
            }
            primitiveOptions.mode = primitiveSpec.mode;
            const primitive = new Primitive(primitiveOptions);
            options.primitives.push(primitive);
        }

        const mesh = new Mesh(options);
        this.cache.set(gltfSpec, mesh);
        return mesh;
    }

    // https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_lights_punctual/README.md
    async loadLight(nameOrIndex: string | number): Promise<Light> {
        const gltfSpec = this.findByNameOrIndex(deep(this.gltf, 'extensions.KHR_lights_punctual.lights'), nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }
        const scaledColor = vec3.create();
        vec3.scale(scaledColor, gltfSpec.color, 255);

        function buildLight() {
            switch (gltfSpec.type) {
                case "point":
                    return new PointLight({
                        name: gltfSpec.name,
                        color: scaledColor,
                        // Currently we expect "unit-less" lightning mode export format from Blender.
                        // See: https://github.com/KhronosGroup/glTF-Blender-IO/pull/1760
                        // Hack: Scale by an arbitrary factor to adjust for our internal lightning intensity scale.
                        intensity: gltfSpec.intensity ? gltfSpec.intensity / 5 : 1
                    });
            }
        }
        const light = buildLight();
        this.cache.set(gltfSpec, light);
        return light;
    }

    async loadCamera(nameOrIndex: string | number): Promise<Camera> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.cameras, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        if (gltfSpec.type === 'perspective') {
            const persp = gltfSpec.perspective;
            const camera = new PerspectiveCamera({
                aspect : persp.aspectRatio,
                fov    : persp.yfov,
                near   : persp.znear,
                far    : persp.zfar,
            });
            this.cache.set(gltfSpec, camera);
            return camera;
        } else if (gltfSpec.type === 'orthographic') {
            const ortho = gltfSpec.orthographic;
            const camera = new OrthographicCamera({
                left   : -ortho.xmag,
                right  : ortho.xmag,
                bottom : -ortho.ymag,
                top    : ortho.ymag,
                near   : ortho.znear,
                far    : ortho.zfar,
            });
            this.cache.set(gltfSpec, camera);
            return camera;
        }
    }

    // https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_004_ScenesNodes.md
    async loadNode(nameOrIndex: string | number) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.nodes, nameOrIndex);
        if (!gltfSpec) {
            throw new Error(`Cant find node with index ${nameOrIndex}`)
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        let node = new Object3D();

        const light = deep(gltfSpec, 'extensions.KHR_lights_punctual.light');
        if (light !== undefined) {
            node = await this.loadLight(light)
        }

        node.name = gltfSpec.name;

        if (gltfSpec.matrix) {
            node.matrix = gltfSpec.matrix;
            node.updateTransform();
        } else if (gltfSpec.translation || gltfSpec.rotation || gltfSpec.scale) {
            node.translation = gltfSpec.translation ?? vec3.fromValues(0,0,0);
            node.scale = gltfSpec.scale ?? vec3.fromValues(1, 1, 1);
            node.rotation = gltfSpec.rotation ?? quat.fromValues(0, 0, 0, 1);
            node.updateMatrix();
        }

        if (gltfSpec.children) {
            for (const nodeIndex of gltfSpec.children) {
                node.addChild(await this.loadNode(nodeIndex))
            }
        }
        // TODO: Migrate camera importing
        // if (gltfSpec.camera !== undefined) {
        //     options.camera = await this.loadCamera(gltfSpec.camera);
        // }
        if (gltfSpec.mesh !== undefined) {
            node.mesh = await this.loadMesh(gltfSpec.mesh);
        }

        this.cache.set(gltfSpec, node);
        return node;
    }

    async loadScene(nameOrIndex: string | number): Promise<Scene> {
        const gltfSpec = this.findByNameOrIndex(this.gltf.scenes, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        let options: SceneOptions = { nodes: [] };
        if (gltfSpec.nodes) {
            for (const nodeIndex of gltfSpec.nodes) {
                const node = await this.loadNode(nodeIndex);
                options.nodes.push(node);
            }
        }

        const scene = new Scene(options);
        this.cache.set(gltfSpec, scene);
        return scene;
    }

}

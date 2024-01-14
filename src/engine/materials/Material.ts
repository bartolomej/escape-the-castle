import {mat3, vec3, vec4} from 'gl-matrix';
import {Texture} from "../textures/Texture";

export type MaterialOptions = Partial<Material>;

export class Material {
    // TODO: Should we move these fields (tex coords, factor, transform) into a texture class?
    baseColorTexture: Texture;
    baseColorTexCoord: number;
    baseColorFactor: vec4;
    // TODO: For now this is only defined for base color, but it should apply to other material textures as well
    baseColorTransform: mat3;

    metallicRoughnessTexture: Texture;
    metallicRoughnessTexCoord: number;
    metallicFactor: number;
    roughnessFactor: number;

    normalTexture: Texture;
    normalTexCoord: number;
    normalFactor: number;

    occlusionTexture: Texture;
    occlusionTexCoord: number;
    occlusionFactor: number;

    emissiveTexture: Texture;
    emissiveTexCoord: number;
    emissiveFactor: vec3;

    alphaMode: string;
    alphaCutoff: number;
    doubleSided: boolean;

    constructor(options: MaterialOptions) {
        this.baseColorTexture = options.baseColorTexture || null;
        this.baseColorTexCoord = options.baseColorTexCoord || 0;
        this.baseColorFactor = options.baseColorFactor
            ? vec4.clone(options.baseColorFactor)
            : vec4.fromValues(1, 1, 1, 1);
        this.baseColorTransform = options.baseColorTransform ?? mat3.create();

        this.metallicRoughnessTexture = options.metallicRoughnessTexture || null;
        this.metallicRoughnessTexCoord = options.metallicRoughnessTexCoord || 0;
        this.metallicFactor = options.metallicFactor !== undefined ? options.metallicFactor : 1;
        this.roughnessFactor = options.roughnessFactor !== undefined ? options.roughnessFactor : 1;

        this.normalTexture = options.normalTexture || null;
        this.normalTexCoord = options.normalTexCoord || 0;
        this.normalFactor = options.normalFactor !== undefined ? options.normalFactor : 1;

        this.occlusionTexture = options.occlusionTexture || null;
        this.occlusionTexCoord = options.occlusionTexCoord || 0;
        this.occlusionFactor = options.occlusionFactor !== undefined ? options.occlusionFactor : 1;

        this.emissiveTexture = options.emissiveTexture || null;
        this.emissiveTexCoord = options.emissiveTexCoord || 0;
        this.emissiveFactor = options.emissiveFactor
            ? vec3.clone(options.emissiveFactor)
            : vec3.fromValues(0, 0, 0);

        this.alphaMode = options.alphaMode || 'OPAQUE';
        this.alphaCutoff = options.alphaCutoff !== undefined ? options.alphaCutoff : 0.5;
        this.doubleSided = options.doubleSided || false;
    }

}

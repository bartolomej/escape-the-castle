export type TextureSamplerOptions = Partial<TextureSampler>;

/**
 * See: https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_012_TexturesImagesSamplers.md
 */
export class TextureSampler {
    mag: number;
    min: number;
    wrapT: number;
    wrapS: number;

    constructor(options: TextureSamplerOptions = {}) {
        this.mag = options.mag || 9729;
        this.min = options.min || 9729;
        this.wrapS = options.wrapS || 10497;
        this.wrapT = options.wrapT || 10497;
    }

}

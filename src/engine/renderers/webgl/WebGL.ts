type WebGLAttributes = Record<string, number>;
type WebGLUniforms = Record<string, WebGLUniformLocation>;

export type WebGLProgramBundle = {
  program: WebGLProgram,
  attributes: WebGLAttributes,
  uniforms: WebGLUniforms
}

type WebGlProgramSource = {
  vertex: string,
  fragment: string,
}

type WebGLTextureOptions = {
  target?: number,
  format?: number,
  iformat?: number,
  type?: number,
  texture?: WebGLTexture
  unit?: number;
  image?: TexImageSource,
  wrapS?: number,
  wrapT?: number,
  min?: number,
  mag?: number,
  mip?: number,
  width?: number,
  height?: number,
  data?: ArrayBufferView
}

type WebGLBufferOptions = {
  target?: number,
  hint?: number,
  buffer?: WebGLBuffer,
  data?: DataView
}

type WebGlSamplerOptions = {
  sampler?: WebGLSampler,
  wrapS?: number,
  wrapT?: number,
  min?: number,
  mag?: number,
}

export class WebGL {

  static buildProgram(gl: WebGL2RenderingContext, program: WebGlProgramSource) {
    try {
      return WebGL.createProgram(gl, [
        WebGL.createShader(gl, program.vertex, gl.VERTEX_SHADER),
        WebGL.createShader(gl, program.fragment, gl.FRAGMENT_SHADER)
      ]);
    } catch (err) {
      throw new Error('Error compiling ' + '\n' + err);
    }
  }

  static createProgram(gl: WebGL2RenderingContext, shaders: WebGLShader[]): WebGLProgramBundle {
    const program = gl.createProgram();
    for (const shader of shaders) {
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    const status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!status) {
      const log = gl.getProgramInfoLog(program);
      throw new Error('Cannot link program\nInfo log:\n' + log);
    }

    const attributes: Record<string, number> = {};
    const activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < activeAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      attributes[info.name] = gl.getAttribLocation(program, info.name);
    }

    const uniforms: Record<string, WebGLUniformLocation> = {};
    const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < activeUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      uniforms[info.name] = gl.getUniformLocation(program, info.name);

      // WebGL only returns the first index name for vector uniforms (e.g. `uniformName[0]`).
      // If this is a vector uniform (size > 1), extract subsequent uniform index locations manually.
      for (let j = 1; j < info.size; j++) {
        const name = info.name.replace("[0]", `[${j}]`);
        uniforms[name] = gl.getUniformLocation(program, name);
      }
    }

    return { program, attributes, uniforms };
  }

  static createShader(gl: WebGL2RenderingContext, source: string, type: number) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
      const log = gl.getShaderInfoLog(shader);
      throw new Error(`Cannot compile shader:\n${source}Info log:\n${log}`);
    }
    return shader;
  }

  static createTexture(gl: WebGL2RenderingContext, options: WebGLTextureOptions) {
    const target  = options.target  || gl.TEXTURE_2D;
    const iformat = options.iformat || gl.RGBA;
    const format  = options.format  || gl.RGBA;
    const type    = options.type    || gl.UNSIGNED_BYTE;
    const texture = options.texture || gl.createTexture();

    if (typeof options.unit !== 'undefined') {
      gl.activeTexture(gl.TEXTURE0 + options.unit);
    }

    gl.bindTexture(target, texture);

    if (options.image) {
      gl.texImage2D(
        target, 0, iformat,
        format, type, options.image);
    } else {
      // if options.data == null, just allocate
      gl.texImage2D(
        target, 0, iformat,
        options.width, options.height, 0,
        format, type, options.data);
    }

    if (options.wrapS) { gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrapS); }
    if (options.wrapT) { gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrapT); }
    if (options.min) { gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, options.min); }
    if (options.mag) { gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, options.mag); }
    if (options.mip) { gl.generateMipmap(target); }

    return texture;
  }

  static createBuffer(gl: WebGL2RenderingContext, options: WebGLBufferOptions) {
    const target = options.target || gl.ARRAY_BUFFER;
    const hint   = options.hint   || gl.STATIC_DRAW;
    const buffer = options.buffer || gl.createBuffer();

    gl.bindBuffer(target, buffer);
    gl.bufferData(target, options.data, hint);

    return buffer;
  }

  static createSampler(gl: WebGL2RenderingContext, options: WebGlSamplerOptions) {
    const sampler = options.sampler || gl.createSampler();

    if (options.wrapS) { gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, options.wrapS); }
    if (options.wrapT) { gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, options.wrapT); }
    if (options.min) { gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, options.min); }
    if (options.mag) { gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, options.mag); }

    return sampler;
  }

}

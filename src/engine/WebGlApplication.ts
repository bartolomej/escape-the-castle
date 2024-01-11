export abstract class WebGlApplication {

  public readonly canvas: HTMLCanvasElement;
  public gl: WebGL2RenderingContext;
  private t0: number;

  constructor (canvas: HTMLCanvasElement, glOptions?: WebGLContextAttributes) {
    this.internalUpdate = this.internalUpdate.bind(this);

    this.canvas = canvas;
    this._initGL(glOptions);
  }

  _initGL (glOptions?: WebGLContextAttributes) {
    this.gl = null;
    try {
      this.gl = this.canvas.getContext('webgl2', glOptions);
    } catch (error) {
    }

    if (!this.gl) {
      throw new Error('Cannot create WebGL 2.0 context');
    }
  }

  private internalUpdate (time: number) {
    this.internalResize();
    const t = time * 0.001;
    const dt = (this.t0 ? t - this.t0 : t);
    this.update(dt, t);
    this.render(dt, t);
    this.t0 = t;
    requestAnimationFrame(this.internalUpdate);
  }

  private internalResize () {
    const { canvas, gl } = this;

    if (canvas.width !== canvas.clientWidth ||
      canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

      this.updateAspectRatio();
    }
  }

  private updateAspectRatio() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const aspectRatio = w / h;
    this.resize(aspectRatio);
  }

  /**
   * Asset loading, initialization code (including event handler binding),...
   *
   * Must call `super.start()` in the extended class (at the end of the method).
   */
  public start () {
    this.updateAspectRatio();
    requestAnimationFrame(this.internalUpdate);
  }

  /**
   * Update code (input, animations, AI ...)
   * @param dt Delta time from the last update frame.
   * @param time Elapsed time since the call of `this.start`.
   */
  public abstract update (dt: number, time: number): void;

  /**
   * Render logic (WebGL API calls).
   * @param dt Delta time from the last update frame.
   * @param time Elapsed time since the call of `this.start`.
   */
  public abstract render (dt: number, time: number): void;

  /**
   * Resize code (e.g. update projection matrix)
   */
  public abstract resize (aspectRatio: number): void;

}

import { Canvas, createCanvas, getCanvasImage } from "./utils";

export class Playback {
  public frames: HTMLImageElement[] = [];

  private canvas: Canvas = createCanvas();
  private idx: number = 0;
  private ltr: boolean = true;

  public constructor(
    public readonly width: number,
    public readonly height: number,
    private frameCount: number
  ) {
    this.canvas.element.width = width;
    this.canvas.element.height = height;
  }

  public hasFullBuffer(): boolean {
    return this.frames.length >= this.frameCount;
  }

  public record(canvas: HTMLCanvasElement) {
    if (this.hasFullBuffer()) return;

    getCanvasImage(canvas).then((frame) => {
      if (frame !== null) this.frames.push(frame);
    });
  }

  public draw(context: CanvasRenderingContext2D) {
    if (this.idx === this.frames.length) {
      this.idx -= 1;
      this.ltr = false;
    } else if (this.idx === -1) {
      this.idx += 1;
      this.ltr = true;
    }

    const frame = this.frames[this.idx];
    if (frame === undefined) return;
    context.drawImage(frame, 0, 0);

    if (this.ltr) {
      this.idx += 1;
    } else {
      this.idx -= 1;
    }
  }

  public clearFrames() {
    this.frames = [];
    this.idx = 0;
    this.ltr = true;
  }
}

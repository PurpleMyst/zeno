import { Canvas, createCanvas, getCanvasImage } from "./utils";

export class Playback {
  public frames: HTMLImageElement[] = [];

  private canvas: Canvas = createCanvas();
  private idx: number = 0;
  private ltr: boolean = true;

  private recordingStart: DOMHighResTimeStamp = performance.now();

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
    const frame = this.frames[this.idx];
    if (frame === undefined) return;
    context.drawImage(frame, 0, 0);

    if (this.ltr) {
      if (this.idx === this.frames.length - 1) {
        this.idx -= 1;
        this.ltr = false;
      } else {
        this.idx += 1;
      }
    } else {
      if (this.idx === 0) {
        this.idx += 1;
        this.ltr = true;
      } else {
        this.idx -= 1;
      }
    }
  }

  public clearFrames() {
    this.frames = [];
    this.idx = 0;
    this.ltr = true;
    this.recordingStart = performance.now();
  }

  public setFrameCount(frameCount: number) {
    this.frameCount = frameCount;
    this.clearFrames();
  }

  public doneRecording() {
    const recordingEnd = performance.now();
    const elapsed = recordingEnd - this.recordingStart;
    const fps = this.frameCount / (elapsed / 1000);
    console.log(
      `Recording took ${elapsed}ms (avg. framerate ${fps.toFixed(2)} FPS)`
    );
    this.idx = this.frames.length;
  }
}

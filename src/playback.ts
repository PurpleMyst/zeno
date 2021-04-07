import { Canvas, createCanvas } from "./utils";

export class Playback {
  public frames: ImageData[] = [];

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

  public record(ctx: CanvasRenderingContext2D) {
    if (this.hasFullBuffer()) return;
    this.frames.push(ctx.getImageData(0, 0, this.width, this.height));
  }

  public draw(context: CanvasRenderingContext2D) {
    const frame = this.frames[this.idx];
    if (frame === undefined) return;
    context.putImageData(frame, 0, 0);

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
    const fps = (this.frameCount / (elapsed / 1000)).toFixed(2);
    console.log(
      `[%cZENO%c] Recording took ${elapsed}ms (avg. framerate ${fps} FPS)`,
      "color: #c03822",
      ""
    );
    this.idx = this.frames.length - 1;
  }
}

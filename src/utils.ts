export const DISPLAY_PREVIEW_CONTAINER = "display-preview";
export const VIDEO_PREVIEW_CONTAINER = "video-preview";

export function createCanvas(): Canvas {
  const element = document.createElement("canvas");
  const context = element.getContext("2d")!;
  return { element, context };
}

type Canvas = {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
};

export class DoubleBufferCanvas {
  public buffer: Canvas = createCanvas();
  public display: Canvas = createCanvas();

  constructor(w: number, h: number) {
    this.buffer.element.width = this.display.element.width = w;
    this.buffer.element.height = this.display.element.height = h;
  }

  blit() {
    this.display.context.clearRect(
      0,
      0,
      this.display.element.width,
      this.display.element.height
    );

    this.display.context.drawImage(this.buffer.element, 0, 0);
  }
}
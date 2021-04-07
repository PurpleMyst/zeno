export function createCanvas(): Canvas {
  const element = document.createElement("canvas");
  const context = element.getContext("2d")!;
  return { element, context };
}

export type Canvas = {
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

// https://stackoverflow.com/a/55266303
export function setAdjustedInterval(interval: number, callback: () => void) {
  let expected = performance.now() + interval;

  const driftHistory: number[] = [];
  const driftHistorySamples = 10;
  let driftCorrection = 0;

  /**
   * Calculate the drift of an array utilizing the median.
   * The median is chosen to avoid outliers swinging the drift too much.
   * Outliers happen, for example, when the user switches tabs and back
   */
  function calculateDrift(arr: number[]): number {
    // Use concat to make a copy of the array.
    const values = arr.concat();
    values.sort((a, b) => a - b);
    if (values.length === 0) return 0;
    const middle = Math.floor(values.length / 2);
    if (values.length % 2 !== 0) return values[middle]!;
    const median = (values[middle - 1]! + values[middle]!) / 2;
    return median;
  }

  setTimeout(step, interval);
  function step() {
    callback();

    const dt = performance.now() - expected;
    if (dt <= interval) {
      // don't update the history for exceptionally large values

      // sample drift amount to history after removing current correction
      // (add to remove because the correction is applied by subtraction)
      driftHistory.push(dt + driftCorrection);

      // predict new drift correction
      driftCorrection = calculateDrift(driftHistory);

      // cap and refresh samples
      if (driftHistory.length >= driftHistorySamples) {
        driftHistory.shift();
      }
    }

    expected += interval;
    // take into account drift with prediction
    setTimeout(step, Math.max(0, interval - dt - driftCorrection));
  }
}

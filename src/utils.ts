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

export function getCanvasImage(
  canvas: HTMLCanvasElement
): Promise<HTMLImageElement | null> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) {
        resolve(null);
        return;
      }

      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function (err) {
        reject(err);
      };

      img.src = url;
    });
  });
}

// https://stackoverflow.com/a/55266303
export function setAdjustedInterval(interval: number, callback: () => void) {
  let expected = Date.now() + interval;

  const driftHistory: number[] = [];
  const driftHistorySamples = 10;
  let driftCorrection = 0;

  function calc_drift(arr: number[]): number {
    // Calculate drift correction.

    /*
  In this example I've used a simple median.
  You can use other methods, but it's important not to use an average. 
  If the user switches tabs and back, an average would put far too much
  weight on the outlier.
  */

    const values = arr.concat(); // copy array so it isn't mutated

    values.sort(function (a, b) {
      return a - b;
    });
    if (values.length === 0) return 0;
    const half = Math.floor(values.length / 2);
    if (values.length % 2) return values[half]!;
    const median = (values[half - 1]! + values[half]!) / 2.0;

    return median;
  }

  setTimeout(step, interval);
  function step() {
    const dt = Date.now() - expected; // the drift (positive for overshooting)
    // do what is to be done
    callback();

    // don't update the history for exceptionally large values
    if (dt <= interval) {
      // sample drift amount to history after removing current correction
      // (add to remove because the correction is applied by subtraction)
      driftHistory.push(dt + driftCorrection);

      // predict new drift correction
      driftCorrection = calc_drift(driftHistory);

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

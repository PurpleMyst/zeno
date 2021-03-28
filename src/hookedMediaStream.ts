let drawInterval: NodeJS.Timeout;

export type Canvases = {
  [k in "buffer" | "freeze" | "display"]: {
    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  };
};

export type Inputs = {
  [k in "pillarbox" | "letterbox" | "freeze"]: HTMLInputElement;
};

export type Values = { [k in keyof Inputs]: number };

// Background Blur for Google Meet does this (hello@brownfoxlabs.com)

export class HookedMediaStream extends MediaStream {
  constructor(
    oldStream: MediaStream,
    canvases: Canvases,
    inputs: Inputs,
    values: Values,
    $video: HTMLVideoElement
  ) {
    // Copy original stream settings
    super(oldStream);
    $video.srcObject = oldStream;

    const oldStreamSettings = oldStream.getVideoTracks()[0]!.getSettings();
    const w = oldStreamSettings.width!;
    const h = oldStreamSettings.height!;

    Object.values(canvases).forEach((canvas) => {
      canvas.element.width = w;
      canvas.element.height = h;
    });

    const context = canvases.buffer.context;
    const freeze = {
      state: false,
      init: false,
      image: document.createElement("img"),
      canvas: canvases.freeze,
    };

    inputs.freeze.addEventListener("change", function () {
      freeze.state = freeze.init = this.checked;
    });

    context.textAlign = "center";
    context.textBaseline = "middle";

    function draw() {
      context.clearRect(0, 0, w, h);

      // Get values
      const pillarbox = (values.pillarbox * w) / 2;
      const letterbox = (values.letterbox * h) / 2;

      if (freeze.init) {
        // Initialize frozen image
        freeze.canvas.context.drawImage($video, 0, 0, w, h);
        let data = freeze.canvas.element.toDataURL("image/png");
        freeze.image.setAttribute("src", data);
        freeze.init = false;
      } else if (freeze.state) {
        // Draw frozen image
        context.drawImage(freeze.image, 0, 0, w, h);
      } else if ($video.srcObject) {
        // Draw video
        context.drawImage($video, 0, 0, w, h);
      } else {
        // Draw preview stripes if video doesn't exist
        "18, 100%, 68%; -10,100%,80%; 5, 90%, 72%; 48, 100%, 75%; 36, 100%, 70%; 20, 90%, 70%"
          .split(";")
          .forEach((color, index) => {
            context.fillStyle = `hsl(${color})`;
            context.fillRect((index * w) / 6, 0, w / 6, h);
          });
      }

      // Pillarbox: crop width
      if (pillarbox) {
        context.clearRect(0, 0, pillarbox, h);
        context.clearRect(w, 0, -pillarbox, h);
      }

      // Letterbox: crop height
      if (letterbox) {
        context.clearRect(0, 0, w, letterbox);
        context.clearRect(0, h, w, -letterbox);
      }

      canvases.display.context.clearRect(0, 0, w, h);
      canvases.display.context.drawImage(canvases.buffer.element, 0, 0);
    }

    // Redraw at 30FPS
    clearInterval(drawInterval);
    drawInterval = setInterval(draw, 33);

    // Create a MediaStream from our display canvas and return it as the new MediaStream
    // @ts-expect-error
    const newStream = canvases.display.element.captureStream(30);
    newStream.addEventListener("inactive", () => {
      oldStream.getTracks().forEach((track: { stop: () => void }) => {
        track.stop();
      });
      canvases.display.context.clearRect(0, 0, w, h);
      $video.srcObject = null;
    });
    return newStream;
  }
}

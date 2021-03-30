import { createCanvas, DoubleBufferCanvas } from "./utils";

export type Inputs = {
  [k in "pillarbox" | "letterbox" | "freeze"]: HTMLInputElement;
};

export type Values = { [k in keyof Inputs]: number };

// Background Blur for Google Meet does this (hello@brownfoxlabs.com)

export class HookedMediaStream extends MediaStream {
  constructor(
    oldStream: MediaStream,
    inputs: Inputs,
    values: Values,
    $previews: HTMLElement
  ) {
    // Copy original stream settings
    super(oldStream);

    // Create preview video
    const $video = document.createElement("video");
    $video.setAttribute("playsinline", "");
    $video.setAttribute("autoplay", "");
    $video.setAttribute("muted", "");
    $video.srcObject = oldStream;

    // Create enabled checkbox
    const $enabled = document.createElement("input");
    $enabled.type = "checkbox";
    $enabled.checked = $previews.childElementCount === 0;

    // Read width/height from old stream
    const oldStreamSettings = oldStream.getVideoTracks()[0]!.getSettings();
    const width = oldStreamSettings.width!;
    const height = oldStreamSettings.height!;

    // Create our double buffer
    const doubleBuffer = new DoubleBufferCanvas(width, height);

    // Put checkbox, video and display preview in their place
    $previews?.append($enabled, $video, doubleBuffer.buffer.element);

    const freezeState = {
      activated: false,
      needToInitialize: false,
      image: new Image(),
      canvas: createCanvas(),
    };
    freezeState.canvas.element.width = width;
    freezeState.canvas.element.height = height;

    inputs.freeze.addEventListener("change", function () {
      freezeState.activated = freezeState.needToInitialize = this.checked;
    });

    function draw() {
      const context = doubleBuffer.buffer.context;
      context.textAlign = "center";
      context.textBaseline = "middle";

      context.clearRect(0, 0, width, height);

      // Get values
      const pillarbox = (values.pillarbox * width) / 2;
      const letterbox = (values.letterbox * height) / 2;

      if ($enabled.checked && freezeState.activated) {
        if (freezeState.needToInitialize) {
          // Initialize frozen image
          freezeState.canvas.context.drawImage($video, 0, 0, width, height);
          const src = freezeState.canvas.element.toDataURL("image/png");
          freezeState.image.src = src;
          freezeState.needToInitialize = false;
        }

        // Draw frozen image
        context.drawImage(freezeState.image, 0, 0, width, height);
      } else if ($video.srcObject) {
        // Draw video
        context.drawImage($video, 0, 0, width, height);
      } else {
        // Draw preview stripes if video doesn't exist
        "18, 100%, 68%; -10,100%,80%; 5, 90%, 72%; 48, 100%, 75%; 36, 100%, 70%; 20, 90%, 70%"
          .split(";")
          .forEach((color, index) => {
            context.fillStyle = `hsl(${color})`;
            context.fillRect((index * width) / 6, 0, width / 6, height);
          });
      }

      // Pillarbox: crop width
      if ($enabled.checked && pillarbox) {
        context.clearRect(0, 0, pillarbox, height);
        context.clearRect(width, 0, -pillarbox, height);
      }

      // Letterbox: crop height
      if ($enabled.checked && letterbox) {
        context.clearRect(0, 0, width, letterbox);
        context.clearRect(0, height, width, -letterbox);
      }

      doubleBuffer.blit();

      if (!newStream.active) {
        oldStream.getTracks().forEach((track) => track.stop());
        doubleBuffer.display.context.clearRect(0, 0, width, height);
        $previews.removeChild($enabled);
        $previews.removeChild(doubleBuffer.buffer.element);
        $previews.removeChild($video);
        $video.srcObject = null;
        clearInterval(drawInterval);
      }
    }

    // Redraw at 30FPS
    const drawInterval = setInterval(draw, 33);

    // Create a MediaStream from our display canvas
    // @ts-expect-error
    const newStream = doubleBuffer.display.element.captureStream(30);
    return newStream;
  }
}

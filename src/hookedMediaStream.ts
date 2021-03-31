import { Playback } from "./playback";
import { DoubleBufferCanvas } from "./utils";

export type Inputs = {
  [k in
    | "pillarbox"
    | "letterbox"
    | "playbackDuration"
    | "playback"]: HTMLInputElement;
};

// Background Blur for Google Meet does this (hello@brownfoxlabs.com)

export class HookedMediaStream extends MediaStream {
  constructor(oldStream: MediaStream, inputs: Inputs, $previews: HTMLElement) {
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

    // Create the playback manager instance
    const playback = new Playback(
      width,
      height,
      inputs.playbackDuration.valueAsNumber * 30
    );

    // If we enable/disable freeze or effects alltogether, let's reset the frames
    inputs.playback.addEventListener("change", function () {
      playback.clearFrames();
    });
    inputs.playbackDuration.addEventListener("change", function () {
      playback.setFrameCount(this.valueAsNumber * 30);
    });
    $enabled.addEventListener("change", function () {
      playback.clearFrames();
    });

    async function draw() {
      const { context, element: canvas } = doubleBuffer.buffer;
      context.textAlign = "center";
      context.textBaseline = "middle";

      context.clearRect(0, 0, width, height);

      // Get values
      const pillarbox = (inputs.pillarbox.valueAsNumber * width) / 2;
      const letterbox = (inputs.letterbox.valueAsNumber * height) / 2;

      if (
        $enabled.checked &&
        inputs.playback.checked &&
        playback.hasFullBuffer()
      ) {
        if (canvas.classList.contains("recording")) {
          canvas.classList.remove("recording");
          canvas.classList.add("playback");
          playback.doneRecording();
        }

        // If effects and freeze are enabled, and we have a full playback
        // buffer, let's draw from the playback
        playback.draw(context);
      } else if ($video.srcObject) {
        // If effects and freeze aren't both enabled or we don't have a full
        // playback buffer, let's just draw the current video and record it to
        // the playback buffer
        canvas.classList.remove("playback", "recording");
        context.drawImage($video, 0, 0);
        if (
          $enabled.checked &&
          inputs.playback.checked &&
          !playback.hasFullBuffer()
        ) {
          playback.record(canvas);
          canvas.classList.add("recording");
        }
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
        return;
      }

      setTimeout(draw, 33);
    }
    setTimeout(draw, 33);

    // Create a MediaStream from our display canvas
    // @ts-expect-error
    const newStream = doubleBuffer.display.element.captureStream(30);
    return newStream;
  }
}

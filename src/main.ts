import styleCss from "./style.css";

(async function mercator_studio() {
  "use strict";

  // Create shadow root
  const $host = document.createElement("aside");

  // Create form
  const $main = document.createElement("main");
  $main.addEventListener("click", (event) => {
    if (!$main.classList.contains("focus") && event.target !== $collapse) {
      $main.classList.add("focus");
    }
  });

  const $collapse = document.createElement("button");
  $collapse.textContent = "↑ collapse ↑";
  $collapse.id = "collapse";
  $collapse.addEventListener("click", () => {
    $main.classList.remove("focus");
  });

  const $minimize = document.createElement("button");
  $minimize.id = "minimize";
  $minimize.title = "toggle super tiny mode";
  $minimize.addEventListener("click", (event) => {
    event.stopPropagation();
    $main.classList.toggle("minimize");
  });

  const $form = document.createElement("form");
  const $style = document.createElement("style");
  $style.textContent = styleCss;
  $form.append($style);

  // Create inputs
  const savedValues = JSON.parse(
    window.localStorage.getItem("mercator-studio-values") ?? ""
  );

  function createInput(key: string) {
    const $input = document.createElement("input");
    $input.id = key;
    if (key === "freeze") {
      $input.type = "checkbox";
    } else {
      $input.type = "range";
      $input.min = ["scale", "pillarbox", "letterbox"].includes(key)
        ? "0"
        : "-1";
      $input.max = "1";
      $input.step = "0.00001";
      $input.value = "0";
    }
    $input.classList.add("input");

    return $input;
  }

  const inputs = Object.fromEntries(
    "pillarbox,letterbox,freeze".split(",").map((key) => {
      const $input = createInput(key);
      if (savedValues) $input.value = savedValues[key];
      const $label = document.createElement("label");
      $label.textContent = key;
      $form.append($label);
      $label.append($input);
      return [key, $input];
    })
  ) as {
    [k in "pillarbox" | "letterbox" | "freeze"]: HTMLInputElement;
  };

  const values = Object.fromEntries(
    Object.entries(inputs).map((entry) => [
      entry[0],
      entry[1].valueAsNumber || +entry[1].value,
    ])
  ) as {
    [k in keyof typeof inputs]: number;
  };

  function updateValue($input: HTMLInputElement, value: number) {
    (values as any)[$input.id] = $input.valueAsNumber = value;

    window.localStorage.setItem(
      "mercator-studio-values",
      JSON.stringify(values)
    );
  }

  // Right click to individually reset
  $form.addEventListener("contextmenu", (event) => {
    if (
      !(event.target instanceof HTMLInputElement) ||
      event.target.type !== "range"
    )
      return;
    event.preventDefault();
    updateValue(event.target, 0);
  });

  // Update value on change
  $form.addEventListener("input", (event) => {
    const $input = event.target;
    if ($input instanceof HTMLInputElement)
      updateValue($input, $input.valueAsNumber);
  });

  const $presetsLabel = document.createElement("label");
  const $presetsCollection = document.createElement("div");
  $presetsCollection.id = "reset";

  const $reset = document.createElement("button");
  $reset.textContent = $reset.id = "reset";
  $presetsLabel.textContent = "presets";

  $presetsCollection.append($reset);
  $presetsLabel.append($presetsCollection);

  $presetsLabel.addEventListener("click", (event) => {
    // Cancel refresh
    event.preventDefault();

    // Reset all
    Object.values(inputs).forEach(($input: HTMLInputElement) => {
      updateValue($input, 0);
    });
  });

  const $previews = document.createElement("div");
  $previews.id = "previews";

  // Create preview video
  const $video = document.createElement("video");
  $video.setAttribute("playsinline", "");
  $video.setAttribute("autoplay", "");
  $video.setAttribute("muted", "");

  // Create canvases
  const canvases = Object.fromEntries(
    ["buffer", "freeze", "display"].map((name) => {
      const element = document.createElement("canvas");
      const context = element.getContext("2d");
      return [name, { element, context }];
    })
  ) as {
    [k in "buffer" | "freeze" | "display"]: {
      element: HTMLCanvasElement;
      context: CanvasRenderingContext2D;
    };
  };

  // Create title

  const $title = document.createElement("h1");

  $title.textContent = "↓ Mercator Studio ↓";

  $previews.append($minimize, $video, canvases.buffer.element, $title);

  // Add UI to page
  $form.append($presetsLabel);

  $main.append($collapse, $form, $previews);

  $host.append($main);
  document.body.append($host);

  let drawInterval: NodeJS.Timeout;

  // Background Blur for Google Meet does this (hello@brownfoxlabs.com)

  class HookedMediaStream extends MediaStream {
    constructor(oldStream: MediaStream) {
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

  /**
   * Intercept the user's camera to hook our patched MediaStream onto it
   */
  async function hookedGetUserMedia(constraints: {
    video: unknown;
    audio: unknown;
  }) {
    if (constraints && constraints.video && !constraints.audio) {
      return new HookedMediaStream(
        await (navigator.mediaDevices as any).oldGetUserMedia(constraints)
      );
    } else {
      return (navigator.mediaDevices as any).oldGetUserMedia(constraints);
    }
  }

  (MediaDevices.prototype as any).oldGetUserMedia =
    MediaDevices.prototype.getUserMedia;
  (MediaDevices.prototype.getUserMedia as any) = hookedGetUserMedia;
})();

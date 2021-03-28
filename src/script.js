// ==UserScript==
// @name      Zeno
// @namespace PurpleMyst
// @match     https://meet.google.com/*
// @grant     none
// ==/UserScript==

// @ts-check

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
  const fontFamily = `"Google Sans", Roboto, RobotDraft, Helvetica, sans-serif, serif`;
  $style.textContent = `
* {
	box-sizing: border-box;
	transition: all 200ms;
}
*:not(input) {
	user-select: none;
}
@media (prefers-reduced-motion) {
	* {
		transition: all 0s;
	}
}
:focus {
	outline: 0;
}
main {
	z-index: 99999;
	position: fixed;
	left: 0;
	top: 0;
	width: 480px;
	max-width: 100vw;
	height: auto;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	background: white;
	transform: translateY(calc(-100% + 3rem));
	box-shadow: 0 .1rem .25rem #0004;
	border-radius: 0 0 .75rem 0;
	padding: 1rem 1rem 0 1rem;
	overflow: hidden;
	font-family: ${fontFamily};
	font-size: 1rem;
	cursor: pointer;
}
button{
	font-family: inherit;
	font-size: .8rem;
}
main #collapse {
	background: white;
	cursor: pointer;
	margin-bottom: .5rem;
}
main.focus {
	transform: none;
	border-radius: 0;
	height: 100vh;
	padding: 1rem;
	cursor: default;
	overflow: hidden scroll;
}
main.focus #minimize{
	display: none;
}
main.minimize {
	width: 1rem;
	padding-right: 0;
}
#minimize {
	font-family: inherit;
	font-size: .5rem;
	font-weight: bold;
	color: #444;
	margin-left: -1rem;
	flex: 0 0 1rem;
	width: 1rem;
	text-align: center;
	border: 0;
	background: white;
	cursor: pointer;
	overflow-wrap: anywhere;
}
#minimize::before{
	content: "◀";
	transition: inherit;
}
#minimize:hover::before,
.minimize #minimize::before{
	margin-left: -2px;
}
.minimize #minimize::before{
	content: "▶";
}
.minimize #minimize:hover::before{
	margin-left: 0;
}
#previews {
	margin-top: 1rem;
	height: 3rem;
	display: flex;
}
#previews>video,
#previews>canvas {
	height: 100%;
	width: auto;
	background-image: linear-gradient(90deg,
		hsl( 18, 100%, 68%) 16.7%,	hsl(-10, 100%, 80%) 16.7%,
		hsl(-10, 100%, 80%) 33.3%,	hsl(  5,  90%, 72%) 33.3%,
		hsl(  5,  90%, 72%) 50%,	hsl( 48, 100%, 75%) 50%,
		hsl( 48, 100%, 75%) 66.7%,	hsl( 36, 100%, 70%) 66.7%,
		hsl( 36, 100%, 70%) 83.3%,	hsl( 20,  90%, 70%) 83.3%
	);
	margin-right: 1rem;
}
#previews>h1 {
	flex-grow: 1;
	font-size: 1rem;
	font-weight: normal;
	text-align: center;
	color: #444;
	line-height: 1.5rem;
}
:hover>#previews>h1 {
	transform: translateY(.1rem); /* Tiny nudge downwards */
}
.focus>#previews>h1 {
	display: none;
}
.focus>#previews {
	height: auto;
}
.focus>#previews>* {
	height: auto;
	width: calc(50% - .5rem);
}
#presets,
label {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
#presets>* {
	border: 0;
	background: transparent;
	flex-grow: 1;
}
#presets>:first-child {
	border-radius: 100px 0 0 100px;
}
#presets>:last-child {
	border-radius: 0 100px 100px 0;
}
label {
	height: 2rem;
}
label>*{
	width: calc(100% - 6.5rem);
}
label>*,
#collapse {
	height: 1.5rem;
	border-radius: 0.75rem;
	border: 0.25rem solid lightgray;
}
label>:hover,
#collapse:hover {
	border: 0.25rem solid gray;
}
#presets>:hover {
	background: #0003;
}
#presets>:focus {
	background: black;
	color: white;
}
#presets:focus-within,
#collapse:focus,
label>:focus {
	border-color: black;
}
textarea {
	text-align: center;
	font-family: inherit;
	font-weight: bold;
	resize: none;
	line-height: 1;
}
input[type=range] {
	-webkit-appearance: none;
	--gradient: transparent, transparent;
	--rainbow: hsl(0, 80%, 75%), hsl(30, 80%, 75%), hsl(60, 80%, 75%), hsl(90, 80%, 75%), hsl(120, 80%, 75%), hsl(150, 80%, 75%), hsl(180, 80%, 75%), hsl(210, 80%, 75%), hsl(240, 80%, 75%), hsl(270, 80%, 75%), hsl(300, 80%, 75%), hsl(330, 80%, 75%);
	background: linear-gradient(90deg, var(--gradient)), linear-gradient(90deg, var(--rainbow));
}
input[type=range]::-webkit-slider-thumb {
	-webkit-appearance: none;
	background: white;
	width: 1rem;
	height: 1rem;
	border: 0.25rem solid black;
	border-radius: 0.5rem;
}
input[type=range]:focus::-webkit-slider-thumb {
	border-color: white;
	background: black;
}
input#exposure,
input#fog,
input#vignette {
	--gradient: black, #8880, white
}
input#contrast {
	--gradient: gray, #8880
}
input#temperature {
	--gradient: #88f, #8880, #ff8
}
input#tint {
	--gradient: #f8f, #8880, #8f8
}
input#sepia {
	--gradient: #8880, #aa8
}
input#hue,
input#rotate {
	background: linear-gradient(90deg, hsl(0, 80%, 75%), hsl(60, 80%, 75%), hsl(120, 80%, 75%), hsl(180, 80%, 75%), hsl(240, 80%, 75%), hsl(300, 80%, 75%), hsl(0, 80%, 75%), hsl(60, 80%, 75%), hsl(120, 80%, 75%), hsl(180, 80%, 75%), hsl(240, 80%, 75%), hsl(300, 80%, 75%), hsl(0, 80%, 75%))
}
input#saturate {
	--gradient: gray, #8880 50%, blue, magenta
}
input#blur {
	--gradient: #8880, gray
}
input#scale,
input#x,
input#y,
input#pillarbox,
input#letterbox {
	--gradient: black, white
}
`;
  $form.append($style);

  // Create inputs
  const savedValues = JSON.parse(
    window.localStorage.getItem("mercator-studio-values")
  );

  /**
   * @param {string} key
   */
  function createInput(key) {
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
  );

  /** @type {{[k: string]: number}} */
  const values = Object.fromEntries(
    Object.entries(inputs).map((entry) => [
      entry[0],
      entry[1].valueAsNumber || +entry[1].value,
    ])
  );

  /**
   * @param {HTMLInputElement} $input
   * @param {number} value
   */
  function updateValue($input, value) {
    values[$input.id] = $input.valueAsNumber = value;
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
    Object.values(inputs).forEach((/** @type {any} */ input) => {
      updateValue(input, 0);
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
  );

  // Create title

  const $title = document.createElement("h1");

  $title.textContent = "↓ Mercator Studio ↓";

  $previews.append($minimize, $video, canvases.buffer.element, $title);

  // Add UI to page
  $form.append($presetsLabel);

  $main.append($collapse, $form, $previews);

  $host.append($main);
  document.body.append($host);

  let drawInterval = 0;

  // Background Blur for Google Meet does this (hello@brownfoxlabs.com)

  class HookedMediaStream extends MediaStream {
    /**
     * @param {MediaStream} oldStream
     */
    constructor(oldStream) {
      // Copy original stream settings
      super(oldStream);
      $video.srcObject = oldStream;

      const oldStreamSettings = oldStream.getVideoTracks()[0].getSettings();

      const w = oldStreamSettings.width;
      const h = oldStreamSettings.height;
      Object.values(canvases).forEach((
        /** @type {{ element: HTMLCanvasElement; }} */ canvas
      ) => {
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
        oldStream.getTracks().forEach((
          /** @type {{ stop: () => void; }} */ track
        ) => {
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
   * @param {{ video: unknown; audio: unknown; }} constraints
   */
  async function hookedGetUserMedia(constraints) {
    if (constraints && constraints.video && !constraints.audio) {
      return new HookedMediaStream(
        // @ts-expect-error
        await navigator.mediaDevices.oldGetUserMedia(constraints)
      );
    } else {
      // @ts-expect-error
      return navigator.mediaDevices.oldGetUserMedia(constraints);
    }
  }

  // @ts-expect-error
  MediaDevices.prototype.oldGetUserMedia = MediaDevices.prototype.getUserMedia;
  MediaDevices.prototype.getUserMedia = hookedGetUserMedia;
})();

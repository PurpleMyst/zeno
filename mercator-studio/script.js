// ==UserScript==
// @name	Mercator Studio for Google Meet
// @version	1.17.4
// @description	Change how you look on Google Meet.
// @author	Xing <dev@x-ing.space> (https://x-ing.space)
// @copyright	2021, Xing (https://x-ing.space)
// @license	MIT License; https://x-ing.space/mercator/LICENSE
// @namespace	https://x-ing.space
// @homepageURL	https://x-ing.space/mercator
// @icon	https://x-ing.space/mercator/icon.png
// @match	https://meet.google.com/*
// @grant	none
// ==/UserScript==

(async function mercator_studio() {
  "use strict";

  // Create shadow root

  const host = document.createElement("aside");
  const shadow = host.attachShadow({ mode: "open" });
  const isFirefox = navigator.userAgent.includes("Firefox");

  // Create form

  const main = document.createElement("main");
  main.addEventListener("click", (event) => {
    if (!main.classList.contains("focus") && event.target !== collapse) {
      main.classList.add("focus");
    }
  });

  const collapse = document.createElement("button");
  collapse.textContent = "↑ collapse ↑";
  collapse.id = "collapse";
  collapse.addEventListener("click", () => {
    main.classList.remove("focus");
  });

  const minimize = document.createElement("button");
  minimize.id = "minimize";
  minimize.title = "toggle super tiny mode";
  minimize.addEventListener("click", (e) => {
    e.stopPropagation();
    main.classList.toggle("minimize");
  });

  const form = document.createElement("form");
  const style = document.createElement("style");
  const font_family = `"Google Sans", Roboto, RobotDraft, Helvetica, sans-serif, serif`;
  style.textContent = `
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
	font-family: ${font_family};
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
  form.append(style);

  // Create inputs

  const saved_values = JSON.parse(
    window.localStorage.getItem("mercator-studio-values")
  );

  const inputs = Object.fromEntries(
    "exposure,contrast,temperature,tint,sepia,hue,saturate,blur,fog,vignette,rotate,scale,x,y,pillarbox,letterbox,freeze,text"
      .split(",")
      .map((key) => {
        let input;
        switch (key) {
          case "text":
            input = document.createElement("textarea");
            input.placeholder = "🌈 Write text here 🌦️";
            break;
          case "freeze":
            input = document.createElement("input");
            input.type = "checkbox";
            break;
          default:
            input = document.createElement("input");
            input.type = "range";
            input.min = [
              "blur",
              "sepia",
              "scale",
              "pillarbox",
              "letterbox",
            ].includes(key)
              ? 0
              : -1;
            input.max = 1;
            input.step = 0.00001;
            input.value = 0;
        }
        input.classList.add("input");
        if (saved_values) input.value = saved_values[key];

        if (!["temperature", "tint"].includes(key) || !isFirefox) {
          // Disable the SVG filters for Firefox
          let label = document.createElement("label");
          label.textContent = input.id = key;

          form.append(label);
          label.append(input);
        }
        return [key, input];
      })
  );

  const values = Object.fromEntries(
    Object.entries(inputs).map((entry) => [
      entry[0],
      entry[1].valueAsNumber || entry[1].value,
    ])
  );

  function update_values(input, value) {
    values[input.id] = input.value = value;
    window.localStorage.setItem(
      "mercator-studio-values",
      JSON.stringify(values)
    );
  }

  // Scroll to change values
  form.addEventListener("wheel", (event) => {
    if (event.target.type !== "range") return;
    event.preventDefault();
    const slider = event.target;
    const width = slider.getBoundingClientRect().width;
    const dx = -event.deltaX;
    const dy = event.deltaY;
    const ratio = (Math.abs(dx) > Math.abs(dy) ? dx : dy) / width;
    const range = slider.max - slider.min;
    update_values(slider, slider.valueAsNumber + ratio * range);
  });

  // Right click to individually reset
  form.addEventListener("contextmenu", (event) => {
    if (event.target.type !== "range") return;
    event.preventDefault();
    update_values(event.target, 0);
  });

  form.addEventListener("input", (event) => {
    const input = event.target;
    update_values(
      input,
      input.id === "text"
        ? (input.value + "")
            .replace(/\\sqrt/g, "√")
            .replace(/\\pm/g, "±")
            .replace(/\\times/g, "×")
            .replace(/\\cdot/g, "·")
            .replace(/\\over/g, "∕")
            .replace(
              /(\^|\_)(\d+)/g, // Numbers starting with ^ (superscript) or _ (subscript)
              (_, sign, number) =>
                number
                  .split("")
                  .map((digit) =>
                    String.fromCharCode(
                      digit.charCodeAt(0) +
                        (sign === "_"
                          ? 8272
                            /* Difference in character codes
                             * between subscript numbers and
                             * their regular equivalents.
                             */
                          : digit === "1"
                          ? 136
                            /* Superscript 1, 2 & 3 are in
                             * separate ranges.
                             */
                          : "23".includes(digit)
                          ? 128
                          : 8256)
                    )
                  )
                  .join("")
            )
        : input.valueAsNumber
    );
  });

  const presets_label = document.createElement("label");
  const presets_collection = document.createElement("div");
  presets_collection.id = "presets";
  const presets = "reset,concorde,mono,stucco,matcha,deepfry"
    .split(",")
    .map((key) => {
      let preset = document.createElement("button");
      preset.textContent = preset.id = key;
      return preset;
    });
  presets_label.textContent = "presets";

  presets_collection.append(...presets);
  presets_label.append(presets_collection);

  function get_preset_values(preset_name) {
    switch (preset_name) {
      case "concorde":
        return {
          contrast: 0.1,
          temperature: -0.25,
          tint: -0.05,
          saturate: 0.2,
        };
      case "mono":
        return {
          exposure: 0.1,
          contrast: -0.1,
          sepia: 0.8,
          saturate: -1,
          vignette: -0.5,
        };
      case "stucco":
        return {
          contrast: -0.1,
          tint: 0.1,
          sepia: 0.25,
          saturate: 0.25,
          fog: 0.1,
        };
      case "matcha":
        return {
          exposure: 0.1,
          tint: -0.75,
          sepia: 1,
          hue: 0.2,
          vignette: 0.3,
          fog: 0.3,
        };
      case "deepfry":
        return {
          contrast: 1,
          saturate: 0.5,
        };
    }
  }

  presets_label.addEventListener("click", (event) => {
    // Cancel refresh
    event.preventDefault();

    const preset_values = get_preset_values(event.target.id);
    // Reset all
    Object.values(inputs).forEach((input) => {
      update_values(
        input,
        input.id === "text"
          ? ""
          : preset_values
          ? preset_values[input.id] || 0
          : 0
      );
    });
  });

  // Create color balance matrix

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  const filter = document.createElementNS(svgNS, "filter");
  filter.id = "filter";
  const component_transfer = document.createElementNS(
    svgNS,
    "feComponentTransfer"
  );
  const components = Object.fromEntries(
    ["r", "g", "b"].map((hue) => {
      const func = document.createElementNS(
        svgNS,
        "feFunc" + hue.toUpperCase()
      );
      func.setAttribute("type", "table");
      func.setAttribute("tableValues", "0 1");
      return [hue, func];
    })
  );
  component_transfer.append(...Object.values(components));
  filter.append(component_transfer);
  svg.append(filter);

  const previews = document.createElement("div");
  previews.id = "previews";

  // Create preview video

  const video = document.createElement("video");
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");

  // Create canvases

  const canvases = Object.fromEntries(
    ["buffer", "freeze", "display"].map((name) => {
      const element = document.createElement("canvas");
      const context = element.getContext("2d");
      return [name, { element, context }];
    })
  );

  // Create title

  const h1 = document.createElement("h1");

  h1.textContent = "↓ Mercator Studio ↓";

  previews.append(minimize, video, canvases.buffer.element, h1);

  // Add UI to page
  form.append(presets_label);

  main.append(collapse, form, previews);

  shadow.append(main, svg);
  document.body.append(host);

  function polynomial_map(value, degree) {
    return (value + 1) ** degree;
  }

  function polynomial_table(factor) {
    return Array(32)
      .fill(0)
      .map((value, index) => Math.pow(index / 31, 2 ** factor))
      .join(" ");
  }

  function percentage(value) {
    return value * 100 + "%";
  }

  function signed_pow(value, power) {
    return Math.sign(value) * Math.abs(value) ** power;
  }

  const amp = 8;

  let task = 0;

  // Background Blur for Google Meet does this (hello@brownfoxlabs.com)

  class mercator_studio_MediaStream extends MediaStream {
    constructor(old_stream) {
      // Copy original stream settings

      super(old_stream);

      video.srcObject = old_stream;

      const old_stream_settings = old_stream.getVideoTracks()[0].getSettings();

      const w = old_stream_settings.width;
      const h = old_stream_settings.height;
      const center = [w / 2, h / 2];
      Object.values(canvases).forEach((canvas) => {
        canvas.element.width = w;
        canvas.element.height = h;
      });
      const canvas = canvases.buffer.buffer;
      const context = canvases.buffer.context;
      const freeze = {
        state: false,
        init: false,
        image: document.createElement("img"),
        canvas: canvases.freeze,
      };
      inputs.freeze.addEventListener("change", (e) => {
        freeze.state = freeze.init = e.target.checked;
      });

      // Amp: for values that can range from 0 to +infinity, amp**value does the mapping.

      context.textAlign = "center";
      context.textBaseline = "middle";

      function draw() {
        context.clearRect(0, 0, w, h);

        // Get values

        inputs.hue.value %= 1;
        inputs.rotate.value %= 1;

        let v = values;

        let exposure = percentage(polynomial_map(v.exposure, 2));
        let contrast = percentage(polynomial_map(v.contrast, 3));
        let temperature = isFirefox ? 0 : v.temperature;
        let tint = isFirefox ? 0 : v.tint;
        let sepia = percentage(v.sepia);
        let hue = 360 * v.hue + "deg";
        let saturate = percentage(amp ** v.saturate);
        let blur = (v.blur * w) / 16 + "px";
        let fog = v.fog;
        let vignette = v.vignette;
        let rotate = v.rotate * 2 * Math.PI;
        let scale = polynomial_map(v.scale, 2);
        let move_x = v.x * w;
        let move_y = v.y * h;
        let pillarbox = (v.pillarbox * w) / 2;
        let letterbox = (v.letterbox * h) / 2;
        let text = v.text.split("\n");

        // Color balance

        components.r.setAttribute(
          "tableValues",
          polynomial_table(-temperature + tint / 2)
        );
        components.g.setAttribute("tableValues", polynomial_table(-tint));
        components.b.setAttribute(
          "tableValues",
          polynomial_table(temperature + tint / 2)
        );

        // CSS filters

        context.filter = `
					brightness(${exposure})
					contrast(${contrast})
					${"url(#filter)".repeat(Boolean(temperature || tint))}
					sepia(${sepia})
					hue-rotate(${hue})
					saturate(${saturate})
					blur(${blur})
				`;
        // Linear transformations: rotation, scaling, translation

        context.translate(...center);

        if (rotate) context.rotate(rotate);

        if (scale - 1) context.scale(scale, scale);

        if (move_x || move_y) context.translate(move_x, move_y);

        context.translate(-w / 2, -h / 2);

        // Apply CSS filters & linear transformations

        if (freeze.init) {
          freeze.canvas.context.drawImage(video, 0, 0, w, h);
          let data = freeze.canvas.element.toDataURL("image/png");
          freeze.image.setAttribute("src", data);
          freeze.init = false;
        } else if (freeze.state) {
          // Draw frozen image
          context.drawImage(freeze.image, 0, 0, w, h);
        } else if (video.srcObject) {
          // Draw video
          context.drawImage(video, 0, 0, w, h);
        } else {
          // Draw preview stripes if video doesn't exist
          "18, 100%, 68%; -10,100%,80%; 5, 90%, 72%; 48, 100%, 75%; 36, 100%, 70%; 20, 90%, 70%"
            .split(";")
            .forEach((color, index) => {
              context.fillStyle = `hsl(${color})`;
              context.fillRect((index * w) / 6, 0, w / 6, h);
            });
        }

        // Clear transforms & filters

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.filter = "brightness(1)";

        // Fog: cover the entire image with a single color

        if (fog) {
          let fog_lum = Math.sign(fog) * 100;
          let fog_alpha = Math.abs(fog);

          context.fillStyle = `hsla(0,0%,${fog_lum}%,${fog_alpha})`;
          context.fillRect(0, 0, w, h);
        }

        // Vignette: cover the edges of the image with a single color

        if (vignette) {
          let vignette_lum = Math.sign(vignette) * 100;
          let vignette_alpha = Math.abs(vignette);
          let vignette_gradient = context.createRadialGradient(
            ...center,
            0,
            ...center,
            Math.sqrt((w / 2) ** 2 + (h / 2) ** 2)
          );

          vignette_gradient.addColorStop(0, `hsla(0,0%,${vignette_lum}%,0`);
          vignette_gradient.addColorStop(
            1,
            `hsla(0,0%,${vignette_lum}%,${vignette_alpha}`
          );

          context.fillStyle = vignette_gradient;
          context.fillRect(0, 0, w, h);
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

        // Text:

        if (text) {
          // Find out the font size that just fits

          const vw = 0.9 * (w - 2 * pillarbox);
          const vh = 0.9 * (h - 2 * letterbox);

          context.font = `bold ${vw}px ${font_family}`;

          let char_metrics = context.measureText("0");
          let char_width = char_metrics.width;
          let line_height =
            char_metrics.actualBoundingBoxAscent +
            char_metrics.actualBoundingBoxDescent;
          let text_width = text.reduce(
            (max_width, current_line) =>
              Math.max(max_width, context.measureText(current_line).width),
            0 // Accumulator starts at 0
          );

          const font_size = Math.min(
            vw ** 2 / text_width,
            vh ** 2 / line_height / text.length
          );

          // Found the font size. Time to draw!

          context.font = `bold ${font_size}px ${font_family}`;

          char_metrics = context.measureText("0");
          line_height =
            1.5 *
            (char_metrics.actualBoundingBoxAscent +
              char_metrics.actualBoundingBoxDescent);

          context.lineWidth = font_size / 8;
          context.strokeStyle = "black";
          context.fillStyle = "white";

          text.forEach((line, index) => {
            let x = center[0];
            let y = center[1] + line_height * (index - text.length / 2 + 0.5);
            context.strokeText(line, x, y);
            context.fillText(line, x, y);
          });
        }

        canvases.display.context.clearRect(0, 0, w, h);
        canvases.display.context.drawImage(canvases.buffer.element, 0, 0);
      }
      clearInterval(task);
      task = setInterval(draw, 33);
      const new_stream = canvases.display.element.captureStream(30);
      new_stream.addEventListener("inactive", () => {
        old_stream.getTracks().forEach((track) => {
          track.stop();
        });
        canvases.display.context.clearRect(0, 0, w, h);
        video.srcObject = null;
      });
      return new_stream;
    }
  }

  async function mercator_studio_getUserMedia(constraints) {
    if (constraints && constraints.video && !constraints.audio) {
      return new mercator_studio_MediaStream(
        await navigator.mediaDevices.old_getUserMedia(constraints)
      );
    } else {
      return navigator.mediaDevices.old_getUserMedia(constraints);
    }
  }

  MediaDevices.prototype.old_getUserMedia = MediaDevices.prototype.getUserMedia;
  MediaDevices.prototype.getUserMedia = mercator_studio_getUserMedia;
})();

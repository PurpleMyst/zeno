import styleCss from "./style.css";

import {
  HookedMediaStream,
  Canvases,
  Inputs,
  Values,
} from "./hookedMediaStream";

(async function zeno() {
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
    window.localStorage.getItem("zeno-values") ?? ""
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
  ) as Inputs;

  const values = Object.fromEntries(
    Object.entries(inputs).map((entry) => [
      entry[0],
      entry[1].valueAsNumber || +entry[1].value,
    ])
  ) as Values;
  function updateValue($input: HTMLInputElement, value: number) {
    (values as any)[$input.id] = $input.valueAsNumber = value;

    window.localStorage.setItem("zeno-values", JSON.stringify(values));
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
  ) as Canvases;
  // Create title

  const $title = document.createElement("h1");

  $title.textContent = "↓ Zeno Studio ↓";

  $previews.append($minimize, $video, canvases.buffer.element, $title);

  // Add UI to page
  $form.append($presetsLabel);

  $main.append($collapse, $form, $previews);

  $host.append($main);
  document.body.append($host);

  /**
   * Intercept the user's camera to hook our patched MediaStream onto it
   */
  async function hookedGetUserMedia(constraints: {
    video: unknown;
    audio: unknown;
  }) {
    if (constraints && constraints.video && !constraints.audio) {
      return new HookedMediaStream(
        await (navigator.mediaDevices as any).oldGetUserMedia(constraints),
        canvases,
        inputs,
        values,
        $video
      );
    } else {
      return (navigator.mediaDevices as any).oldGetUserMedia(constraints);
    }
  }

  (MediaDevices.prototype as any).oldGetUserMedia =
    MediaDevices.prototype.getUserMedia;
  (MediaDevices.prototype.getUserMedia as any) = hookedGetUserMedia;
})();

import styleCss from "./style.css";

import { HookedMediaStream, Inputs, Values } from "./hookedMediaStream";
import { DISPLAY_PREVIEW_CONTAINER, VIDEO_PREVIEW_CONTAINER } from "./utils";

(async function zeno() {
  "use strict";

  // Create aside and its shadow DOM to allow isolating its CSS
  const $host = document.createElement("aside");
  const $shadow = $host.attachShadow({ mode: "open" });

  // Create main element and make it focus on click
  const $main = document.createElement("main");
  $main.addEventListener("click", () => {
    $main.classList.add("focus");
  });

  // Create collapse button
  const $collapse = document.createElement("button");
  $collapse.textContent = "↑ collapse ↑";
  $collapse.id = "collapse";
  $collapse.addEventListener("click", (event) => {
    // Stop propagation to avoid running the above $main "click" event listener
    event.stopPropagation();
    $main.classList.remove("focus");
  });

  // Create "super tiny mode" button
  const $minimize = document.createElement("button");
  $minimize.id = "minimize";
  $minimize.title = "toggle super tiny mode";
  $minimize.addEventListener("click", (event) => {
    event.stopPropagation();
    $main.classList.toggle("minimize");
  });

  // Create form and apply our style.css
  const $form = document.createElement("form");
  const $style = document.createElement("style");
  $style.textContent = styleCss;

  // Create inputs
  const savedValues = JSON.parse(
    window.localStorage.getItem("zeno-values") ?? "{}"
  );

  function createInput(key: string) {
    const $input = document.createElement("input");
    $input.id = key;
    if (key === "freeze") {
      $input.type = "checkbox";
    } else {
      $input.type = "range";
      $input.min = ["pillarbox", "letterbox"].includes(key) ? "0" : "-1";
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

  // Reset the input on right click
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

  // Create reset button
  const $resetLabel = document.createElement("label");

  const $reset = document.createElement("button");
  $reset.textContent = "do it";
  $reset.id = "reset";
  $resetLabel.textContent = "reset";

  $resetLabel.append($reset);

  $resetLabel.addEventListener("click", (event) => {
    event.preventDefault();

    // Reset all inputs
    Object.values(inputs).forEach(($input) => updateValue($input, 0));
  });

  $form.append($resetLabel);

  // Create previews
  const $previews = document.createElement("div");
  $previews.id = "previews";

  // Create the preview container
  const $previewContainer = document.createElement("div");
  $previewContainer.id = "preview-container";

  // Create the raw video preview
  const $videoPreviewContainer = document.createElement("div");
  $videoPreviewContainer.id = VIDEO_PREVIEW_CONTAINER;
  $videoPreviewContainer.classList.add("preview");

  // Create the filtered video preview
  const $displayPreviewContainer = document.createElement("div");
  $displayPreviewContainer.id = DISPLAY_PREVIEW_CONTAINER;
  $displayPreviewContainer.classList.add("preview");

  // Add them to the preview container
  $previewContainer.append($videoPreviewContainer, $displayPreviewContainer);

  // Create title
  const $title = document.createElement("h1");
  $title.id = "title";
  $title.textContent = "↓ Zeno Studio ↓";

  // Append everything to the $previews
  $previews.append($previewContainer);

  const $fold = document.createElement("div");
  $fold.id = "fold";
  $fold.append($minimize, $title);

  // Add the UI to the page
  $main.append($collapse, $form, $previews, $fold);
  $shadow.append($main, $style);
  document.body.append($host);

  /** Intercept the user's camera to hook our patched MediaStream onto it */
  async function hookedGetUserMedia(constraints: {
    video: unknown;
    audio: unknown;
  }) {
    if (constraints && constraints.video && !constraints.audio) {
      return new HookedMediaStream(
        await (navigator.mediaDevices as any).oldGetUserMedia(constraints),
        inputs,
        values,
        $shadow
      );
    } else {
      return (navigator.mediaDevices as any).oldGetUserMedia(constraints);
    }
  }

  (MediaDevices.prototype as any).oldGetUserMedia =
    MediaDevices.prototype.getUserMedia;
  (MediaDevices.prototype.getUserMedia as any) = hookedGetUserMedia;
})();

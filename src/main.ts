import styleCss from "./style.css";

import { HookedMediaStream } from "./hookedMediaStream";

(async function zeno() {
  "use strict";

  // Create aside and its shadow DOM to allow isolating its CSS
  const $host = document.createElement("aside");
  const $shadow = $host.attachShadow({ mode: "open" });

  // Create main element and make it focus on click
  const $main = document.createElement("main");
  $main.addEventListener("click", () => {
    if ($main.classList.contains("minimize")) {
      $main.classList.remove("minimize");
    } else {
      $main.classList.add("focus");
    }
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
  $form.id = "inputs";
  const $style = document.createElement("style");
  $style.textContent = styleCss;

  function createInput(key: string, label?: string) {
    const $label = document.createElement("label");
    $label.textContent = label ?? key;
    $form.append($label);

    const $input = document.createElement("input");
    $input.id = key;
    if (key === "playback") {
      $input.type = "checkbox";
    } else if (key === "playbackDuration") {
      $input.type = "number";
      $input.min = "1";
      $input.max = "10";
      $input.step = "1";
      $input.value = "2";
    } else {
      $input.type = "range";
      $input.min = ["pillarbox", "letterbox"].includes(key) ? "0" : "-1";
      $input.max = "1";
      $input.step = "0.00001";
      $input.value = "0";
    }

    const savedValue = JSON.parse(
      window.localStorage.getItem(`zeno-value-${$input.id}`) ?? "null"
    );
    if (savedValue !== null) $input.value = savedValue;

    $form.append($input);

    return $input;
  }

  const inputs = {
    pillarbox: createInput("pillarbox"),
    letterbox: createInput("letterbox"),
    playback: createInput("playback"),
    playbackDuration: createInput("playbackDuration", "playback duration"),
  };

  function updateStoredValue($input: HTMLInputElement, value: any) {
    window.localStorage.setItem(
      `zeno-value-${$input.id}`,
      JSON.stringify(value)
    );
  }

  // Reset the input on right click
  $form.addEventListener("contextmenu", (event) => {
    if (
      !(event.target instanceof HTMLInputElement) ||
      event.target.type === "checkbox"
    )
      return;
    event.preventDefault();
    event.target.value = event.target.min;
    updateStoredValue(event.target, event.target.valueAsNumber);
  });

  // Update value on change
  $form.addEventListener("input", (event) => {
    const $input = event.target;
    if ($input instanceof HTMLInputElement)
      updateStoredValue($input, $input.valueAsNumber);
  });

  // Create reset button
  const $resetLabel = document.createElement("label");
  $resetLabel.textContent = "reset";

  const $resetButton = document.createElement("button");
  $resetButton.type = "button";
  $resetButton.textContent = "do it";
  $resetButton.id = "reset";
  $resetButton.addEventListener("click", () => {
    Object.values(inputs).forEach(($input) => {
      if ($input.type === "checkbox") return;
      $input.value = $input.min;
      updateStoredValue($input, $input.valueAsNumber);
    });
  });

  $form.append($resetLabel, $resetButton);

  // Create previews
  const $previews = document.createElement("div");
  $previews.id = "previews";

  // Create title
  const $title = document.createElement("h1");
  $title.id = "title";
  $title.textContent = "↓ Zeno Studio ↓";

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
        $previews
      );
    } else {
      return (navigator.mediaDevices as any).oldGetUserMedia(constraints);
    }
  }

  (MediaDevices.prototype as any).oldGetUserMedia =
    MediaDevices.prototype.getUserMedia;
  (MediaDevices.prototype.getUserMedia as any) = hookedGetUserMedia;
})();

// ==UserScript==
// @name      Zeno
// @namespace PurpleMyst
// @match     https://meet.google.com/*
// @grant     none
// ==/UserScript==
(()=>{"use strict";var e={630:e=>{e.exports='* {\n  /* Use the saner border-box box-sizing */\n  box-sizing: border-box;\n}\n\n*:not(input) {\n  /* Do not allow selection of anything that isn\'t an input */\n  user-select: none;\n}\n\n:focus {\n  outline: 0;\n}\n\nbutton {\n  font-family: inherit;\n  font-size: 0.8rem;\n}\n\nmain {\n  /* Position <main> above everything in the top left */\n  z-index: 99999;\n  position: fixed;\n  left: 0;\n  top: 0;\n  width: 480px;\n  max-width: 100vw;\n  height: auto;\n\n  /* When unfocused, show just a portion of <main> */\n  transform: translateY(calc(-100% + 3rem));\n\n  /* <main> is a vertical flexbox container, justified towards the end */\n  display: flex;\n  flex-direction: column;\n  justify-content: end;\n\n  /* When unfocused, hide the overflow */\n  overflow: hidden;\n\n  /* Indicate that <main> is clickable */\n  cursor: pointer;\n\n  /* General styling */\n  background: white;\n  box-shadow: 0 0.1rem 0.25rem #0004;\n  border-radius: 0 0 0.75rem 0;\n  padding: 1rem 1rem 0 1rem;\n  font-family: "Google Sans", Roboto, RobotDraft, Helvetica, sans-serif, serif;\n  font-size: 1rem;\n}\n\n/* Style for "collapse" text */\nmain #collapse {\n  background: white;\n  cursor: pointer;\n  margin-bottom: 0.5rem;\n}\n\n/* Focused <main> */\nmain.focus {\n  /* This reverts the "default" <main> transform which hides it above the page */\n  transform: none;\n\n  padding-bottom: 1rem;\n  cursor: default;\n}\n\n/* Minimized <main> */\nmain.minimize {\n  /* Make it smol */\n  width: 1rem;\n  padding-right: 0;\n\n  /* round the top-right */\n  border-top-right-radius: 0.75rem;\n}\n\nmain.minimize :not(#fold),\nmain.minimize #fold :not(#minimize) {\n  /* Anything that\'s not the "unminimize" triangle should be hidden when minimized */\n  display: none;\n}\n\nmain.minimize #minimize {\n  display: block;\n  margin-bottom: 1rem;\n}\n\n/* Hide the fold when focused */\nmain.focus #fold {\n  display: none;\n}\n\n/* Minimize button */\n#minimize {\n  /* General styling */\n  font-family: inherit;\n  font-size: 0.5rem;\n  font-weight: bold;\n  color: #444;\n  text-align: center;\n  border: 0;\n  background: white;\n  overflow-wrap: anywhere;\n\n  /* Indicate the triangle\'s clickability */\n  cursor: pointer;\n\n  /* Size the triangle as 1rem */\n  flex: 0 0 1rem;\n  width: 1rem;\n\n  /* Disable margin-bottom transition */\n  transition: margin-bottom 0s;\n\n  /* When not minimized and not hovered, move to the left */\n  margin-left: -1rem;\n}\n\n#minimize::before {\n  content: "◀";\n  transition: inherit;\n}\n\n#minimize:hover::before,\nmain.minimize #minimize::before {\n  /* When hovered but not minimized, move to the right */\n  /* When not hovered but minimized, move to the left */\n  margin-left: -2px;\n}\n\nmain.minimize #minimize::before {\n  /* Flip the triangle\'s direction when minimized to indicate unminimization */\n  content: "▶";\n}\n\nmain.minimize:hover #minimize::before {\n  /* When hovered and minimized, move to the right */\n  margin-left: 0;\n}\n\n#previews {\n  display: grid;\n  grid-template-columns: auto auto auto;\n  grid-auto-rows: max-content;\n  align-items: center;\n}\n\n#previews video,\n#previews canvas {\n  /* as beeg as possible */\n  width: 100%;\n  height: 100%;\n\n  /* show pretty background */\n  background-image: linear-gradient(\n    90deg,\n    hsl(18, 100%, 68%) 16.7%,\n    hsl(-10, 100%, 80%) 16.7%,\n    hsl(-10, 100%, 80%) 33.3%,\n    hsl(5, 90%, 72%) 33.3%,\n    hsl(5, 90%, 72%) 50%,\n    hsl(48, 100%, 75%) 50%,\n    hsl(48, 100%, 75%) 66.7%,\n    hsl(36, 100%, 70%) 66.7%,\n    hsl(36, 100%, 70%) 83.3%,\n    hsl(20, 90%, 70%) 83.3%\n  );\n}\n\n#title {\n  font-size: 1rem;\n  font-weight: normal;\n  text-align: center;\n  color: #444;\n  line-height: 1.5rem;\n}\n\n:hover #title {\n  /* Tiny nudge downwards */\n  transform: translateY(0.1rem);\n}\n\n/* Turn the "fold" into a CSS grid. */\n#fold {\n  display: grid;\n}\n\n/* set every element to have grid androw 1. this works. do i know why? no! */\n#fold * {\n  grid-row: 1;\n  grid-column: 1;\n}\n\n/* Show/hide the previews if focused/unfocused */\n#preview-container {\n  display: none;\n}\n\n.focus #preview-container {\n  display: flex;\n}\n\n.focus #previews {\n  height: auto;\n}\n\n/* Style our inputs */\n\n#inputs {\n  display: grid;\n  grid-template-columns: auto auto;\n  grid-auto-rows: max-content;\n  margin: 1rem 0 1rem 0;\n}\n\n#inputs button,\ninput,\n#collapse {\n  height: 1.5rem;\n  border-radius: 0.4rem;\n  border: 0.25rem solid lightgray;\n}\n\n#inputs button:hover,\ninput:hover,\n#collapse:hover {\n  border: 0.25rem solid gray;\n}\n\n#presets > :hover {\n  background: #0003;\n}\n\n#presets > :focus {\n  background: black;\n  color: white;\n}\n\n#presets:focus-within,\n#collapse:focus {\n  border-color: black;\n}\n\n/* Style our inputs */\n\ninput[type="range"] {\n  -webkit-appearance: none;\n  --gradient: transparent, transparent;\n  --rainbow: hsl(0, 80%, 75%), hsl(30, 80%, 75%), hsl(60, 80%, 75%),\n    hsl(90, 80%, 75%), hsl(120, 80%, 75%), hsl(150, 80%, 75%),\n    hsl(180, 80%, 75%), hsl(210, 80%, 75%), hsl(240, 80%, 75%),\n    hsl(270, 80%, 75%), hsl(300, 80%, 75%), hsl(330, 80%, 75%);\n  background: linear-gradient(90deg, var(--gradient)),\n    linear-gradient(90deg, var(--rainbow));\n}\n\ninput[type="range"]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  background: white;\n  width: 1rem;\n  height: 1rem;\n  border: 0.25rem solid black;\n  border-radius: 0.5rem;\n}\n\ninput[type="range"]:focus::-webkit-slider-thumb {\n  border-color: white;\n  background: black;\n}\n\ninput#pillarbox,\ninput#letterbox {\n  --gradient: black, white;\n}\n'}},n={};function t(i){var o=n[i];if(void 0!==o)return o.exports;var r=n[i]={exports:{}};return e[i](r,r.exports,t),r.exports}(()=>{var e=t(630);function n(){const e=document.createElement("canvas"),n=e.getContext("2d");return{element:e,context:n}}class i{constructor(e,t){this.buffer=n(),this.display=n(),this.buffer.element.width=this.display.element.width=e,this.buffer.element.height=this.display.element.height=t}blit(){this.display.context.clearRect(0,0,this.display.element.width,this.display.element.height),this.display.context.drawImage(this.buffer.element,0,0)}}class o{constructor(e,t,i){this.width=e,this.height=t,this.frameCount=i,this.frames=[],this.canvas=n(),this.idx=0,this.ltr=!0,this.canvas.element.width=e,this.canvas.element.height=t}hasFullBuffer(){return this.frames.length>=this.frameCount}record(e){this.hasFullBuffer()||function(e){return new Promise(((n,t)=>{e.toBlob((e=>{if(null===e)return void n(null);const i=URL.createObjectURL(e),o=new Image;o.onload=function(){URL.revokeObjectURL(i),n(o)},o.onerror=function(e){t(e)},o.src=i}))}))}(e).then((e=>{null!==e&&this.frames.push(e)}))}draw(e){this.idx===this.frames.length?(this.idx-=1,this.ltr=!1):-1===this.idx&&(this.idx+=1,this.ltr=!0);const n=this.frames[this.idx];void 0!==n&&(e.drawImage(n,0,0),this.ltr?this.idx+=1:this.idx-=1)}clearFrames(){this.frames=[],this.idx=0,this.ltr=!0}}class r extends MediaStream{constructor(e,n,t){super(e);const r=document.createElement("video");r.setAttribute("playsinline",""),r.setAttribute("autoplay",""),r.setAttribute("muted",""),r.srcObject=e;const a=document.createElement("input");a.type="checkbox",a.checked=0===t.childElementCount;const s=e.getVideoTracks()[0].getSettings(),l=s.width,d=s.height,c=new i(l,d);t?.append(a,r,c.buffer.element);const m=new o(l,d,60);n.freeze.addEventListener("change",(function(){m.clearFrames()})),a.addEventListener("change",(function(){m.clearFrames()})),setTimeout((async function i(){const{context:o,element:s}=c.buffer;o.textAlign="center",o.textBaseline="middle",o.clearRect(0,0,l,d);const u=n.pillarbox.valueAsNumber*l/2,p=n.letterbox.valueAsNumber*d/2;if(a.checked&&n.freeze.checked&&m.hasFullBuffer()?m.draw(o):r.srcObject?(o.drawImage(r,0,0),m.record(s)):"18, 100%, 68%; -10,100%,80%; 5, 90%, 72%; 48, 100%, 75%; 36, 100%, 70%; 20, 90%, 70%".split(";").forEach(((e,n)=>{o.fillStyle=`hsl(${e})`,o.fillRect(n*l/6,0,l/6,d)})),a.checked&&u&&(o.clearRect(0,0,u,d),o.clearRect(l,0,-u,d)),a.checked&&p&&(o.clearRect(0,0,l,p),o.clearRect(0,d,l,-p)),c.blit(),!h.active)return e.getTracks().forEach((e=>e.stop())),c.display.context.clearRect(0,0,l,d),t.removeChild(a),t.removeChild(c.buffer.element),t.removeChild(r),void(r.srcObject=null);setTimeout(i,33)}),33);const h=c.display.element.captureStream(30);return h}}!async function(){const n=document.createElement("aside"),t=n.attachShadow({mode:"open"}),i=document.createElement("main");i.addEventListener("click",(()=>{i.classList.contains("minimize")?i.classList.remove("minimize"):i.classList.add("focus")}));const o=document.createElement("button");o.textContent="↑ collapse ↑",o.id="collapse",o.addEventListener("click",(e=>{e.stopPropagation(),i.classList.remove("focus")}));const a=document.createElement("button");a.id="minimize",a.title="toggle super tiny mode",a.addEventListener("click",(e=>{e.stopPropagation(),i.classList.toggle("minimize")}));const s=document.createElement("form");s.id="inputs";const l=document.createElement("style");function d(e){const n=document.createElement("label");n.textContent=e,s.append(n);const t=document.createElement("input");t.id=e,"freeze"===e?t.type="checkbox":(t.type="range",t.min=["pillarbox","letterbox"].includes(e)?"0":"-1",t.max="1",t.step="0.00001",t.value="0");const i=JSON.parse(window.localStorage.getItem(`zeno-value-${t.id}`)??"null");return null!==i&&(t.value=i),s.append(t),t}l.textContent=e;const c={pillarbox:d("pillarbox"),letterbox:d("letterbox"),freeze:d("freeze")};function m(e,n){window.localStorage.setItem(`zeno-value-${e.id}`,JSON.stringify(n))}s.addEventListener("contextmenu",(e=>{e.target instanceof HTMLInputElement&&"checkbox"!==e.target.type&&(e.preventDefault(),e.target.valueAsNumber=0,m(e.target,0))})),s.addEventListener("input",(e=>{const n=e.target;n instanceof HTMLInputElement&&m(n,n.valueAsNumber)}));const h=document.createElement("label");h.textContent="reset";const u=document.createElement("button");u.type="button",u.textContent="do it",u.id="reset",u.addEventListener("click",(()=>{Object.values(c).forEach((e=>{"checkbox"!==e.type&&(e.valueAsNumber=0,m(e,0))}))})),s.append(h,u);const p=document.createElement("div");p.id="previews";const f=document.createElement("h1");f.id="title",f.textContent="↓ Zeno Studio ↓";const g=document.createElement("div");g.id="fold",g.append(a,f),i.append(o,s,p,g),t.append(i,l),document.body.append(n),MediaDevices.prototype.oldGetUserMedia=MediaDevices.prototype.getUserMedia,MediaDevices.prototype.getUserMedia=async function(e){return e&&e.video&&!e.audio?new r(await navigator.mediaDevices.oldGetUserMedia(e),c,p):navigator.mediaDevices.oldGetUserMedia(e)}}()})()})();
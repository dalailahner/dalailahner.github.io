let bgCanvasCtx;
let options;
let points;

function parseOKLCH(color) {
  const regexMatch = color.match(/.+\((.+)\)/);
  const stringInsideKlammern = regexMatch[1] ? regexMatch[1] : null;
  const rawColorValues = stringInsideKlammern?.split(" ");

  const correctedColorValues = [];
  // lightness
  if (rawColorValues[0]) {
    if (rawColorValues[0].includes("%")) {
      correctedColorValues.push(Number.parseFloat(rawColorValues[0], 10));
    } else if (rawColorValues[0].startsWith(".")) {
      correctedColorValues.push(Number.parseFloat(`0${rawColorValues[0]}`, 10) * 100);
    } else {
      correctedColorValues.push(Number.parseFloat(rawColorValues[0]) * 100);
    }
  }
  // chroma
  if (rawColorValues[1]) {
    if (rawColorValues[1].includes("%")) {
      correctedColorValues.push(Number.parseFloat(rawColorValues[1], 10) / 100);
    } else if (rawColorValues[1].startsWith(".")) {
      correctedColorValues.push(Number.parseFloat(`0${rawColorValues[1]}`, 10));
    } else {
      correctedColorValues.push(Number.parseFloat(rawColorValues[1]));
    }
  }
  // hue
  if (rawColorValues[2]) {
    if (rawColorValues[2].startsWith(".")) {
      correctedColorValues.push(Number.parseFloat(`0${rawColorValues[2]}`, 10));
    } else {
      correctedColorValues.push(Number.parseFloat(rawColorValues[2]));
    }
  }
  // transparency
  /*
  if (rawColorValues[3].includes("/")) {
    correctedColorValues.push(rawColorValues[3]);
  }
  if (rawColorValues[4]) {
    if (rawColorValues[4].includes("%")) {
      correctedColorValues.push(Number.parseFloat(rawColorValues[4], 10));
    } else if (rawColorValues[4].startsWith(".")) {
      correctedColorValues.push(Number.parseFloat(`0${rawColorValues[4]}`, 10) * 100);
    } else {
      correctedColorValues.push(Number.parseFloat(rawColorValues[4]) * 100);
    }
  }
  */
  return correctedColorValues;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function bgCanvasOptionsTransition() {
  if (Date.now() < options.transitionStartTime + options.transitionDuration) {
    const currentFillColor = parseOKLCH(options.fillColor);
    const targetFillColor = parseOKLCH(options.targetFillColor);
    const currentBackgroundColor = parseOKLCH(options.backgroundColor);
    const targetBackgroundColor = parseOKLCH(options.targetBackgroundColor);
    const t = ((Date.now() - options.transitionStartTime) % options.transitionDuration) / options.transitionDuration;

    options.fillColor = `color-mix(in oklch, oklch(${currentFillColor[0]}% ${currentFillColor[1]} ${currentFillColor[2]}deg / 33%), oklch(${targetFillColor[0]}% ${targetFillColor[1]} ${targetFillColor[2]}deg / 33%) ${lerp(0, 100, t)}%)`;
    options.backgroundColor = `color-mix(in oklch, oklch(${currentBackgroundColor[0]}% ${currentBackgroundColor[1]} ${currentBackgroundColor[2]}deg), oklch(${targetBackgroundColor[0]}% ${targetBackgroundColor[1]} ${targetBackgroundColor[2]}deg) ${lerp(0, 100, t)}%)`;

    requestAnimationFrame(bgCanvasOptionsTransition);
  } else {
    options.fillColor = options.targetFillColor.replace(")", " / 33%)");
    options.backgroundColor = options.targetBackgroundColor;
  }
}

const bgCanvas = {
  updateOptions() {
    if (typeof options !== "object") {
      return;
    }
    const transitionStartTime = Date.now();
    let transitionDuration = window.getComputedStyle(document.documentElement).transitionDuration;
    if (transitionDuration.startsWith(".")) {
      transitionDuration = `0${transitionDuration}`;
    }
    if (transitionDuration.includes("ms")) {
      transitionDuration = Number.parseFloat(transitionDuration, 10);
    } else {
      transitionDuration = Number.parseFloat(transitionDuration, 10);
      transitionDuration = transitionDuration * 1e3;
    }

    let TXTcolor;
    let BGcolor;
    if (document.documentElement.style.getPropertyValue("--TXTcolor") && document.documentElement.style.getPropertyValue("--BGcolor")) {
      TXTcolor = document.documentElement.style.getPropertyValue("--TXTcolor");
      BGcolor = document.documentElement.style.getPropertyValue("--BGcolor");
    } else {
      const bodyStyle = window.getComputedStyle(document.querySelector("body"));
      TXTcolor = bodyStyle.color;
      BGcolor = bodyStyle.backgroundColor;
    }

    options.transitionStartTime = transitionStartTime;
    options.transitionDuration = transitionDuration;
    options.targetFillColor = TXTcolor;
    options.targetBackgroundColor = BGcolor;

    if (options?.fillColor && options?.backgroundColor) {
      requestAnimationFrame(bgCanvasOptionsTransition);
    } else {
      options.fillColor = options.targetFillColor.replace(")", " / 33%)");
      options.backgroundColor = options.targetBackgroundColor;
    }
  },

  updateHeight() {
    if (!options?.bgCanvasEl) {
      console.warn("options.canvasId is not defined");
      return;
    }

    const canvasComputedStyle = getComputedStyle(options.bgCanvasEl);
    const newWidth = (Number.parseFloat(canvasComputedStyle.width, 10) + 1) * options.devicePxRatio;
    const newHeight = (Number.parseFloat(canvasComputedStyle.height, 10) + 1) * options.devicePxRatio;

    if (options?.canvasWidth && options?.canvasHeight) {
      if (options.canvasWidth === newWidth && options.canvasHeight === newHeight) {
        return false;
      }
    }
    options.canvasWidth = newWidth;
    options.canvasHeight = newHeight;
    options.amount = Math.sqrt(newWidth * newHeight) / 2;
    // TODO: figure out if there is a way to not have the canvas element move on mobile when the viewport changes from lvh to svh. you have to offset the top thing that is coming in.
    return true;
  },

  init(canvasId) {
    options = {
      bgCanvasEl: document.querySelector(canvasId),
      prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")?.matches,
      devicePxRatio: Math.ceil(window.devicePixelRatio),
    };
    bgCanvas.updateHeight();
    bgCanvas.updateOptions();

    points = [];
    for (let i = 0; i < options.amount - 1; i++) {
      const point = {
        x: Math.random() * options.canvasWidth,
        y: Math.random() * options.canvasHeight,
        z: Math.floor(Math.random() * 3 + 1),
        pointConstRand: (Math.random() + 0.5) / 2,
        get size() {
          return this.z / 2 + 0.5;
        },
        get velocity() {
          return this.z * this.pointConstRand * 0.1;
        },
      };
      points.push(point);
    }

    options.bgCanvasEl.width = options.canvasWidth;
    options.bgCanvasEl.height = options.canvasHeight;
    bgCanvasCtx = options.bgCanvasEl.getContext("2d", { alpha: false });
    bgCanvasCtx.setTransform(options.devicePxRatio, 0, 0, options.devicePxRatio, 0, 0);
  },

  animate() {
    bgCanvasCtx.fillStyle = options.backgroundColor;
    bgCanvasCtx.fillRect(0, 0, options.bgCanvasEl.width, options.bgCanvasEl.height);

    bgCanvasCtx.fillStyle = options.fillColor;
    bgCanvasCtx.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].y < points[i].size * -1) {
        points[i].y = options.canvasHeight + points[i].size;
      } else {
        points[i].y -= points[i].velocity;
      }
      bgCanvasCtx.moveTo(points[i].x, points[i].y);
      bgCanvasCtx.arc(points[i].x, points[i].y, points[i].size, 0, Math.PI * 2, false);
    }
    bgCanvasCtx.fill();

    if (!options.prefersReducedMotion) {
      requestAnimationFrame(bgCanvas.animate);
    }
  },
};

export default bgCanvas;

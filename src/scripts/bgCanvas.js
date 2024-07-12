"use strict";

let bgCanvasCtx, bgCanvasEl, options, points;

const bgCanvas = {
  init(canvasId) {
    options = {
      get amount() {
        return Math.sqrt(this.canvasWidth * this.canvasHeight) / 2;
      },
      fillColor: "oklch(45% 0 0)",
      backgroundColor: window.getComputedStyle(document.querySelector("body")).backgroundColor,
      devicePxRatio: Math.ceil(window.devicePixelRatio),
      get canvasWidth() {
        return window.innerWidth * this.devicePxRatio;
      },
      get canvasHeight() {
        return window.innerHeight * this.devicePxRatio;
      },
    };

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
          return this.z * this.pointConstRand * options.devicePxRatio * 0.1;
        },
      };
      points.push(point);
    }

    bgCanvasEl = document.querySelector(canvasId);
    bgCanvasEl.width = options.canvasWidth;
    bgCanvasEl.height = options.canvasHeight;
    bgCanvasEl.style.width = `${window.innerWidth}px`;
    bgCanvasEl.style.height = `${window.innerHeight}px`;
    bgCanvasCtx = bgCanvasEl.getContext("2d", { alpha: false });
    bgCanvasCtx.setTransform(options.devicePxRatio, 0, 0, options.devicePxRatio, 0, 0);
  },

  animate() {
    bgCanvasCtx.fillStyle = options.backgroundColor;
    bgCanvasCtx.fillRect(0, 0, bgCanvasEl.width, bgCanvasEl.height);

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

    requestAnimationFrame(bgCanvas.animate);
  },
};

export default bgCanvas;

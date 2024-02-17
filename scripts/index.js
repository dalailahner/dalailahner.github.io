"use strict";

import bgCanvas from "./bgCanvas.js";

///////////////////////
// GLOBAL VARIABLES: //
let windowResizeTimeout;
const bilderRow = { el: document.querySelector("#BilderRow"), scrollPos: 0, wasMoved: false };

///////////
// INIT: //
bgCanvas.init("#bgCanvas");

/////////////
// EVENTS: //
window.addEventListener("DOMContentLoaded", (event) => {
  bgCanvas.animate();
});
window.addEventListener("load", (event) => {
  positionShelf();
});
window.addEventListener("resize", (event) => {
  clearTimeout(windowResizeTimeout);
  windowResizeTimeout = setTimeout(() => {
    positionShelf();
    bgCanvas.init("#bgCanvas");
  }, 100);
});

/////////////////
// PHOTOGRAPHY //
bilderRow.el.addEventListener("pointerdown", (event) => {
  bilderRow.wasMoved = false;
});
bilderRow.el.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (event.pressure > 0.1) {
    bilderRow.wasMoved = true;
    bilderRow.scrollPos -= event.movementX;
    window.requestAnimationFrame(() => {
      setBilderScrollPos();
    });
  }
});
bilderRow.el.addEventListener("pointerup", (event) => {
  if (!bilderRow.wasMoved) {
    // TODO: OPEN IMAGE IN MODAL
  } else {
    bilderRow.wasMoved = false;
    setBilderScrollPos();
  }
});
bilderRow.el.addEventListener("pointerleave", (event) => {
  bilderRow.wasMoved = false;
  setBilderScrollPos();
});

function setBilderScrollPos() {
  bilderRow.el.style.transform = `translateX(-${bilderRow.scrollPos}px)`;
}

function positionShelf() {
  document.querySelector("#BilderScroll").style.backgroundPositionY = `calc(50% + ${bilderRow.el.clientHeight * 0.535}px)`;
}

///////////////////////
// ANIMATION SECTION //
document.querySelectorAll(".animVids").forEach(function (currentValue) {
  // set thumbnail time
  currentValue.currentTime = currentValue.dataset.thumbtime;

  currentValue.addEventListener("mouseover", function () {
    this.currentTime = 0;
    this.play();
  });

  currentValue.addEventListener("mouseleave", function () {
    this.currentTime = this.dataset.thumbtime;
    this.pause();
  });
});

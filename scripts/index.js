"use strict";

import bgCanvas from "./bgCanvas.js";

///////////////////////
// GLOBAL VARIABLES: //
let windowResizeTimeout;
const bilderScroll = { el: document.querySelector("#BilderRow"), scrollPos: 0, wasMoved: false };

///////////
// INIT: //
bgCanvas.init("#bgCanvas");

/////////////
// EVENTS: //
window.addEventListener("DOMContentLoaded", (event) => {
  bgCanvas.animate();
});
window.addEventListener("resize", (event) => {
  clearTimeout(windowResizeTimeout);
  windowResizeTimeout = setTimeout(windowResize(), 100);
});
function windowResize() {
  positionShelf();
}

/////////////////
// PHOTOGRAPHY //
bilderScroll.el.addEventListener("pointerdown", (event) => {
  bilderScroll.wasMoved = false;
});
bilderScroll.el.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (event.pressure > 0.1) {
    bilderScroll.wasMoved = true;
    bilderScroll.scrollPos -= event.movementX;
    window.requestAnimationFrame(() => {
      setBilderScrollPos();
    });
  }
});
bilderScroll.el.addEventListener("pointerup", (event) => {
  if (!bilderScroll.wasMoved) {
    // TODO: OPEN IMAGE IN MODAL
  } else {
    bilderScroll.wasMoved = false;
    setBilderScrollPos();
  }
});
bilderScroll.el.addEventListener("pointerleave", (event) => {
  bilderScroll.wasMoved = false;
  setBilderScrollPos();
});

function setBilderScrollPos() {
  bilderScroll.el.style.transform = `translateX(-${bilderScroll.scrollPos}px)`;
}

function positionShelf() {
  let shelfOffset = -500 + bilderScroll.clientHeight / 2 + bilderScroll.clientHeight * 0.538;
  bilderScroll.style.backgroundPosition = `0px ${shelfOffset}px`;
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

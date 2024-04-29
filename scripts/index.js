"use strict";

import bgCanvas from "./bgCanvas.js";

///////////////////////
// GLOBAL VARIABLES: //
let windowResizeTimeout;

///////////
// INIT: //
bgCanvas.init("#bgCanvas");

////////////////////
// GLOBAL EVENTS: //
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
const bilderRow = document.querySelector("#BilderRow");
const slider = new Map().set("scrollPos", 0).set("downPos", 0).set("wasMoved", false);

bilderRow.querySelectorAll("img").forEach((imgEl) => {
  setSizeAttributes(imgEl);
  imgEl.addEventListener("load", function BildLoad(event) {
    setSizeAttributes(event.target);
    event.target.removeEventListener("load", BildLoad);
  });
});

bilderRow.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  slider.set("downPos", event.x);
  slider.set("wasMoved", false);
});

bilderRow.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (event.pressure > 0.1 && (event.x > slider.get("downPos") + 2 || event.x < slider.get("downPos") - 2)) {
    let newPos = slider.get("scrollPos") - event.movementX;
    slider.set("wasMoved", true);
    if (bilderRow.querySelectorAll(".Bild.active").length > 0) {
      const activeBilder = bilderRow.querySelectorAll(".Bild.active");
      activeBilder.forEach((el) => {
        switchImgResolution(el);
        el.classList.remove("active");
      });
      newPos = getOffsetForElementCentering(activeBilder[0]);
    }
    setBilderScrollPos(newPos);
  }
});

bilderRow.addEventListener("pointerup", (event) => {
  if (slider.get("wasMoved")) {
    slider.set("wasMoved", false);
    setBilderScrollPos();
    return;
  }
  if (event.target.tagName === "IMG") {
    switchImgResolution(event.target);
    event.target.classList.toggle("active");
    setBilderScrollPos(getOffsetForElementCentering(event.target));
  }
});

bilderRow.addEventListener("pointerleave", () => {
  slider.set("wasMoved", false);
  setBilderScrollPos();
});

function positionShelf() {
  if (document.querySelector("#BilderScroll") && document.querySelector("#BilderRow")) {
    document.querySelector("#BilderScroll").style.backgroundPositionY = `calc(50% + ${bilderRow.clientHeight * 0.535}px)`;
  }
}

function setSizeAttributes(element) {
  if (element.getAttribute("width") > 0) {
    element.setAttribute("width", element.clientWidth);
  }
  if (element.getAttribute("height") > 0) {
    element.setAttribute("height", element.clientHeight);
  }
}

function setBilderScrollPos(value) {
  if (typeof value === "number") {
    slider.set("scrollPos", value);
  }
  slider.set("maxPos", bilderRow.clientWidth - window.innerWidth);
  if (slider.get("scrollPos") < 0) slider.set("scrollPos", 0);
  if (slider.get("scrollPos") > slider.get("maxPos")) slider.set("scrollPos", slider.get("maxPos"));
  bilderRow.style.transform = `translateX(-${slider.get("scrollPos")}px)`;
}

function getOffsetForElementCentering(targetEl) {
  const parentRect = targetEl.parentElement.getBoundingClientRect();
  let offset = slider.get("scrollPos") + (parentRect.x - (window.innerWidth - parentRect.width) / 2);
  return offset;
}

function switchImgResolution(el) {
  const windowAspectRatio = window.innerWidth / window.innerHeight;
  const imgAspectRatio = el.clientWidth / el.clientHeight;
  const currentImgUrl = el.src;
  if (!el.classList.contains("active")) {
    const newImage = new Image();
    let newImgUrl = currentImgUrl.replace("/S/", "/L/");
    newImage.src = newImgUrl;
    if (windowAspectRatio > imgAspectRatio) {
      const height = window.innerHeight * 0.8;
      const width = height * imgAspectRatio;
      el.style = `width: ${width}px;max-width: ${width}px;height: ${height}px;max-height: ${height}px`;
    } else {
      const width = window.innerWidth * 0.9;
      const height = width / imgAspectRatio;
      el.style = `width: ${width}px;max-width: ${width}px;height: ${height}px;max-height: ${height}px`;
    }
    el.addEventListener("transitionend", function swapImg() {
      el.src = newImgUrl;
      el.removeEventListener("transitionend", swapImg);
    });
    return;
  }
  if (el.classList.contains("active")) {
    el.src = currentImgUrl.replace("/L/", "/S/");
    const width = el.getAttribute("width");
    const height = el.getAttribute("height");
    el.style = `width: ${width}px;max-width: ${width}px;height: ${height}px;max-height: ${height}px`;
    return;
  }
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

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
  console.log("LOAD EVENT TRIGGERED");
});
window.addEventListener("resize", (event) => {
  clearTimeout(windowResizeTimeout);
  windowResizeTimeout = setTimeout(() => {
    bgCanvas.init("#bgCanvas");
    document.querySelectorAll(".Bild.active").forEach((el) => {
      // TODO: FIX THIS (WEIRD WHEN BILD IS ACTIVE AND THEN RESIZING HAPPENS)
      switchImgResolution(el);
      el.classList.remove("active");
    });
    document.querySelectorAll(".Bild").forEach((Bild) => {
      setSizeAttributes(Bild, true);
      Bild.addEventListener(
        "load",
        (event) => {
          setSizeAttributes(event.target, true);
        },
        { once: true }
      );
    });
  }, 100);
});

/////////////////
// PHOTOGRAPHY //
const bilderRow = document.querySelector("#BilderRow");
const slider = new Map().set("scrollPos", 0).set("pointerPos", 0).set("wasMoved", false);

bilderRow.querySelectorAll(".Bild").forEach((Bild) => {
  setSizeAttributes(Bild);
  Bild.addEventListener(
    "load",
    (event) => {
      setSizeAttributes(event.target);
    },
    { once: true }
  );
  Bild.addEventListener("focus", (event) => {
    setBilderScrollPos(getOffsetForElementCentering(event.target));
    event.target.classList.add("hover");
    event.target.addEventListener("keydown", (keyEvent) => {
      if (keyEvent.code === "Enter" || keyEvent.code === "Space") {
        keyEvent.preventDefault();
        event.target.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        event.target.dispatchEvent(
          new PointerEvent("pointerup", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      }
    });
  });
  Bild.addEventListener("blur", (event) => {
    event.target.classList.remove("hover");
    if (event.target.classList.contains("active")) {
      switchImgResolution(event.target);
      event.target.classList.remove("active");
    }
  });
});

bilderRow.addEventListener("pointerover", (event) => {
  bilderRow.querySelectorAll(".Bild").forEach((el) => {
    if (el.classList.contains("hover")) {
      el.classList.remove("hover");
    }
  });
  if (event.target.classList.contains("Bild")) {
    event.target.classList.add("hover");
  }
});

bilderRow.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  slider.set("pointerPos", event.x);
  slider.set("wasMoved", false);
});

bilderRow.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (event.pressure > 0.1) {
    if (!slider.get("wasMoved")) {
      slider.set("wasMoved", event.x > slider.get("pointerPos") + 2 || event.x < slider.get("pointerPos") - 2 ? true : false);
      return;
    }
    let newPos = slider.get("scrollPos") + (slider.get("pointerPos") - event.x) * window.devicePixelRatio;
    slider.set("pointerPos", event.x);
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
  bilderRow.querySelectorAll(".Bild").forEach((el) => {
    if (el.classList.contains("hover")) {
      el.classList.remove("hover");
    }
  });
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

function setSizeAttributes(element, refresh = false) {
  if (element.getAttribute("width") > 0 && element.getAttribute("height") > 0) {
    if (refresh) {
      element.setAttribute("width", "");
      element.setAttribute("height", "");
      setSizeAttributes(element);
      return;
    }
    return;
  }
  // element.setAttribute("width", element.clientWidth);
  // element.setAttribute("height", element.clientHeight);
  const elCompStyle = getComputedStyle(element);
  element.setAttribute("width", parseInt(elCompStyle.width));
  element.setAttribute("height", parseInt(elCompStyle.height));
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

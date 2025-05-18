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
  console.log("DOMContentLoaded EVENT TRIGGERED");
  addOnlyfansBtn();
  bgCanvas.animate();
  initSectionHeadlineObserver();
  initIllustrationBgBlurObserver();
});

window.addEventListener("load", (event) => {
  console.log("LOAD EVENT TRIGGERED");
});

window.addEventListener("resize", (event) => {
  clearTimeout(windowResizeTimeout);
  windowResizeTimeout = setTimeout(() => {
    bgCanvas.init("#bgCanvas");
    if (document.querySelectorAll(".Bild.active").length > 0) {
      for (const el of document.querySelectorAll(".Bild.active")) {
        switchImgResolution(el);
        el.classList.remove("active");
        el.addEventListener(
          "transitionend",
          (ev) => {
            for (const Bild of document.querySelectorAll(".Bild")) {
              setSizeAttributes(Bild, true);
            }
            setBilderScrollPos(getOffsetForElementCentering(ev.target));
          },
          { once: true },
        );
      }
    } else {
      for (const Bild of document.querySelectorAll(".Bild")) {
        setSizeAttributes(Bild, true);
      }
    }
  }, 100);
});

/////////////////
// PHOTOGRAPHY //
const bilderRow = document.querySelector("#BilderRow");
const slider = new Map().set("scrollPos", 0).set("pointerPos", 0).set("wasMoved", false);
// TODO: sometimes the images don't load (caching or the lazy load implementation is shit)

for (const Bild of bilderRow.querySelectorAll(".Bild")) {
  setSizeAttributes(Bild);
  Bild.addEventListener(
    "load",
    (event) => {
      setSizeAttributes(event.target);
    },
    { once: true },
  );
  Bild.addEventListener("blur", (event) => {
    removeHover();
    if (event.target.classList.contains("active")) {
      switchImgResolution(event.target);
      event.target.classList.remove("active");
      setBilderScrollPos();
    }
  });
  Bild.addEventListener("focus", (event) => {
    if (event.target.matches(":focus-visible")) {
      setBilderScrollPos(getOffsetForElementCentering(event.target));
      event.target.classList.add("hover");
    }
  });
  Bild.addEventListener("keydown", (keyEvent) => {
    if (keyEvent.code === "Enter" || keyEvent.code === "Space") {
      keyEvent.preventDefault();
      keyEvent.target.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
      keyEvent.target.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
    }
  });
}

bilderRow.addEventListener("pointerover", (event) => {
  removeHover();
  if (event.target.classList.contains("Bild")) {
    event.target.classList.add("hover");
  }
});

bilderRow.addEventListener("pointerdown", (event) => {
  slider.set("pointerPos", event.x);
  slider.set("wasMoved", false);
});

bilderRow.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (event.pressure > 0.1) {
    if (!slider.get("wasMoved")) {
      slider.set("wasMoved", !!(event.x > slider.get("pointerPos") + 2 || event.x < slider.get("pointerPos") - 2));
      return;
    }
    let newPos = slider.get("scrollPos") + (slider.get("pointerPos") - event.x) * window.devicePixelRatio;
    slider.set("pointerPos", event.x);
    if (bilderRow.querySelectorAll(".Bild.active").length > 0) {
      const activeBilder = bilderRow.querySelectorAll(".Bild.active");
      for (const el of activeBilder) {
        switchImgResolution(el);
        el.classList.remove("active");
      }
      newPos = getOffsetForElementCentering(activeBilder[0]);
    }
    setBilderScrollPos(newPos);
    // remove overlay:
    if (document.querySelector(".BilderScrollOverlay")) {
      const overlayEl = document.querySelector(".BilderScrollOverlay");
      overlayEl.style.opacity = 0;
      overlayEl.addEventListener("transitionend", (event) => {
        event.target.remove();
      });
    }
  }
});

bilderRow.addEventListener("pointerup", (event) => {
  removeHover();
  if (slider.get("wasMoved")) {
    slider.set("wasMoved", false);
    return;
  }
  if (event.target.tagName === "IMG") {
    switchImgResolution(event.target);
    event.target.classList.toggle("active");
    setBilderScrollPos(getOffsetForElementCentering(event.target));
  }
});

bilderRow.addEventListener("pointerleave", () => {
  removeHover();
  slider.set("wasMoved", false);
});

// TODO: sometimes the size doesn't get set properly (results to 0)
function setSizeAttributes(element, refresh = false) {
  if (element.getAttribute("width") > 0 && element.getAttribute("height") > 0) {
    if (refresh) {
      element.removeAttribute("width");
      element.removeAttribute("height");
      setSizeAttributes(element, false);
      return;
    }
    return;
  }
  element.setAttribute("width", element.clientWidth);
  element.setAttribute("height", element.clientHeight);
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
  const offset = slider.get("scrollPos") + (parentRect.x - (window.innerWidth - parentRect.width) / 2);
  return offset;
}

function switchImgResolution(el) {
  const screenPixelRatio = window.devicePixelRatio;
  const windowAspectRatio = window.innerWidth / window.innerHeight;
  const imgAspectRatio = el.clientWidth / el.clientHeight;
  const sourceEls = el.parentElement.querySelectorAll("source");
  const bilderSizes = [400, 800, 1200, 1600, 2000, 2400];

  function getNewSize(w, h) {
    // querformat:
    if (imgAspectRatio >= 1) {
      return bilderSizes.find((size) => size >= w * screenPixelRatio) || bilderSizes[bilderSizes.length - 1];
    }
    // hochformat:
    if (imgAspectRatio < 1) {
      return bilderSizes.find((size) => size >= h * screenPixelRatio) || bilderSizes[bilderSizes.length - 1];
    }
  }

  // from small to big:
  if (!el.classList.contains("active")) {
    if (windowAspectRatio > imgAspectRatio) {
      const height = window.innerHeight * 0.8;
      const width = height * imgAspectRatio;
      // set new img URLs:
      for (const sourceEl of sourceEls) {
        sourceEl.srcset = sourceEl.srcset.replace(/\d+\./, `${getNewSize(width, height)}.`);
      }
      el.src = el.src.replace(/\d+\./, `${getNewSize(width, height)}.`);
      // set new size for transformation:
      el.style = `width: ${width}px;height: ${height}px`;
    } else {
      const width = window.innerWidth * 0.9;
      const height = width / imgAspectRatio;
      // set new img URLs:
      for (const sourceEl of sourceEls) {
        sourceEl.srcset = sourceEl.srcset.replace(/\d+\./, `${getNewSize(width, height)}.`);
      }
      el.src = el.src.replace(/\d+\./, `${getNewSize(width, height)}.`);
      // set new size for transformation:
      el.style = `width: ${width}px;height: ${height}px`;
    }
    return;
  }

  // from big to small:
  if (el.classList.contains("active")) {
    // set new img URLs:
    for (const sourceEl of sourceEls) {
      sourceEl.srcset = sourceEl.srcset.replace(/\d+\./, "400.");
    }
    el.src = el.src.replace(/\d+\./, "400.");
    // set new size for transformation:
    el.removeAttribute("style");
    return;
  }
}

function removeHover() {
  for (const el of bilderRow.querySelectorAll(".Bild.hover")) {
    el.classList.remove("hover");
  }
}

///////////////////////
// ANIMATION SECTION //
for (const currentValue of document.querySelectorAll(".animVids")) {
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
}

//////////////////////
// GLOBAL FUNCTIONS //

function addOnlyfansBtn() {
  const headerSocialCont = document.querySelector(".headerSocialCont");
  if (headerSocialCont) {
    const onlyfansBtn = document.createElement("a");
    onlyfansBtn.classList.add("socialBtnLink", "tooltipBottom");
    onlyfansBtn.dataset.tooltip = "OnlyFans";
    onlyfansBtn.href = "https://www.onlyfans.com/dalailahner";
    onlyfansBtn.target = "_blank";
    onlyfansBtn.rel = "noreferrer";

    const onlyfansBtnImg = document.createElement("img");
    onlyfansBtnImg.classList.add("socialBtnImg");
    onlyfansBtnImg.src = "/svg/OnlyFansLogo.svg";
    onlyfansBtnImg.alt = "OnlyFans";

    onlyfansBtn.append(onlyfansBtnImg);

    onlyfansBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
      console.log("lol, gotem (¬‿¬)");
    });

    headerSocialCont.appendChild(onlyfansBtn);
  } else {
    console.warn('could not append Onlyfans Button. ".headerSocialCont" not found.');
  }
}

/**
 * building an array of thresholds for intersection observer
 *
 * @param {number} [steps=15] how many entries the array should contain. default: 15
 * @returns {number[]} an array of floats from 0 to 1 with the lenght of the array being the amount of `steps` provided.
 * @example buildThresholdList(8) -> [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
 */
function buildThresholdList(steps = 15) {
  const thresholds = [];
  for (let i = 1.0; i <= steps; i++) {
    const ratio = i / steps;
    thresholds.push(ratio);
  }
  return thresholds;
}

/////////////////////////////
// OBSERVER INIT FUNCTIONS //
function initSectionHeadlineObserver() {
  const sectionHeadlineObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.style.setProperty("--sectionHeadlineBrightness", Number.parseFloat(entry.intersectionRatio * 0.13 + 0.45).toFixed(2));
        entry.target.style.fontWeight = Number.parseInt(entry.intersectionRatio * 150 + 100);
      }
    },
    { root: null, rootMargin: "-15% 0px", threshold: buildThresholdList() },
  );

  for (const el of document.querySelectorAll(".sectionHeadline")) {
    sectionHeadlineObserver.observe(el);
  }
}

function initIllustrationBgBlurObserver() {
  // only if no mouse (aka no hover is available)
  if (window.matchMedia("(pointer: coarse)").matches) {
    const illustrationBgBlurObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const bgEl = entry.target.querySelector(".illustrationBG");
          bgEl.style.filter = `blur(${Number.parseFloat(entry.intersectionRatio * 5).toFixed(2)}px)`;
          bgEl.style.scale = Number.parseFloat(entry.intersectionRatio * 0.1 + 1.0).toFixed(3);
        }
      },
      {
        root: null,
        rootMargin: "-33% 0px -25% 0px",
        threshold: buildThresholdList(),
      },
    );

    for (const el of document.querySelectorAll(".illustrationCont")) {
      illustrationBgBlurObserver.observe(el);
    }
  }
}

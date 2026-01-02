import bgCanvas from "./bgCanvas.js";
import TextShuffle from "./textShuffle.js";
import themes from "./themes.json" with { type: "json" };

///////////////////////
// GLOBAL VARIABLES: //
let windowResizeTimeout;
const prefersReducedMotion = window?.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobileOrTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || navigator.userAgent.includes("Mobi") || window.matchMedia("(pointer: coarse)").matches;
const supportsCssViewportAnim = CSS.supports("animation-timeline", "view()");

///////////
// INIT: //
const textShuffle = new TextShuffle();

////////////////////
// GLOBAL EVENTS: //
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded EVENT TRIGGERED");

  if (localStorage.getItem("selectedTheme")) {
    heroImgSelect(localStorage.getItem("selectedTheme"));
  }

  if (!isMobileOrTouchDevice) {
    setupOnlyfansBtn();
  }

  bgCanvas.init("#bgCanvas");
  bgCanvas.animate();

  if (!prefersReducedMotion) {
    textShuffle.init(".textShuffle", 150, 2, 0.9, 0.2);
    initTextShuffleObserver();
  }

  initHeroImgSelectionObserver();

  if (!supportsCssViewportAnim) {
    initSectionHeadlineObserver();
    initIllustrationBgBlurObserver();
  }
});

window.addEventListener("load", () => {
  console.log("LOAD EVENT TRIGGERED");

  /* TODO: check accented when finished
  if (import.meta.env.MODE === "development") {
    import("accented").then(({ accented }) => {
      accented();
    });
  }
  */
});

window.addEventListener("resize", () => {
  clearTimeout(windowResizeTimeout);
  windowResizeTimeout = setTimeout(() => {
    if (bgCanvas.updateHeight()) {
      bgCanvas.init("#bgCanvas");
    }
    removeActiveFromBilder();
  }, 100);
});

//////////////
// HERO IMG //
for (const btn of document.querySelectorAll(".heroImgSelectorBtn")) {
  btn.addEventListener("click", (event) => {
    heroImgSelect(event.target);
  });
}

function heroImgSelect(target) {
  const heroImgs = document.querySelectorAll(".heroImgCont");
  const activeImg = Array.from(heroImgs).find((el) => el.classList.contains("active"));
  let newImg;
  const animated = typeof target === "object";
  let forwardDirection;

  // target is from localStorage
  if (typeof target === "string") {
    document.documentElement.style.transitionDuration = "0.0001s";
    document.documentElement.addEventListener("transitionend", (ev) => {
      ev.target.style.transitionDuration = "";
    });
    if (typeof themes[target] === "object") {
      newImg = Array.from(heroImgs).find((el) => el?.querySelector("figcaption").textContent === target);
    } else {
      console.warn("didn't find selected theme skipping heroImgSelect(); looked for: ", target);
      return;
    }
  }
  // target is from an event
  if (typeof target === "object") {
    forwardDirection = target.classList.contains("next");
    if (forwardDirection) {
      newImg = activeImg.nextElementSibling;
      if (!newImg) {
        newImg = heroImgs[0];
      }
    }
    if (!forwardDirection) {
      newImg = activeImg.previousElementSibling;
      if (!newImg) {
        newImg = heroImgs[heroImgs.length - 1];
      }
    }
  }

  if (activeImg && newImg) {
    activeImg.inert = true;
    activeImg.classList.remove("active");
    if (animated) {
      const fadeOutName = `fadeOut${forwardDirection ? "L" : "R"}`;
      activeImg.classList.add(fadeOutName);
      const fadeOutEvent = activeImg.addEventListener("transitionend", (ev) => {
        ev.target.removeEventListener("transitionend", fadeOutEvent);
        ev.target.classList.remove(fadeOutName);
      });
    }

    newImg.inert = false;
    newImg.style.transitionDuration = "0.001s";

    const fadeInName = `fadeIn${forwardDirection ? "R" : "L"}`;
    if (animated) {
      newImg.classList.add(fadeInName);
    }
    setTimeout(() => {
      newImg.style = "";
      newImg.classList.add("active");
      if (animated) {
        const fadeInEvent = newImg.addEventListener("transitionend", (ev) => {
          ev.target.removeEventListener("transitionend", fadeInEvent);
          ev.target.classList.remove(fadeInName);
        });
      }
    }, 1);
    // set new color theme
    const newImgFigcaption = newImg.querySelector("figcaption");
    if (newImgFigcaption && typeof themes[newImgFigcaption.textContent] === "object") {
      localStorage.setItem("selectedTheme", newImgFigcaption.textContent);
      for (const [key, value] of Object.entries(themes[newImgFigcaption.textContent])) {
        document.documentElement.style.setProperty(key, value);
      }
      bgCanvas.updateOptions();
    } else {
      console.warn("no figcaption found in newImg or no object found in themes.json with the key of figcaption.textContent");
    }
  } else {
    console.error("no active image or new image found");
    return;
  }
}
/////////////////
// PHOTOGRAPHY //
const bilderScroll = document.querySelector("#BilderScroll");
const bilderRow = document.querySelector("#BilderRow");
const slider = new Map().set("scrollPos", 0).set("pointerPos", 0).set("wasMoved", false);
// TODO: when live: check if images load and switch sizes properly

// general event
bilderScroll.addEventListener("focusout", () => {
  removeActiveFromBilder();
});

bilderRow.addEventListener("blur", () => {
  for (const Bild of bilderRow.querySelectorAll(".Bild.focus")) {
    Bild.classList.remove("focus");
  }
});

// mouse navigation
bilderRow.addEventListener("pointerover", (event) => {
  removeHover();
  if (event.target.classList.contains("Bild")) {
    event.target.classList.add("hover");
  }
});

bilderRow.addEventListener("pointerdown", (event) => {
  if (event.isTrusted) {
    for (const Bild of bilderRow.querySelectorAll(".Bild.focus")) {
      Bild.classList.remove("focus");
    }
    slider.set("pointerPos", event.x);
  }
  slider.set("wasMoved", false);
});

bilderRow.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (event.pressure > 0.1) {
    if (!slider.get("wasMoved")) {
      slider.set("wasMoved", !!(event.x > slider.get("pointerPos") + 2 || event.x < slider.get("pointerPos") - 2));
      return;
    }
    if (!removeActiveFromBilder()) {
      const newPos = slider.get("scrollPos") + (slider.get("pointerPos") - event.x) * Number(window.devicePixelRatio.toFixed(3));
      slider.set("pointerPos", event.x);
      setBilderScrollPos(newPos);
    }

    removeSwipeOverlay();
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

// keyboard navigation
bilderRow.addEventListener("focus", (event) => {
  if (event.currentTarget.matches(":focus-visible")) {
    const firstBild = bilderRow.querySelector(".Bild");
    firstBild.classList.add("focus");
    setBilderScrollPos(getOffsetForElementCentering(firstBild));
  }
});

bilderRow.addEventListener("keydown", (keyEvent) => {
  const BilderArr = Array.from(bilderRow.querySelectorAll(".Bild"));
  let newFocusIndex = 0;

  // enter || space
  if (keyEvent.code === "Enter" || keyEvent.code === "Space") {
    if (bilderRow.querySelector(".Bild.focus")) {
      keyEvent.preventDefault();

      const focusedEl = bilderRow.querySelector(".Bild.focus");

      focusedEl.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
      focusedEl.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
    }
  }

  // left || right
  if (keyEvent.code === "ArrowRight" || keyEvent.code === "KeyL" || keyEvent.code === "KeyD" || keyEvent.code === "ArrowLeft" || keyEvent.code === "KeyH" || keyEvent.code === "KeyA") {
    const activeBild = document.querySelector(".Bild.active");
    if (activeBild) {
      activeBild.classList.add("focus");
      removeActiveFromBilder();
    }
    if (bilderRow.querySelector(".Bild.focus")) {
      newFocusIndex = BilderArr.findIndex((el) => el.classList.contains("focus"));
    }
    // right
    if (keyEvent.code === "ArrowRight" || keyEvent.code === "KeyL" || keyEvent.code === "KeyD") {
      if (!(newFocusIndex + 1 >= BilderArr.length)) {
        newFocusIndex += 1;
      }
      removeSwipeOverlay();
    }
    // left
    if (keyEvent.code === "ArrowLeft" || keyEvent.code === "KeyH" || keyEvent.code === "KeyA") {
      if (!(newFocusIndex - 1 < 0)) {
        newFocusIndex -= 1;
      }
    }

    for (const Bild of BilderArr) {
      Bild.classList.remove("focus");
    }
    BilderArr[newFocusIndex].classList.add("focus");
    setBilderScrollPos(getOffsetForElementCentering(BilderArr[newFocusIndex]));
  }
});

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
  let pictureRect;
  if (targetEl.tagName === "PICTURE" && targetEl.classList.contains("BildCont")) {
    pictureRect = targetEl.getBoundingClientRect();
  } else {
    const closestBildCont = targetEl.closest("picture.BildCont");
    if (closestBildCont) {
      pictureRect = closestBildCont.getBoundingClientRect();
    } else {
      console.error("no picture.BildCont element found at getOffsetForElementCentering()");
    }
  }
  const offset = slider.get("scrollPos") + (pictureRect.x - (window.innerWidth - pictureRect.width) / 2);
  return offset;
}

function switchImgResolution(el) {
  const screenPixelRatio = Number(window.devicePixelRatio.toFixed(3));
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
    } else {
      const width = window.innerWidth * 0.9;
      const height = width / imgAspectRatio;
      // set new img URLs:
      for (const sourceEl of sourceEls) {
        sourceEl.srcset = sourceEl.srcset.replace(/\d+\./, `${getNewSize(width, height)}.`);
      }
      el.src = el.src.replace(/\d+\./, `${getNewSize(width, height)}.`);
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
    return;
  }
}

function removeActiveFromBilder() {
  const activeImgs = document.querySelectorAll(".Bild.active");

  if (activeImgs.length > 0) {
    for (const el of activeImgs) {
      switchImgResolution(el);
      el.classList.remove("active");
    }

    setBilderScrollPos(getOffsetForElementCentering(activeImgs[activeImgs.length - 1]));

    return true;
  }
  return false;
}

function removeHover() {
  for (const el of bilderRow.querySelectorAll(".Bild.hover")) {
    el.classList.remove("hover");
  }
}

function removeSwipeOverlay() {
  const overlayEl = document.querySelector(".BilderScrollOverlay");
  if (overlayEl) {
    overlayEl.style.opacity = 0;
    overlayEl.addEventListener("transitionend", (event) => {
      event.target.remove();
    });
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

function setupOnlyfansBtn() {
  const onlyfansBtn = document.querySelector(".socialBtnLink.onlyfans");
  if (onlyfansBtn) {
    onlyfansBtn.href = "https://www.onlyfans.com/dalailahner";

    onlyfansBtn.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
      console.log("lol, gotem (¬‿¬)");
    });
  } else {
    console.warn('could not setup Onlyfans Button. ".socialBtnLink.onlyfans" not found.');
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

function initTextShuffleObserver() {
  const textShuffleObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          textShuffle.animate(entry.target);
        }
        if (entry.intersectionRatio === 1) {
          textShuffle.endAnimation(entry.target);
          textShuffleObserver.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: "0px", threshold: [0, 1] },
  );

  for (const el of document.querySelectorAll(".textShuffle")) {
    textShuffleObserver.observe(el);
  }
}

function initHeroImgSelectionObserver() {
  if (isMobileOrTouchDevice) {
    let headerHeight = "8%";
    const heroImgSelectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const headerEl = document.querySelector(".header");
          if (headerEl) {
            headerHeight = getComputedStyle(headerEl).height;
          }
          if (entry.intersectionRatio === 1) {
            entry.target.classList.add("hover");
          } else {
            entry.target.classList.remove("hover");
          }
        }
      },
      { root: null, rootMargin: `-${headerHeight} 0px 0px 0px`, threshold: buildThresholdList() },
    );

    heroImgSelectionObserver.observe(document.querySelector(".heroImgSectionHoverTarget"));
  }
}

function initSectionHeadlineObserver() {
  const sectionHeadlineObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.style.fontWeight = Number.parseInt(entry.intersectionRatio * 150 + 100, 10);
      }
    },
    { root: null, rootMargin: "-15% 0px", threshold: buildThresholdList() },
  );

  for (const el of document.querySelectorAll(".sectionHeadline")) {
    sectionHeadlineObserver.observe(el);
  }
}

function initIllustrationBgBlurObserver() {
  if (isMobileOrTouchDevice) {
    const illustrationBgBlurObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.style.setProperty("--illustrationBgBlur", `${Number.parseFloat(5 - entry.intersectionRatio * 5).toFixed(2)}px`);
          entry.target.style.setProperty("--illustrationBgScale", `${Number.parseFloat(1.1 - entry.intersectionRatio * 0.1).toFixed(3)}`);
        }
      },
      { root: null, rootMargin: "-20% 0px -15% 0px", threshold: buildThresholdList() },
    );

    for (const el of document.querySelectorAll(".illustrationCont")) {
      illustrationBgBlurObserver.observe(el);
    }
  }
}

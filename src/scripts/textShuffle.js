export default class TextShuffle {
  constructor() {
    this.globalOptions = {
      // biome-ignore format: allow long line
      symbols: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'U', '!', '@', '#', '€', '¥', '$', '&', '*', '(', ')', '-', '~', '_', '+', '=', '/', '[', ']', '{', '}', ';', ':', '<', '>', ',', '#', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      colors: ["--textShuffleColor1", "--textShuffleColor2", "--textShuffleColor3"],
      opacities: ["1", "0.6", "0.35"],
    };
    this.elMap = new Map();
  }

  init(selector, finishRange, finishSpeed = 1, switchChance = 0.5, gradientMultiplier = 0.5) {
    // check selector argument type
    if (typeof selector !== "string") {
      console.error(`textShuffle.init(): selector is not a string. got: ${selector} (type: ${typeof selector})`);
      return;
    }
    // check dom elements
    const textShuffleEls = document?.querySelectorAll(`${selector}`);
    if (!textShuffleEls && textShuffleEls.length < 1) {
      console.error(`textShuffle.init(): the selector doesn't match any DOM elements. got: ${selector} (type: ${typeof selector})`);
      return;
    }
    // check if colors exist
    const htmlElCompStyle = getComputedStyle(document.documentElement);
    const colorsCheck = [];
    for (const color of this.globalOptions.colors) {
      colorsCheck.push(htmlElCompStyle.getPropertyValue(color));
    }
    if (colorsCheck.includes("")) {
      console.error("textShuffle.init(): color not found; got: ", this.globalOptions.colors);
    }

    for (const textShuffleEl of textShuffleEls) {
      const elValMap = new Map();
      elValMap.set("firstRun", true);
      elValMap.set("finishRange", finishRange);
      elValMap.set("finishSpeed", finishSpeed);
      elValMap.set("switchChance", switchChance);
      elValMap.set("gradientMultiplier", gradientMultiplier);
      elValMap.set("originalText", textShuffleEl.textContent.trim().replaceAll(/\s+/g, " "));
      elValMap.set("finishIndex", 0 - elValMap.get("finishRange"));
      elValMap.set("animationEnding", false);

      // split text into individual els
      elValMap.set("spanArr", new Array(0));
      for (const letter of elValMap.get("originalText")) {
        const newSpan = document.createElement("span");
        if (/\s/.test(letter)) {
          newSpan.textContent = " ";
        } else {
          newSpan.textContent = letter;
        }
        elValMap.get("spanArr").push(newSpan);
      }

      // clear content of given element and fill with new els
      textShuffleEl.textContent = "";
      let nobreakSpan = document.createElement("span");
      nobreakSpan.className = "nobreak";
      for (const span of elValMap.get("spanArr")) {
        if (!/\s/.test(span.textContent)) {
          nobreakSpan.insertAdjacentElement("beforeend", span);
        } else {
          textShuffleEl.insertAdjacentElement("beforeend", nobreakSpan);
          nobreakSpan = document.createElement("span");
          nobreakSpan.className = "nobreak";
          textShuffleEl.insertAdjacentElement("beforeend", span);
        }
      }
      // insert the last word group too:
      textShuffleEl.insertAdjacentElement("beforeend", nobreakSpan);

      this.elMap.set(textShuffleEl, elValMap);
    }
  }

  // animation loop
  animate(el) {
    const elValMap = this.elMap.get(el);
    const changeMap = Array.from({ length: elValMap.get("spanArr").length }, () => Math.random());
    const gradientMap = Array.from({ length: elValMap.get("finishRange") }, () => Math.random());
    for (let i = 0; i < elValMap.get("finishRange"); i++) {
      gradientMap[i] += (elValMap.get("finishRange") - i) * (1 / elValMap.get("finishRange")) * elValMap.get("gradientMultiplier");
    }
    for (let i = 0; i < elValMap.get("spanArr").length; i++) {
      const span = elValMap.get("spanArr")[i];
      if (span.getAttribute("completed") !== "yes" && !/\s/.test(span.textContent)) {
        if (i < elValMap.get("finishIndex") || (elValMap.get("finishIndex") < i && i < elValMap.get("finishIndex") + elValMap.get("finishRange") && gradientMap[i - elValMap.get("finishIndex")] > 0.99)) {
          span.style = "";
          span.textContent = elValMap.get("originalText")[i];
          span.setAttribute("completed", "yes");
        } else if (changeMap[i] > elValMap.get("switchChance") || elValMap.get("firstRun")) {
          span.style.color = `var(${this.globalOptions.colors[Math.floor(Math.random() * this.globalOptions.colors.length)]}`;
          span.style.opacity = this.globalOptions.opacities[Math.floor(Math.random() * this.globalOptions.opacities.length)];
          span.textContent = this.globalOptions.symbols[Math.floor(Math.random() * this.globalOptions.symbols.length)];
        }
      }
    }
    elValMap.set("firstRun", false);
    if (elValMap.get("finishIndex") <= elValMap.get("spanArr").length) {
      requestAnimationFrame(() => {
        this.animate(el);
      });
    } else {
      el.textContent = elValMap.get("originalText");
    }
    if (elValMap.get("animationEnding", true)) elValMap.set("finishIndex", elValMap.get("finishIndex") + 1 * elValMap.get("finishSpeed"));
  }

  endAnimation(el) {
    const elValMap = this.elMap.get(el);
    elValMap.set("animationEnding", true);
  }
}

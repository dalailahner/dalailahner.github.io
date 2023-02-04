/////////////////
// PHOTOGRAPHY //
/////////////////

// horizontal drag scroll for images
const BilderScroll = document.querySelector('#BilderScroll');
const BildElemente = document.querySelectorAll('.Bild');
let isDown = false;
let isMoved = false;
let startX;
let scrollLeft;

const maxScrollSpeed = 10;
let lastTime;
let prevScrollPos;
let timer = 0;
let scrollSpeed = 0;
const currentTime = new Date().getTime();
const BildAnimOpt = {
  duration: 100,
  fill: "forwards",
  iteration: 1
};

BilderScroll.addEventListener('pointerdown', (e) => {
  isDown = true;
  isMoved = false;
  BilderScroll.classList.add('active');
  startX = e.pageX;
  scrollLeft = BilderScroll.scrollLeft;
});
BilderScroll.addEventListener('pointerleave', () => {
  isDown = false;
  BilderScroll.classList.remove('active');
});
BilderScroll.addEventListener('pointerup', () => {
  isDown = false;
  BilderScroll.classList.remove('active');
});
BilderScroll.addEventListener('pointermove', (e) => {
  if (!isDown) return;
  isMoved = true;
  e.preventDefault();
  document.querySelectorAll('.Bild.active').forEach(function (currentValue) {
    resetBild(currentValue);
  });
  let currentX = e.pageX;
  BilderScroll.scrollLeft = scrollLeft - (currentX - startX);


  if (prevScrollPos !== undefined && lastTime !== undefined) {
    const timeElapsed = currentTime - lastTime;
    scrollSpeed = Math.abs(scrollLeft - prevScrollPos) / timeElapsed;
  }
  if (timer !== null) {
    clearTimeout(timer);
  }

  timer = setTimeout(function () {
    BildElemente.forEach((image) => {
      image.animate([{
        transform: "rotateY(18deg) rotateX(10deg)"
      }], BildAnimOpt);
    });
  }, 100);

  let degrees = (scrollSpeed / maxScrollSpeed);
  // TODO: schreib irgendwie degrees um oder find irgendwas des du unten in transform eineschreib kannst.
  if (degrees > maxScrollSpeed) {
    degrees = maxScrollSpeed;
  }

  BildElemente.forEach((image) => {
    if (e.pageX > startX) {
      // left
      image.animate([{
        transform: "rotateY(18deg) rotateX(25deg)"
      }], BildAnimOpt);
    } else {
      // right
      image.animate([{
        transform: "rotateY(18deg) rotateX(-10deg)"
      }], BildAnimOpt);
    }
  });

  prevScrollPos = BilderScroll.scrollLeft;
  lastTime = currentTime;
});

// click image and make it big (like a modal/lightbox)
for (let i = 0; i < BildElemente.length; i++) {
  BildElemente[i].addEventListener('click', (e) => {
    if (!isMoved) {
      if (!e.target.classList.contains('active')) {
        navigator.vibrate(100);
        document.querySelectorAll('.Bild.active').forEach(function (currentValue) {
          resetBild(currentValue);
        });
        e.target.parentElement.style.zIndex = 1;
        e.target.classList.add('active');
        let offset = centerInViewport(e.target);
        e.target.style.transform = "rotateY(0deg) rotateX(0deg) translate(" + offset[0] + "px, " + offset[1] + "px)";
      } else {
        resetBild(e.target);
      }
    }
  });
}

function resetBild(el) {
  el.parentElement.style.zIndex = 0;
  el.classList.remove('active');
  el.removeAttribute('style');
}

function centerInViewport(el) {
  let bildRect = el.getBoundingClientRect();
  let vw = document.documentElement.clientWidth;
  let vh = document.documentElement.clientHeight;
  let offsetX = (vw / 2 - bildRect.width / 2) - bildRect.x;
  let offsetY = (vh / 2 - bildRect.height / 2) - bildRect.y;
  return [offsetX, offsetY];
}
// TODO: center image vertically on container >BilderScroll< and not on viewport

// shelf positioning
const BilderRow = document.querySelector('#BilderRow');

document.getElementById('sizeRefImg').onload = function () {
  positionShelf();
};

function positionShelf() {
  let shelfOffset = -500 + (BilderScroll.clientHeight / 2) + (BilderRow.clientHeight * 0.538);
  BilderScroll.style.backgroundPosition = "0px " + shelfOffset + "px";
}

// resize functions
window.onresize = function () {
  positionShelf();
};


////////////////
// ANIMATIONS //
////////////////
document.querySelectorAll('.animVids').forEach(function (currentValue) {
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

/////////////////
// PHOTOGRAPHY //
/////////////////

// horizontal drag scroll for images
const BilderScroll = document.querySelector('#BilderScroll');
var isDown = false;
var isMoved = false;
var startX;
var scrollLeft;

BilderScroll.addEventListener('pointerdown', (e) => {
  isDown = true;
  isMoved = false;
  BilderScroll.classList.add('active');
  startX = e.pageX - BilderScroll.offsetLeft;
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
  const x = e.pageX - BilderScroll.offsetLeft;
  BilderScroll.scrollLeft = scrollLeft - (x - startX);
});

// click image and make it big (like a modal/lightbox)
const BildElemente = document.querySelectorAll('.Bild');

for (var i = 0; i < BildElemente.length; i++) {
  BildElemente[i].addEventListener('click', (e) => {
    if (!isMoved) {
      if (!e.target.classList.contains('active')) {
        navigator.vibrate(100);
        document.querySelectorAll('.Bild.active').forEach(function (currentValue) {
          resetBild(currentValue);
        });
        e.target.parentElement.style.zIndex = 1;
        e.target.classList.add('active');
        var offset = centerInViewport(e.target);
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
  var bildRect = el.getBoundingClientRect();
  var vw = document.documentElement.clientWidth;
  var vh = document.documentElement.clientHeight;
  var offsetX = (vw / 2 - bildRect.width / 2) - bildRect.x;
  var offsetY = (vh / 2 - bildRect.height / 2) - bildRect.y;
  return [offsetX, offsetY];
}
// TODO: center image vertically on container >BilderScroll< and not on viewport

// shelf positioning
const BilderRow = document.querySelector('#BilderRow');

document.getElementById('sizeRefImg').onload = function () {
  positionShelf();
};

function positionShelf() {
  var shelfOffset = -500 + (BilderScroll.clientHeight / 2) + (BilderRow.clientHeight * 0.538);
  BilderScroll.style.backgroundPosition = "0px " + shelfOffset + "px";
}

// resize functions
window.onresize = function () {
  positionShelf();
};


////////////////
// ANIMATIONS //
////////////////

// ERWEITERE DEN CODE VON ID'S ZU KLASSEN MIT FOREACH UND EVENTUELL BEI TOUCH MIT TOGGLE PLAY/PAUSE

// set thumbnail time
document.getElementById("myVid").currentTime = document.getElementById("myVid").dataset.thumbtime;


// mouseover => go to the beginning of the video and play
document.getElementById("myVid").addEventListener("mouseover", function () {
  this.currentTime = 0;
  this.play();
});

// mouseleave => go to the thumbnail position time and pause
document.getElementById("myVid").addEventListener("mouseleave", function () {
  this.currentTime = this.dataset.thumbtime;
  this.pause();
});

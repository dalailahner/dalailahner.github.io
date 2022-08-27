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
  const x = e.pageX - BilderScroll.offsetLeft;
  BilderScroll.scrollLeft = scrollLeft - (x - startX);
});


// click image and make it big (like a modal/lightbox)
const BildElemente = document.querySelectorAll('.Bild');

for (var i = 0; i < BildElemente.length; i++) {
  BildElemente[i].addEventListener('click', (e) => {
    if (!isMoved) {
      if (!e.target.classList.contains('active')) {
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



// shelf positioning
const BilderRow = document.querySelector(".BilderRow");

function positionShelf() {
  BilderScroll.style.backgroundPosition = "50% calc(50% + " + BilderRow.offsetHeight * 0.5375 + "px)";
}

window.onresize = positionShelf();

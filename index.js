const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const API = "https://v2.api.noroff.dev/online-shop";
const ELECTRONICS_TAGS = new Set([
  "electronics",
  "audio",
  "storage",
  "computers",
  "peripherals",
  "gaming",
  "wearables",
  "watch",
]);

function priceBlock(p) {
  const same = Number(p.discountedPrice) === Number(p.price);
  return `
    <div class="price">
      <span class="now">$${Number(p.discountedPrice).toFixed(2)}</span>
      ${
        same ? "" : `<span class="before">$${Number(p.price).toFixed(2)}</span>`
      }
    </div>
  `;
}

function isElectronics(item) {
  const tags = Array.isArray(item.tags)
    ? item.tags.map((t) => String(t).toLowerCase())
    : [];
  return tags.some((t) => ELECTRONICS_TAGS.has(t));
}

let carIndex = 0;
let carItems = [];

function renderCarousel(items) {
  const track = document.getElementById("carTrack");
  if (!track) return;

  carItems = items.slice(0, 3);
  track.innerHTML = carItems
    .map(
      (p) => `
    <a class="car-card" href="product.html?id=${p.id}">
      <img src="${p.image?.url}" alt="${p.image?.alt || p.title}">
      <div class="car-info">
        <div class="car-title">${p.title}</div>
        ${priceBlock(p)}
      </div>
    </a>
  `
    )
    .join("");

  carIndex = 0;
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById("carTrack");
  if (!track) return;
  const width = track.clientWidth;
  track.style.transform = `translateX(-${carIndex * width}px)`;
}

function nextSlide() {
  if (!carItems.length) return;
  carIndex = (carIndex + 1) % carItems.length;
  updateCarousel();
}
function prevSlide() {
  if (!carItems.length) return;
  carIndex = (carIndex - 1 + carItems.length) % carItems.length;
  updateCarousel();
}

async function loadIndexPage() {
  const grid = document.getElementById("grid");
  const status = document.getElementById("status");

  if (!grid) return;

  try {
    const res = await fetch(API);
    const json = await res.json();
    const all = json.data || [];
    const electronics = all.filter(isElectronics);

    const forCarousel = (electronics.length >= 3 ? electronics : all).slice(
      0,
      3
    );
    renderCarousel(forCarousel);

    if (status) {
      status.textContent = `Showing ${Math.min(electronics.length, 12)} of ${
        electronics.length
      } products`;
    }
    const show = electronics.slice(0, 12);

    grid.innerHTML = show
      .map(
        (p) => `
      <a href="product.html?id=${p.id}" class="card">
        <img src="${p.image?.url}" alt="${p.image?.alt || p.title}">
        <div class="card-body">
          <h2 class="card-title">${p.title}</h2>
          <p class="card-desc">${p.description || ""}</p>
          ${priceBlock(p)}
        </div>
      </a>
    `
      )
      .join("");
  } catch (e) {
    console.error(e);
    if (status) status.textContent = "Failed to load products.";
  }
}

(function init() {
  const nextBtn = document.querySelector(".car-btn.next");
  const prevBtn = document.querySelector(".car-btn.prev");
  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
  if (prevBtn) prevBtn.addEventListener("click", prevSlide);
  window.addEventListener("resize", updateCarousel);

  loadIndexPage();
})();

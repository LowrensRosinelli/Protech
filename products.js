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

const year_products = document.getElementById("year");
if (year_products) year_products.textContent = new Date().getFullYear();

function isAuthed() {
  return Boolean(localStorage.getItem("accessToken"));
}

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

async function loadProductsPage() {
  const grid = document.getElementById("grid");
  const status = document.getElementById("status");
  if (!grid) return;

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    const all = json.data || [];
    const electronics = all.filter(isElectronics);

    if (status) status.textContent = `Showing ${electronics.length} products`;

    const authed = isAuthed();

    grid.innerHTML = electronics
      .map(
        (p) => `
      <div class="card" role="listitem">
        <a href="product.html?id=${p.id}">
          <img src="${p.image?.url}" alt="${p.image?.alt || p.title}">
        </a>
        <div class="card-body">
          <h2 class="card-title">
            <a href="product.html?id=${p.id}">${p.title}</a>
          </h2>
          <p class="card-desc">${p.description || ""}</p>
          ${priceBlock(p)}
          ${
            authed
              ? `<button class="btn-primary add-to-cart" data-id="${p.id}">Add to cart</button>`
              : `<a class="pill" href="account/login.html" title="Sign in to add to cart">Sign in to add</a>`
          }
        </div>
      </div>
    `
      )
      .join("");

    if (authed) {
      document.querySelectorAll(".add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const prod = electronics.find((p) => p.id === id);
          if (!prod) return;

          const cart = JSON.parse(localStorage.getItem("protech_cart") || "[]");
          const existing = cart.find((i) => i.id === prod.id);
          if (existing) existing.qty++;
          else
            cart.push({
              id: prod.id,
              title: prod.title,
              price: prod.discountedPrice ?? prod.price,
              image: prod.image?.url,
              qty: 1,
            });
          localStorage.setItem("protech_cart", JSON.stringify(cart));

          try {
            showToast(`${prod.title} added to cart`);
          } catch {}
        });
      });
    }
  } catch (err) {
    console.error("Product list error:", err);
    if (status) status.textContent = "Failed to load products.";
  }
}

function showToast(msg = "Added to cart") {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._tid);
  showToast._tid = setTimeout(() => t.classList.remove("show"), 1200);
}

document.addEventListener("DOMContentLoaded", loadProductsPage);

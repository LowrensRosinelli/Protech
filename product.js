const API_BASE = "https://v2.api.noroff.dev/online-shop";


const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();


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

function isAuthed() {
  return Boolean(localStorage.getItem("accessToken"));
}

function setPrice(p) {
  const nowEl = document.getElementById("prod-price");
  const beforeEl = document.getElementById("prod-before");
  const same = Number(p.discountedPrice) === Number(p.price);

  if (nowEl) nowEl.textContent = `$${Number(p.discountedPrice).toFixed(2)}`;
  if (beforeEl) {
    if (same) beforeEl.hidden = true;
    else {
      beforeEl.textContent = `$${Number(p.price).toFixed(2)}`;
      beforeEl.hidden = false;
    }
  }
}

async function loadProductPage() {
  const id = new URLSearchParams(location.search).get("id");
  const titleEl = document.getElementById("product-title");
  const descEl = document.getElementById("prod-desc");
  const imgEl = document.getElementById("prod-image");
  const addBtn = document.getElementById("add-to-cart");
  const metaEl = document.getElementById("prod-meta");
  const reviewsSection = document.getElementById("reviews-section");
  const reviewsList = document.getElementById("reviews-list");
  const shareBtn = document.getElementById("share-btn");

  if (!id || !titleEl) return;

 
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = location.href;
      try {
        if (navigator.share) {
          await navigator.share({ title: document.title, url });
        } else {
          await navigator.clipboard.writeText(url);
          showToast("Link copied");
        }
      } catch (_) {}
    });
  }

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch product (${res.status})`);
    const { data: p } = await res.json();

  
    titleEl.textContent = p.title;
    descEl.textContent = p.description || "";
    if (imgEl) {
      imgEl.src = p.image?.url || "";
      imgEl.alt = p.image?.alt || p.title || "Product image";
    }

    
    setPrice(p);

    const stars = typeof p.rating === "number"
      ? "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating))
      : "";
    const tags = Array.isArray(p.tags) && p.tags.length
      ? p.tags.map(t => `<span class="pill" style="padding:4px 8px; font-weight:600;">${t}</span>`).join(" ")
      : "";
    if (metaEl) {
      metaEl.innerHTML = [
        stars ? `<span aria-label="Rating">${stars} (${Number(p.rating).toFixed(1)})</span>` : "",
        tags ? `<span style="display:inline-flex;gap:6px;flex-wrap:wrap">${tags}</span>` : ""
      ].filter(Boolean).join(" · ");
    }

  
    if (Array.isArray(p.reviews) && p.reviews.length && reviewsSection && reviewsList) {
      reviewsList.innerHTML = p.reviews.map(r => `
        <li class="review">
          <div class="review-head" style="display:flex;gap:8px;align-items:center;">
            <strong>${r.username || "Anonymous"}</strong>
            <span class="review-stars" style="color:#f59f00;">
              ${"★".repeat(r.rating ?? 0)}${"☆".repeat(5 - (r.rating ?? 0))}
            </span>
          </div>
          <p style="margin:6px 0 0;">${r.description || ""}</p>
        </li>
      `).join("");
      reviewsSection.style.display = "block";
    }

  
    const authed = isAuthed();
    if (!authed && addBtn) {
      addBtn.disabled = true;
      addBtn.textContent = "Sign in to add";
      addBtn.addEventListener("click", () => {
        location.href = "account/login.html";
      });
    } else if (addBtn) {
      addBtn.addEventListener("click", () => {
        const cart = JSON.parse(localStorage.getItem("protech_cart") || "[]");
        const existing = cart.find(i => i.id === p.id);
        if (existing) existing.qty++;
        else cart.push({
          id: p.id,
          title: p.title,
          price: p.discountedPrice ?? p.price,
          image: p.image?.url,
          qty: 1,
        });
        localStorage.setItem("protech_cart", JSON.stringify(cart));
        showToast(`${p.title} added to cart`);
      });
    }
  } catch (err) {
    console.error("Product load error:", err);
    titleEl.textContent = "Failed to load product";
  }
}

document.addEventListener("DOMContentLoaded", loadProductPage);

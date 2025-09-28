// auth.js

const CART_KEY = "protech_cart";

// Finn navbar...
function getNav() {
  return document.querySelector("header .nav .nav-links");
}

function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return cart.reduce((s, i) => s + (Number(i.qty) || 1), 0);
  } catch {
    return 0;
  }
}

function updateCartBadge() {
  const nav = getNav();
  if (!nav) return;
  const cartLink = [...nav.querySelectorAll("a")].find(
    (a) => a.getAttribute("href") === "cart.html"
  );
  if (!cartLink) return;
  const n = getCartCount();

  const base = "Cart";
  cartLink.textContent = n > 0 ? `${base} (${n})` : base;
}

function renderAuthNav() {
  const nav = getNav();
  if (!nav) return;

  const token = localStorage.getItem("accessToken");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const signIn = [...nav.querySelectorAll("a")].find((a) =>
    a.getAttribute("href")?.includes("account/login.html")
  );
  const register = [...nav.querySelectorAll("a")].find((a) =>
    a.getAttribute("href")?.includes("account/register.html")
  );

  // Fjern ev. gammel "Signed in…" / "Sign out"
  nav.querySelectorAll(".auth-chip, .signout-btn").forEach((n) => n.remove());

  if (token && user) {
    if (signIn) signIn.style.display = "none";
    if (register) register.style.display = "none";

    const chip = document.createElement("span");
    chip.className = "auth-chip";
    chip.style.cssText = "color:var(--muted);font-size:13px;";
    chip.textContent = user.email || "Signed in";
    nav.appendChild(chip);

    // Vis Sign out..forstår ikke denne, men la vær
    const out = document.createElement("button");
    out.type = "button";
    out.className = "signout-btn pill";
    out.style.cssText = "margin-left:8px;background:#fff;cursor:pointer;";
    out.textContent = "Sign out";
    out.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (signIn) signIn.style.display = "";
      if (register) register.style.display = "";
      chip.remove();
      out.remove();
      renderAuthNav();
    });
    nav.appendChild(out);
  } else {
    if (signIn) signIn.style.display = "";
    if (register) register.style.display = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderAuthNav();
  updateCartBadge();

  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) updateCartBadge();
  });
});

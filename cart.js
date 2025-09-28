const CART_KEY = "protech_cart";

const yearSpan_cart = document.getElementById("year");
if (yearSpan_cart) yearSpan_cart.textContent = new Date().getFullYear();

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(n) {
  const num = Number(n) || 0;
  return `$${num.toFixed(2)}`;
}

function subtotal(cart) {
  return cart.reduce((sum, i) => sum + Number(i.price) * Number(i.qty || 1), 0);
}

function render() {
  const listEl = document.getElementById("cartList");
  const emptyEl = document.getElementById("cartEmpty");
  const statusEl = document.getElementById("cartStatus");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  const successEl = document.getElementById("checkoutSuccess");

  const cart = getCart();

  if (successEl) successEl.hidden = true;

  if (!cart.length) {
    if (listEl) listEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
    if (statusEl) statusEl.textContent = "0 items";
    if (subtotalEl) subtotalEl.textContent = money(0);
    if (totalEl) totalEl.textContent = money(0);
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (statusEl)
    statusEl.textContent = `${cart.reduce((s, i) => s + i.qty, 0)} items`;

  if (listEl) {
    listEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-row" role="listitem" data-id="${item.id}">
        <img src="${item.image || ""}" alt="${item.title || "Product"}" />
        <div class="c-info">
          <strong>${item.title || "Untitled"}</strong>
          <div class="muted c-price">${money(item.price)}</div>
        </div>
        <div class="c-qty" aria-label="Quantity controls">
          <button class="qty-btn" data-delta="-1" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-delta="1" aria-label="Increase quantity">+</button>
        </div>
        <div class="c-sub">${money(Number(item.price) * Number(item.qty))}</div>
        <button class="remove" aria-label="Remove item">Remove</button>
      </div>
    `
      )
      .join("");
  }

  const sum = subtotal(cart);
  if (subtotalEl) subtotalEl.textContent = money(sum);
  if (totalEl) totalEl.textContent = money(sum);

  bindRowEvents();
}

function bindRowEvents() {
  const listEl = document.getElementById("cartList");
  if (!listEl) return;

  listEl.querySelectorAll(".cart-row").forEach((row) => {
    const id = row.getAttribute("data-id");
    const minus = row.querySelector('.qty-btn[data-delta="-1"]');
    const plus = row.querySelector('.qty-btn[data-delta="1"]');
    const removeBtn = row.querySelector(".remove");

    if (minus) minus.addEventListener("click", () => changeQty(id, -1));
    if (plus) plus.addEventListener("click", () => changeQty(id, 1));
    if (removeBtn) removeBtn.addEventListener("click", () => removeItem(id));
  });
}

function changeQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === id);
  if (idx === -1) return;

  const current = cart[idx];
  const nextQty = (Number(current.qty) || 1) + Number(delta);
  if (nextQty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx] = { ...current, qty: nextQty };
  }
  setCart(cart);
  render();
}

function removeItem(id) {
  const cart = getCart().filter((i) => i.id !== id);
  setCart(cart);
  render();
}

function clearCart() {
  setCart([]);
  render();
}

function showCheckoutSuccess() {
  // Tøm handlekurv
  setCart([]);

  const listEl = document.getElementById("cartList");
  const emptyEl = document.getElementById("cartEmpty");
  const statusEl = document.getElementById("cartStatus");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  const successEl = document.getElementById("checkoutSuccess");

  if (listEl) listEl.innerHTML = "";
  if (emptyEl) emptyEl.hidden = true;
  if (statusEl) statusEl.textContent = "0 items";
  if (subtotalEl) subtotalEl.textContent = money(0);
  if (totalEl) totalEl.textContent = money(0);
  if (successEl) successEl.hidden = false;

  if (successEl) successEl.focus?.();
}

document.addEventListener("DOMContentLoaded", () => {
  render();

  const clearBtn = document.getElementById("clearCart");
  if (clearBtn) clearBtn.addEventListener("click", clearCart);

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showCheckoutSuccess();
    });
  }
});

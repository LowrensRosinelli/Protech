const CART_KEY = "protech_cart";

const yearSpan_co = document.getElementById("year");
if (yearSpan_co) yearSpan_co.textContent = new Date().getFullYear();

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
function money(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

function renderSummary() {
  const cart = getCart();
  const items = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const sub = cart.reduce(
    (s, i) => s + Number(i.price) * Number(i.qty || 1),
    0
  );

  const itemsEl = document.getElementById("sumItems");
  const subEl = document.getElementById("sumSubtotal");
  const totEl = document.getElementById("sumTotal");

  if (itemsEl) itemsEl.textContent = items;
  if (subEl) subEl.textContent = money(sub);
  if (totEl) totEl.textContent = money(sub);
}

function validate(form) {
  const req = ["fullName", "email", "address", "zip", "city", "country"];
  let ok = true;
  for (const id of req) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) ok = false;
  }

  const pm = form.querySelector('input[name="pm"]:checked')?.value || "card";
  if (pm === "card") {
    const card = document.getElementById("card");
    const exp = document.getElementById("exp");
    const cvc = document.getElementById("cvc");
    if (!card.value.trim() || !exp.value.trim() || !cvc.value.trim())
      ok = false;
  }
  return ok;
}

document.addEventListener("DOMContentLoaded", () => {
  renderSummary();

  const payRadios = document.querySelectorAll('input[name="pm"]');
  const cardFields = document.getElementById("cardFields");
  payRadios.forEach((r) => {
    r.addEventListener("change", () => {
      if (cardFields)
        cardFields.style.display = r.value === "card" ? "" : "none";
    });
  });

  const form = document.getElementById("checkoutForm");
  const errEl = document.getElementById("coError");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate(form)) {
      if (errEl) {
        errEl.textContent = "Please fill in all required fields.";
        errEl.style.display = "block";
      }
      return;
    }

    localStorage.setItem(CART_KEY, JSON.stringify([]));
    window.location.href = "success.html";
  });
});

// register.js — v2 only; includes required 'name' field

const REGISTER_URL = "https://v2.api.noroff.dev/auth/register";
const LOGIN_URL    = "https://v2.api.noroff.dev/auth/login";

// footer year (unik variabel for å unngå kollisjon)
const year_register = document.getElementById("year");
if (year_register) year_register.textContent = new Date().getFullYear();

function parseJSON(text) {
  try { return text ? JSON.parse(text) : {}; } catch { return {}; }
}

function validateFields(name, email, password, confirm) {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push("Please enter your full name (min 2 characters).");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Please enter a valid email.");
  if (!email.endsWith("@stud.noroff.no")) errors.push("Email must end with @stud.noroff.no.");
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters.");
  if (password !== confirm) errors.push("Passwords do not match.");
  return errors;
}

async function postJSON(url, body) {
  const res  = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const json = parseJSON(text);
  if (!res.ok) {
    const msg = json?.message || json?.errors?.[0]?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

document.addEventListener("DOMContentLoaded", () => {
  const form      = document.getElementById("registerForm");
  if (!form) return;

  const nameEl    = document.getElementById("regName");
  const emailEl   = document.getElementById("regEmail");
  const passEl    = document.getElementById("regPassword");
  const confirmEl = document.getElementById("regConfirm");
  const submit    = document.getElementById("regSubmit");
  const okEl      = document.getElementById("regSuccess");
  const errEl     = document.getElementById("regError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errEl.style.display = "none";
    okEl.style.display  = "none";

    const name     = (nameEl.value || "").trim();
    const email    = (emailEl.value || "").trim();
    const password = (passEl.value || "").trim();
    const confirm  = (confirmEl.value || "").trim();

    const errs = validateFields(name, email, password, confirm);
    if (errs.length) {
      errEl.innerHTML = errs.map(x => `• ${x}`).join("<br/>");
      errEl.style.display = "block";
      return;
    }

    const prev = submit.textContent;
    submit.disabled = true;
    submit.textContent = "Creating…";

    try {
      // 1) Register (v2) — name is required
      await postJSON(REGISTER_URL, { name, email, password });

      okEl.textContent = "Account created. Signing you in…";
      okEl.style.display = "block";

      // 2) Auto-login (v2)
      const login = await postJSON(LOGIN_URL, { email, password });
      const token = login?.data?.accessToken;
      const user  = login?.data;
      if (!token) throw new Error("Login failed.");

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      setTimeout(() => (window.location.href = "../index.html"), 600);
    } catch (err) {
      errEl.textContent = err.message || "Registration failed.";
      errEl.style.display = "block";
    } finally {
      submit.disabled = false;
      submit.textContent = prev;
    }
  });
});

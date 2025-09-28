const LOGIN_URL = "https://v2.api.noroff.dev/auth/login";

const year_signin = document.getElementById("year");
if (year_signin) year_signin.textContent = new Date().getFullYear();

function parseJSON(t){ try { return t ? JSON.parse(t) : {}; } catch { return {}; } }

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailEl = document.getElementById("email");
  const passEl  = document.getElementById("password");
  const btn     = document.getElementById("submitBtn");
  const okEl    = document.getElementById("successMessage");
  const errEl   = document.getElementById("errorMessage");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.style.display = "none";
    okEl.style.display  = "none";

    const email = (emailEl.value || "").trim();
    const password = (passEl.value || "").trim();
    if (!email || !password) {
      errEl.textContent = "Please enter email and password.";
      errEl.style.display = "block";
      return;
    }

    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Signing in…";

    try {
      const res  = await fetch(LOGIN_URL, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, password })});
      const text = await res.text();
      const json = parseJSON(text);
      if (!res.ok) {
        const msg = json?.message || json?.errors?.[0]?.message || `Login failed (${res.status})`;
        throw new Error(msg);
      }

      const token = json?.data?.accessToken;
      const user  = json?.data;
      if (!token) throw new Error("Invalid login response.");

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      okEl.textContent = "Signed in. Redirecting…";
      okEl.style.display = "block";
      setTimeout(() => (window.location.href = "../index.html"), 500);
    } catch (err) {
      errEl.textContent = err.message || "Login failed. Check your email and password.";
      errEl.style.display = "block";
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  });
});

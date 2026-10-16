/* Apply the saved appearance before styles paint; System remains a live preference. */
(() => {
  "use strict";
  const key = "games-lab-appearance";
  const valid = value => ["light", "dark", "system"].includes(value);
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = "system";
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) preference = saved;
  } catch (_) { /* Storage can be unavailable in private or restricted contexts. */ }

  function apply() {
    const resolved = preference === "system" ? (system.matches ? "dark" : "light") : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.appearance = preference;
    document.documentElement.style.colorScheme = resolved;
    const select = document.getElementById("appearance-select");
    if (select) select.value = preference;
  }
  apply();
  const onSystemChange = () => { if (preference === "system") apply(); };
  if (system.addEventListener) system.addEventListener("change", onSystemChange);
  else system.addListener(onSystemChange);
  window.addEventListener("storage", event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : "system";
    apply();
  });
  document.addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div");
    bar.className = "appearance-bar";
    bar.innerHTML = '<label class="appearance-control" for="appearance-select">Appearance<select id="appearance-select" aria-label="Appearance"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>';
    const header = document.querySelector("header");
    if (header) header.after(bar);
    else document.body.prepend(bar);
    apply();
    bar.querySelector("select").addEventListener("change", event => {
      preference = event.target.value;
      try { localStorage.setItem(key, preference); } catch (_) { /* Keep this page usable without persistence. */ }
      apply();
    });
  });
})();

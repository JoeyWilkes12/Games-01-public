/* Apply the saved appearance before styles paint; System remains a live preference. */
(() => {
  "use strict";
  const key = "games-lab-appearance";
  const valid = value => ["light", "dark", "system"].includes(value);
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const symbols = {
    system: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    dark: '<path d="M20.8 13.2A9 9 0 0 1 10.8 3.2a9 9 0 1 0 10 10Z"/>'
  };
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
    if (select) {
      select.value = preference;
      const control = select.closest("label");
      control.title = `Color theme: ${select.selectedOptions[0].text}`;
      control.querySelector(".theme-symbol").innerHTML = symbols[preference];
    }
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
    bar.innerHTML = '<label class="appearance-control" for="appearance-select"><select id="appearance-select" aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select><span class="theme-icon" aria-hidden="true"><svg class="theme-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></svg><svg class="theme-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 4.5 3 3 3-3"/></svg></span></label>';
    const header = document.querySelector("header");
    const navigation = header?.querySelector(".site-nav");
    if (navigation) navigation.append(bar);
    else if (header) header.after(bar);
    else document.body.prepend(bar);
    apply();
    bar.querySelector("select").addEventListener("change", event => {
      preference = event.target.value;
      try { localStorage.setItem(key, preference); } catch (_) { /* Keep this page usable without persistence. */ }
      apply();
    });
  });
})();

"use strict";
(() => {
  const NAMES = {
    Mc: "Monte Carlo",
    E: "Expectimax",
    Igs: "IDDFS graph search",
    Rl: "Reinforcement learning",
  };
  const ORDER = Object.keys(NAMES);
  const all =
    typeof dashboardData !== "undefined"
      ? dashboardData.records.filter(
          (r) =>
            Number.isFinite(r.Score) &&
            r.Score > 0 &&
            ORDER.includes(r.Algorithm) &&
            [16, 25].includes(r["Grid Area"]),
        )
      : [];
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const escape = (str) =>
    String(str ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const params = new URLSearchParams(location.search);
  const initialTab = location.hash.slice(1);
  const state = {
    board: params.get("board") === "25" ? 25 : 16,
    metric: params.get("metric") === "median" ? "median" : "mean",
    tab: "results",
    page: 1,
    search: params.get("q") || "",
    algo: ORDER.includes(params.get("strategy"))
      ? params.get("strategy")
      : "all",
    limit: 10,
  };
  function stats(rows) {
    return ORDER.map((code) => {
      const scores = rows
        .filter((r) => r.Algorithm === code)
        .map((r) => r.Score)
        .sort((a, b) => a - b);
      const n = scores.length;
      return {
        code,
        name: NAMES[code],
        n,
        mean: n ? scores.reduce((a, b) => a + b, 0) / n : 0,
        median: n
          ? (scores[Math.floor((n - 1) / 2)] + scores[Math.floor(n / 2)]) / 2
          : 0,
        min: scores[0] || 0,
        max: scores[n - 1] || 0,
      };
    });
  }
  const boardRows = () => all.filter((r) => r["Grid Area"] === state.board);
  function syncUrl() {
    const p = new URLSearchParams();
    if (state.board !== 16) p.set("board", state.board);
    if (state.metric !== "mean") p.set("metric", state.metric);
    if (state.search) p.set("q", state.search);
    if (state.algo !== "all") p.set("strategy", state.algo);
    history.replaceState(
      null,
      "",
      location.pathname + (p.size ? "?" + p : "") + "#" + state.tab,
    );
  }
  function activateTab(tab, focus = false) {
    if (!["results", "runs", "research"].includes(tab)) tab = "results";
    state.tab = tab;
    document.querySelectorAll("[data-tab]").forEach((b) => {
      const selected = b.dataset.tab === tab;
      b.setAttribute("aria-selected", selected);
      b.tabIndex = selected ? 0 : -1;
      if (selected && focus) b.focus();
    });
    ["results", "runs", "research"].forEach(
      (id) => ($("panel-" + id).hidden = id !== tab),
    );
    syncUrl();
  }
  function renderResults() {
    const rows = boardRows(),
      groups = stats(rows),
      ranked = [...groups].sort((a, b) => b[state.metric] - a[state.metric]);
    const leader = ranked[0],
      runner = ranked[1],
      max =
        Math.ceil(leader[state.metric] / (state.board === 16 ? 5000 : 25000)) *
        (state.board === 16 ? 5000 : 25000);
    $("comparison-scope").textContent =
      `${Math.sqrt(state.board)} × ${Math.sqrt(state.board)} board · ${leader.n} runs per strategy`;
    $("rank-chart").innerHTML = ranked
      .map(
        (g) =>
          `<div class="rank-item"><div class="rank-label"><span>${g.name}</span><strong>${fmt(g[state.metric])}</strong></div><div class="rank-track" aria-hidden="true"><div class="rank-fill" style="--bar:${(g[state.metric] / max) * 100}%"></div></div><span class="rank-meta">${g.n} runs · ${state.metric === "mean" ? "mean" : "median"} score in points</span></div>`,
      )
      .join("");
    $("chart-max").textContent = fmt(max) + " points";
    $("finding-title").textContent =
      `${leader.name} leads on the ${Math.sqrt(state.board)} × ${Math.sqrt(state.board)} board.`;
    const delta = (leader[state.metric] / runner[state.metric] - 1) * 100;
    $("finding-copy").innerHTML =
      `Its ${state.metric === "mean" ? "mean" : "median"} score is <strong>${fmt(leader[state.metric])} points</strong>, ${delta.toFixed(1)}% above ${runner.name} in these recorded runs. ${state.board === 16 ? "Switch to the 5 × 5 board: the observed leader changes." : "On the 4 × 4 board, the observed leader is different."}`;
    $("board-count").textContent = rows.length;
    $("board-high").textContent = fmt(Math.max(...rows.map((r) => r.Score)));
    const spreadMax =
      Math.ceil(
        Math.max(...rows.map((r) => r.Score)) /
          (state.board === 16 ? 10000 : 50000),
      ) * (state.board === 16 ? 10000 : 50000);
    $("distribution-chart").innerHTML = groups
      .map((g) => {
        const points = rows
          .filter((r) => r.Algorithm === g.code)
          .map(
            (r, i) =>
              `<circle cx="${(r.Score / spreadMax) * 600}" cy="${28 + ((i % 5) - 2) * 6}" r="4" fill="var(--teal)" fill-opacity=".65"><title>Run ${r.Index}: ${fmt(r.Score)} points</title></circle>`,
          )
          .join("");
        const mean = (g.mean / spreadMax) * 600;
        return `<div class="distribution-row"><span>${g.name}</span><svg viewBox="0 0 600 56" preserveAspectRatio="none" role="img" aria-label="${g.name}: ${g.n} runs, range ${fmt(g.min)} to ${fmt(g.max)} points, mean ${fmt(g.mean)}"><path d="M0 28H600" class="spread-baseline" stroke="var(--line)"/>${points}<path d="M${mean} 6v44" class="spread-mean" stroke="var(--ink)" stroke-width="3"/></svg></div>`;
      })
      .join("");
    $("spread-mid").textContent = fmt(spreadMax / 2);
    $("spread-max").textContent = fmt(spreadMax);
    $("range-table").innerHTML =
      `<div class="table-wrap"><table><thead><tr><th scope="col">Strategy</th><th scope="col">Low</th><th scope="col">Mean</th><th scope="col">High</th></tr></thead><tbody>${groups.map((g) => `<tr><th scope="row">${g.name}</th><td class="numeric">${fmt(g.min)}</td><td class="numeric">${fmt(g.mean)}</td><td class="numeric">${fmt(g.max)}</td></tr>`).join("")}</tbody></table></div>`;
    const small = stats(all.filter((r) => r["Grid Area"] === 16)),
      large = stats(all.filter((r) => r["Grid Area"] === 25));
    const bestSmall = Math.max(...small.map((g) => g.mean)),
      bestLarge = Math.max(...large.map((g) => g.mean));
    $("grid-comparison").innerHTML = small
      .map(
        (g, i) =>
          `<tr><th scope="row">${g.name}</th><td class="numeric">${fmt(g.mean)}${g.mean === bestSmall ? '<span class="table-best">Highest mean</span>' : ""}</td><td class="numeric">${fmt(large[i].mean)}${large[i].mean === bestLarge ? '<span class="table-best">Highest mean</span>' : ""}</td></tr>`,
      )
      .join("");
  }
  function filtered() {
    return boardRows().filter((r) => {
      const text = [r.Index, NAMES[r.Algorithm], r.Algorithm, r.Notes]
        .join(" ")
        .toLowerCase();
      return (
        (state.algo === "all" || r.Algorithm === state.algo) &&
        text.includes(state.search.toLowerCase().trim())
      );
    });
  }
  function renderRuns() {
    document.querySelector('[data-tab="runs"] span').textContent =
      boardRows().length;
    const rows = filtered(),
      limit =
        state.limit === "all" ? Math.max(1, rows.length) : Number(state.limit),
      pages = Math.max(1, Math.ceil(rows.length / limit));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * limit,
      visible = rows.slice(start, start + limit);
    $("run-rows").innerHTML = visible
      .map(
        (r) =>
          `<tr><td class="mono"><span class="mobile-only">Run </span>${r.Index}</td><td>${NAMES[r.Algorithm]}</td><td>${Math.sqrt(r["Grid Area"])} × ${Math.sqrt(r["Grid Area"])}</td><td class="numeric">${fmt(r.Score)}<span class="mobile-only score-unit">points</span></td><td class="${r.Notes ? "recorded-note" : "no-note"}">${r.Notes ? escape(r.Notes) : '<span class="muted">No note recorded</span>'}</td></tr>`,
      )
      .join("");
    $("run-summary").textContent =
      `${rows.length} matching ${rows.length === 1 ? "run" : "runs"} on the ${Math.sqrt(state.board)} × ${Math.sqrt(state.board)} board${rows.length ? ` · showing ${start + 1}–${Math.min(start + limit, rows.length)}` : ""}`;
    $("page-info").textContent = `Page ${state.page} of ${pages}`;
    $("prev-page").disabled = state.page <= 1;
    $("next-page").disabled = state.page >= pages;
    $("export-runs").disabled = !rows.length;
    $("no-runs").hidden = !!rows.length;
    $("runs-table-wrap").hidden = !rows.length;
    $("run-pagination").hidden = !rows.length;
  }
  function setBoard(board) {
    state.board = board;
    state.page = 1;
    document
      .querySelectorAll("[data-board]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", Number(b.dataset.board) === board),
      );
    renderResults();
    renderRuns();
    syncUrl();
  }
  document
    .querySelectorAll("[data-board]")
    .forEach((b) =>
      b.addEventListener("click", () => setBoard(Number(b.dataset.board))),
    );
  document.querySelectorAll("[data-tab]").forEach((b, i, buttons) => {
    b.addEventListener("click", () => activateTab(b.dataset.tab));
    b.addEventListener("keydown", (e) => {
      let next;
      if (e.key === "ArrowRight") next = (i + 1) % buttons.length;
      if (e.key === "ArrowLeft")
        next = (i - 1 + buttons.length) % buttons.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = buttons.length - 1;
      if (next !== undefined) {
        e.preventDefault();
        activateTab(buttons[next].dataset.tab, true);
      }
    });
  });
  document.querySelectorAll("[data-open-tab]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      activateTab(a.dataset.openTab, true);
      document.querySelector(".lab-tabs").scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }),
  );
  $("score-metric").value = state.metric;
  $("score-metric").addEventListener("change", (e) => {
    state.metric = e.target.value;
    renderResults();
    syncUrl();
  });
  $("run-search").value = state.search;
  $("run-search").addEventListener("input", (e) => {
    state.search = e.target.value;
    state.page = 1;
    renderRuns();
    syncUrl();
  });
  $("run-algorithm").value = state.algo;
  $("run-algorithm").addEventListener("change", (e) => {
    state.algo = e.target.value;
    state.page = 1;
    renderRuns();
    syncUrl();
  });
  $("rows-limit").addEventListener("change", (e) => {
    state.limit = e.target.value;
    state.page = 1;
    renderRuns();
  });
  $("prev-page").addEventListener("click", () => {
    state.page--;
    renderRuns();
  });
  $("next-page").addEventListener("click", () => {
    state.page++;
    renderRuns();
  });
  $("reset-runs").addEventListener("click", () => {
    state.search = "";
    state.algo = "all";
    state.page = 1;
    $("run-search").value = "";
    $("run-algorithm").value = "all";
    renderRuns();
    syncUrl();
  });
  $("export-runs").addEventListener("click", () => {
    const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const data = [
      ["Run ID", "Strategy", "Board", "Score", "Recorded notes"],
      ...filtered().map((r) => [
        r.Index,
        NAMES[r.Algorithm],
        `${Math.sqrt(state.board)}x${Math.sqrt(state.board)}`,
        r.Score,
        r.Notes,
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + data], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `2048-runs-${Math.sqrt(state.board)}x${Math.sqrt(state.board)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  addEventListener("hashchange", () => {
    const tab = location.hash.slice(1);
    if (["results", "runs", "research"].includes(tab)) activateTab(tab);
  });
  window.dashboardModel = { stats, all, filtered, state };
  if (!all.length) {
    $("panel-results").innerHTML =
      '<div class="no-script"><h2>The run data could not be loaded.</h2><p>Reload this page, or <a href="dashboard_data.json">open the original JSON</a>.</p></div>';
    return;
  }
  setBoard(state.board);
  activateTab(initialTab);
})();

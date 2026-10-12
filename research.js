"use strict";
(() => {
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
  const safeUrl = (url) => {
    try {
      const u = new URL(url, location.href);
      return ["https:", "http:"].includes(u.protocol) ? escape(u.href) : "#";
    } catch {
      return "#";
    }
  };
  function renderLibrary() {
    const root = document.getElementById("research-library");
    if (!root) return;
    const library = window.researchLibrary;
    if (!library?.papers?.length) {
      root.innerHTML =
        '<div class="no-script"><h2>Research notes are unavailable.</h2><p>Reload this page, or <a href="docs/research-notes.md">read the source notes</a>.</p></div>';
      return;
    }
    const direct = library.papers.filter((p) => p.kind === "Direct 2048 study"),
      background = [
        ...library.papers.filter((p) => p.kind !== "Direct 2048 study"),
        ...(library.excludedReferences || []),
      ];
    root.innerHTML = `<div class="research-intro"><div><h2>Read the ideas behind the moves.</h2><p>Start with studies that actually investigate 2048. These notes connect their methods to questions raised by our run log, without treating published results as our own.</p></div><aside><strong>Different experiments, different claims.</strong><p>Search budgets, training, rules, and hardware differ. A paper’s reported performance is not a benchmark for the strategies named in this workbook.</p></aside></div>${direct.map((p) => `<article class="paper" id="${escape(p.id)}"><div><span class="source-tag">Direct 2048 study</span><h3>${escape(p.title)}</h3><p class="citation">${escape(Array.isArray(p.authors) ? p.authors.join(", ") : p.authors)} · ${escape(p.year)}</p><div class="paper-links"><a href="${safeUrl(p.url)}" target="_blank" rel="noopener noreferrer">Read the source <svg class="icon external-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg></a>${p.pdfUrl ? `<a href="${safeUrl(p.pdfUrl)}" target="_blank" rel="noopener noreferrer">Open PDF <svg class="icon external-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg></a>` : ""}</div></div><div><p>${escape(p.summary)}</p><p class="paper-relevance">${escape(p.relevance)}</p>${p.findings?.length ? `<details><summary>Findings & commentary</summary>${p.findings.map((f) => `<h4>${escape(f.title)}</h4><p>${escape(f.text)} ${f.sourceUrl ? `<a href="${safeUrl(f.sourceUrl)}" target="_blank" rel="noopener noreferrer">${f.pages?.length ? "Source, p. " + f.pages.join(", ") : "Source"} <svg class="icon external-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg></a>` : ""}</p>`).join("")}</details>` : ""}</div></article>`).join("")}<section class="lab-section"><h2>Keep the background in context.</h2><p>The original collection also included these references. They explore related methods, but they do not provide direct evidence about this 2048 dataset.</p><details><summary>Show ${background.length} background references</summary><ul class="background-list">${background.map((p) => `<li><a href="${safeUrl(p.url)}" target="_blank" rel="noopener noreferrer">${escape(p.title)}</a> · ${escape(p.year)}<p>${escape(p.relevance || p.summary || p.reason)}</p></li>`).join("")}</ul></details></section><p class="library-status">Source notes reviewed ${escape(library.reviewedAt)} · <a href="docs/research-notes.md">Provenance & limitations</a> · <a href="research/README.md">Local PDF extraction guide</a></p>`;
  }
  renderLibrary();
})();

#!/usr/bin/env python3
"""Render the public document set into committed, JavaScript-independent HTML.

Install scripts/requirements-docs.txt, then run this file. --check detects drift.
The website serves the generated files directly; no server build is required.
"""
from __future__ import annotations
import argparse
import html
import json
import os
from pathlib import Path
import re
from urllib.parse import quote, unquote, urlsplit, urlunsplit
from markdown_it import MarkdownIt

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    ("docs/about.md", "about.html", "About Game Hub", "Play a little, look behind the moves, and follow what changes."),
    ("CHANGELOG.md", "changelog.html", "Changelog", "Updates to the games, the 2048 lab, and the way you explore them."),
    ("readme.md", "readme.html", "Project guide / README", "Local setup, game details, and the public preview workflow."),
    ("docs/versioning.md", "docs/versioning.html", "Application versioning", "How versions are chosen, what stays compatible, and what the history can establish."),
    ("docs/research-notes.md", "docs/research-notes.html", "2048 research and data notes", "Inspect the recorded observations, data limitations, and supporting literature."),
    ("research/README.md", "research/README.html", "Local PDF extraction guide", "Reproduce the research corpus while keeping complete sources local."),
    ("tests.md", "tests.html", "Testing guide", "Run reproducible checks and record demonstrations of the games."),
]
OUTPUTS = {(ROOT / source).resolve(): ROOT / output for source, output, *_ in PAGES}
MD = MarkdownIt("js-default", {"html": False})

def esc(value):
    return html.escape(str(value), quote=True)

def relative(target, output):
    return quote(os.path.relpath(target, (ROOT / output).parent).replace(os.sep, "/"), safe="/")

def rewrite_url(value, source, output):
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return value
    target = (ROOT / source).parent / unquote(parsed.path)
    target = target.resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError(f"{source}: link escapes the project: {value}")
    if target.suffix.lower() == ".md":
        if target not in OUTPUTS:
            raise ValueError(f"{source}: Markdown link needs an HTML page: {value}")
        target = OUTPUTS[target]
    elif target.is_dir() and (target / "index.html").is_file():
        target = target / "index.html"
    if target not in OUTPUTS.values() and not target.is_file():
        raise ValueError(f"{source}: unresolved local link: {value}")
    return urlunsplit(("", "", relative(target, output), parsed.query, parsed.fragment))

def walk(tokens):
    for token in tokens:
        yield token
        if token.children:
            yield from walk(token.children)

def slug(value):
    return re.sub(r"\s+", "-", re.sub(r"[^\w\s-]", "", value.lower()).strip())

def render_page(source, output, title, description, version):
    tokens = MD.parse((ROOT / source).read_text())
    page_id = "main"
    if len(tokens) >= 3 and tokens[0].type == "heading_open" and tokens[0].tag == "h1":
        page_id = slug(tokens[1].content)
        tokens = tokens[3:]
    contents = []
    ids = {}
    table_index = 0
    for i, token in enumerate(tokens):
        if token.type == "heading_open":
            plain = "".join(t.content for t in tokens[i+1].children or [] if t.type in ["text", "code_inline"])
            base = slug(plain)
            count = ids.get(base, 0)
            ids[base] = count + 1
            anchor = base + (f"-{count}" if count else "")
            token.attrSet("id", anchor)
            if token.tag == "h2":
                contents.append((anchor, plain))
        if token.type == "table_open":
            table_index += 1
            token.meta["label"] = (contents[-1][1] if contents else title) + f" — table {table_index}"
    for token in walk(tokens):
        if token.type == "link_open":
            token.attrSet("href", rewrite_url(token.attrGet("href"), source, output))
        if token.type == "image":
            token.attrSet("src", rewrite_url(token.attrGet("src"), source, output))
            token.attrSet("loading", "lazy")
    def table_open(ts, index, options, env):
        return f'<div class="doc-table-wrap" tabindex="0" role="region" aria-label="{esc(ts[index].meta["label"])}"><table>\n'
    MD.renderer.rules["table_open"] = table_open
    MD.renderer.rules["table_close"] = lambda *_: "</table></div>\n"
    body = MD.renderer.render(tokens, MD.options, {})
    body = body.replace("<pre>", '<pre tabindex="0" aria-label="Code example">')
    root = lambda path: relative(ROOT / path, output)
    sidebar = "".join(f'<a href="{root(other)}"'+(' aria-current="page"' if other == output else '')+f'>{esc(label)}</a>' for _, other, label, _ in PAGES)
    toc = '<details class="doc-contents"><summary>On this page</summary><nav aria-label="On this page">'+"".join(f'<a href="#{esc(anchor)}">{esc(label)}</a>' for anchor, label in contents)+'</nav></details>' if contents else ''
    share = ''
    if output in ['about.html', 'changelog.html']:
        share = f'<section class="doc-share" aria-labelledby="share-title"><div><h2 id="share-title">Share the changelog</h2><p>Scan to open the latest updates on another device.</p><a class="text-link" href="{root("changelog.html")}">Open the changelog</a></div><a href="{root("changelog.html")}" aria-label="Open the changelog"><img src="{root("assets/qr/changelog.svg")}" width="176" height="176" alt="QR code linking to the live Game Hub changelog"></a></section>'
    return f'''<!doctype html>
<!-- Generated from {esc(source)} by scripts/build-docs.py. Edit the Markdown source. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="{root('theme.js')}"></script>
  <meta name="description" content="{esc(description)}">
  <title>{esc(title)} — Game Hub</title>
  <link rel="icon" type="image/svg+xml" href="{root('assets/favicon.svg')}">
  <link rel="stylesheet" href="{root('style.css')}">
  <link rel="stylesheet" href="{root('docs.css')}">
  <link rel="stylesheet" href="{root('theme.css')}">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><nav class="site-nav wrap" aria-label="Main navigation"><a class="brand" href="{root('index.html')}"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Game Hub</a><div class="nav-links"><a href="{root('index.html')}">Play</a><a href="{root('dashboard.html')}">2048 lab</a></div></nav></header>
  <main class="wrap" id="main">
    <div class="doc-heading"><h1 id="{esc(page_id)}">{esc(title)}</h1><p>{esc(description)}</p></div>
    {share}
    {toc}
    <div class="doc-layout"><article class="doc-content" aria-label="{esc(title)}">{body}<p class="doc-origin"><a href="#main">Back to top</a></p></article><aside class="doc-sidebar"><h2>Project pages</h2><nav aria-label="Project documents">{sidebar}</nav></aside></div>
  </main>
  <footer class="site-footer"><div class="footer-inner wrap"><span>Game Hub · <span data-app-version>v{esc(version)} · Preview</span></span><div class="footer-links"><a href="{root('about.html')}">About</a><a href="{root('changelog.html')}">Changelog</a><a href="{root('dashboard.html')}">2048 lab</a></div></div></footer>
  <script src="{root('scripts/version.js')}"></script>
</body>
</html>
'''

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail when committed HTML differs from its sources.")
    args = parser.parse_args()
    version = json.loads((ROOT / "version.json").read_text())["version"]
    stale = []
    for source, output, title, description in PAGES:
        rendered = "\n".join(line.rstrip() for line in render_page(source, output, title, description, version).splitlines()) + "\n"
        target = ROOT / output
        if args.check:
            if not target.is_file() or target.read_text() != rendered:
                stale.append(output)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(rendered)
    if stale:
        raise SystemExit("Generated HTML is stale: " + ", ".join(stale))
    print(f"{'Checked' if args.check else 'Built'} {len(PAGES)} themed HTML documents.")

if __name__ == "__main__":
    main()

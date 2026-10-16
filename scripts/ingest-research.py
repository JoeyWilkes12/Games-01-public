#!/usr/bin/env python3
"""Build an ignored, page-mapped local corpus from the reviewed 2048 sources.

Requires pypdf and Pillow. Page previews use pdftoppm, with pypdfium2 fallback.
No source content is uploaded. Run from any directory; paths resolve from this
script's repository root. Public artifacts contain metadata, never full text.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import io
import json
from pathlib import Path
import shutil
import subprocess
import urllib.request

from PIL import Image
from pypdf import PdfReader


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def render_preview(pdf_path, number, destination):
    """Render actual PDF content; pypdf cannot rasterize vector figures."""
    poppler = shutil.which("pdftoppm")
    if poppler:
        subprocess.run([poppler, "-f", str(number), "-l", str(number),
                        "-scale-to", "1400", "-singlefile", "-png", str(pdf_path),
                        str(destination.with_suffix(""))], check=True, capture_output=True)
        return "pdftoppm"
    try:
        import pypdfium2
    except ImportError:
        return None
    with pypdfium2.PdfDocument(str(pdf_path)) as document:
        page = document[number - 1]
        width, height = page.get_size()
        bitmap = page.render(scale=1400 / max(width, height))
        bitmap.to_pil().save(destination, optimize=True)
    return "pypdfium2"


def ingest(source, root, source_dir, fetch):
    folder = root / source["id"]
    folder.mkdir(parents=True, exist_ok=True)
    pdf_path = folder / "source.pdf"
    if source_dir:
        supplied = source_dir / source["filename"]
        if not supplied.is_file():
            raise FileNotFoundError(supplied)
        shutil.copyfile(supplied, pdf_path)
    elif not pdf_path.is_file():
        if not fetch:
            raise FileNotFoundError(f"{pdf_path}: use --fetch or --source-dir")
        request = urllib.request.Request(source["pdfUrl"], headers={"User-Agent": "2048-research-ingestion/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read(20_000_001)
        if len(raw) > 20_000_000 or not raw.startswith(b"%PDF-"):
            raise ValueError(f"Unexpected PDF response: {source['id']}")
        pdf_path.write_bytes(raw)
    actual_hash = digest(pdf_path)
    if actual_hash != source["sha256"]:
        raise ValueError(f"Source changed: {source['id']} SHA-256 {actual_hash}; review before updating sources.json")
    reader = PdfReader(pdf_path)
    pages = []
    full_text = []
    embedded_count = 0
    warnings = []
    for page_number, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""
        page_file = f"page-{page_number:02d}.txt"
        (folder / page_file).write_text(text + "\n", encoding="utf-8")
        full_text.append(f"\n=== PDF PAGE {page_number} ===\n\n{text}\n")
        images = []
        for index, image in enumerate(page.images, 1):
            # Embedded images exclude PDF vector plots; previews retain those.
            image_name = f"page-{page_number:02d}-image-{index:02d}.png"
            try:
                with Image.open(io.BytesIO(image.data)) as extracted:
                    original_size = list(extracted.size)
                    extracted.thumbnail((1600, 1600))
                    extracted.convert("RGB").save(folder / image_name, optimize=True)
                images.append({"path": image_name, "sourceObject": image.name,
                               "originalPixels": original_size,
                               "note": "Embedded raster; downsampled if larger than 1600 px. Not necessarily a complete figure."})
                embedded_count += 1
            except (OSError, ValueError) as error:
                warnings.append(f"Page {page_number} image {index}: {type(error).__name__}")
        if not text.strip():
            warnings.append(f"Page {page_number} has no extracted text; OCR was not run.")
        pages.append({"pdfPage": page_number, "text": page_file,
                      "characters": len(text), "images": images})
    (folder / "full-text.txt").write_text("".join(full_text), encoding="utf-8")
    previews = []
    for number in source.get("previewPages", []):
        if number > len(reader.pages):
            raise ValueError(f"Preview page {number} out of range")
        destination = folder / f"page-{number:02d}-preview.png"
        renderer = render_preview(pdf_path, number, destination)
        if renderer:
            previews.append({"pdfPage": number, "path": destination.name, "renderer": renderer})
        else:
            warnings.append("No PDF renderer found; install Poppler or pypdfium2 for previews.")
    write_json(folder / "pages.json", {"sourceId": source["id"], "sourceSha256": actual_hash,
                "pageNumbering": "1-based PDF page index, not printed page labels",
                "extractor": "pypdf " + importlib.metadata.version("pypdf"),
                "pages": pages, "previews": previews, "warnings": warnings,
                "limitations": ["Reading order, mathematical notation, tables and ligatures may be imperfect.",
                    "No OCR; extracted raster objects omit vector drawings and captions.",
                    "Full text and figures are for local review; source reuse rights were not established."]})
    return {"id": source["id"], "sha256": actual_hash, "pdfBytes": pdf_path.stat().st_size,
            "pages": len(reader.pages), "pagesWithText": sum(bool(p["characters"]) for p in pages),
            "embeddedImages": embedded_count, "previewPages": [p["pdfPage"] for p in previews],
            "warnings": warnings}


def main():
    repo = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources", type=Path, default=repo / "research/sources.json")
    parser.add_argument("--local-dir", type=Path, default=repo / "research/local")
    parser.add_argument("--source-dir", type=Path, help="Use already downloaded PDFs named as in sources.json")
    parser.add_argument("--fetch", action="store_true", help="Download only reviewed public URLs whose PDF is missing")
    parser.add_argument("--coverage", type=Path, default=repo / "research/coverage.json")
    args = parser.parse_args()
    # Guard full source content from accidental commits to this public project.
    args.local_dir.mkdir(parents=True, exist_ok=True)
    (args.local_dir / ".gitignore").write_text("*\n!.gitignore\n", encoding="utf-8")
    sources = json.loads(args.sources.read_text(encoding="utf-8"))["sources"]
    result = [ingest(s, args.local_dir, args.source_dir, args.fetch) for s in sources]
    write_json(args.coverage, {"reviewedAt": "2026-10-12", "extractionVersion": 1,
               "localCorpus": "research/local (ignored)", "sources": result,
               "limitations": "Text order and equations need visual verification; no OCR. Full sources are not redistributed."})
    print(json.dumps({"sources": len(result), "pages": sum(r["pages"] for r in result),
                      "embeddedImages": sum(r["embeddedImages"] for r in result),
                      "coverage": str(args.coverage)}, indent=2))


if __name__ == "__main__":
    main()

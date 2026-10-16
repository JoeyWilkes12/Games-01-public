# Local research corpus

Three directly relevant 2048 PDFs are ingested locally. See [source notes](../docs/research-notes.md), [source manifest](sources.json), and [extraction coverage](coverage.json).

Run `python3 scripts/ingest-research.py --fetch` from the repository root to fetch and extract the public PDFs. Run without `--fetch` to repeat extraction offline. Python requires pypdf, Pillow and Poppler or pypdfium2. The source manifest pins fingerprints and relevant pages.

Each ignored `local/<source-id>/` directory contains `source.pdf`, `full-text.txt`, page text, an image/page mapping and figure/page previews. Filenames are listed by the manifest rather than assumed here. The complete 20-page corpus has 17 embedded raster images and six rendered previews. Vector charts are captured by page renders, not embedded raster extraction.

The original PDFs and extracts stay local because blanket redistribution rights were not established. Only concise original commentary, metadata and reproducible scripts belong in public source. The script never uploads contents.

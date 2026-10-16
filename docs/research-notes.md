# 2048 research and data notes

Reviewed 2026-10-12. The dashboard combines **historical score observations** with **separate literature commentary**. Research results are not additional benchmark observations.

## What the records measure

The controlling source is [`2048 Robots.xlsx`](../2048%20Robots.xlsx), worksheet `Record`, cells `A2:F149`: 148 manually recorded observations. All 148 exported JSON records match the workbook's first five fields. No additional complete observations were found below row 149. The worksheet includes formatted/formula rows beyond this range, which are not extra games.

| Field | Meaning and limit |
| --- | --- |
| Index | Unique record number, 1-148. It is not a timestamp or a paired experimental seed. |
| Algorithm | A source label: `Mc`, `E`, `Igs`, or `Rl`. It does not document the solver's implementation or settings. |
| Grid Area | Number of cells: 16 = 4×4; 25 = 5×5. |
| Score | The recorded game score. It does not identify the maximum tile or a win. |
| Full Name | Incomplete lookup output; use the `Legend` sheet's name/code pairs for display labels. |
| Notes | Optional manual annotation, populated for 10 of 148 rows. An empty note cannot establish failure to reach a tile. |

`generatedAt = 2026-01-01T21:40:45.182383` is the **export timestamp**, with no timezone supplied. Notes mention December 2021 for several groups of runs; the overall observation period is undocumented. The workbook's `Notes` sheet links to a separate [iOS game with AI](https://appadvice.com/app/2048-3x3-4x4-5x5-ai/1518647699), and to several solver resources. These links provide context; they do not prove which implementation or version produced each record. Do not label this dataset as a benchmark of the current browser app.

## Descriptive results

These values are recomputed from the original numeric `Score` cells. The mean is the sum divided by the number of observations; the median is the middle of the sorted scores (averaging the central two for an even count). Numbers below are rounded for display only.

| Board | Algorithm | Observations | Mean score | Median score | Lowest / highest recorded score |
| --- | --- | ---: | ---: | ---: | ---: |
| 4×4 | Monte Carlo | 20 | 13,052.20 | 14,174 | 5,320 / 27,128 |
| 4×4 | Expectimax Tree | 20 | 11,604.05 | 11,306 | 4,692 / 25,500 |
| 4×4 | IDDFS Graph Search | 20 | 11,240.80 | 11,950 | 3,240 / 27,092 |
| 4×4 | Reinforcement Learning | 20 | 9,295.40 | 7,436 | 3,380 / 16,104 |
| 5×5 | Monte Carlo | 17 | 71,152.00 | 70,640 | 36,492 / 168,764 |
| 5×5 | Expectimax Tree | 17 | 82,904.47 | 79,012 | 32,596 / 173,788 |
| 5×5 | IDDFS Graph Search | 17 | 120,758.82 | 130,852 | 36,800 / 177,500 |
| 5×5 | Reinforcement Learning | 17 | 72,380.24 | 79,864 | 16,440 / 130,656 |

The defensible reading is narrow: **Monte Carlo has the largest observed average on 4×4; IDDFS Graph Search has the largest on 5×5.** The older `algorithmic_performance_explanations_2048.md` claimed Expectimax led 4×4, which this dataset does not support. Scores vary substantially within every cohort, and the 4×4 mean/median order differs for Expectimax and IDDFS. Show the individual observations and sample sizes alongside summaries.

Comparisons across board sizes mix different tasks. More cells can change survival, branching and score scale, but the records cannot establish *why* the ranking changes. No shared seeds, trial protocol, search depth, rollout count, training budget, runtime, move count, hardware or complete tile outcomes are recorded. Do not infer statistical significance, win rates, efficiency, training quality or causal explanations from these summaries.

## Data-quality findings

- `Full Name` contains 106 blanks, 13 `#N/A` entries, and the number `2` in the first record. This is display metadata damage; all 148 algorithm codes, grid areas and scores are present.
- The old extractor treated the first `Legend` pair as headers, losing Monte Carlo and shifting the mapping. The source pairs are Monte Carlo/Mc, Expectimax Tree/E, IDDFS Graph Search/Igs, Reinforcement Learning/Rl.
- Record 146 (Expectimax, 4×4) has score **11,525**. Standard 2048 merges contribute multiples of four, so this may be a transcription error or a variant's scoring rule. Preserve the source value and flag it for verification. Excluding that single observation would not change the 4×4 mean ranking; exclusion is not an authorized correction.
- Record 111 records an interrupted/accidental-home-button episode. Preserve the annotation; the source does not supply enough detail to reconstruct an alternate result.
- There are no duplicated record identifiers, and all scores are positive finite numbers. This does not establish independent sampling or controlled conditions.

Source workbook SHA-256: `025e741e2b7821da361a908cf98b6808f4fedb242c95be54fcd21dfc93899004`.

## What the literature adds

The dashboard's [research data](../research-data.js) contains concise findings with one-based PDF page links. The three direct studies concern standard 4×4 2048; none validates the observed 5×5 ranking.

- **Rodgers and Levine (2014)**: pages 1-2 compare MCTS and ADLS and discuss time, depth and evaluation functions. Their separate mean-score and large-tile outcomes motivate inspecting distributions. The paper does not identify the workbook's `Mc` or `Igs` implementation. [Paper](https://www.cse.unr.edu/~sushil/pubs/newestPapers/aux/paper_106.pdf).
- **Ahmad Zaky (2014)**: pages 2-5 explain chance-weighted expectimax, heuristics and depth/speed tradeoffs. This is a course paper, not a universal performance guarantee. The app formerly attributed it to Rinaldi Munir, whose name appears in the hosting path; page 1 names Zaky. The PDF's embedded title is an unrelated template title. [Paper](https://informatika.stei.itb.ac.id/~rinaldi.munir/Stmik/2013-2014-genap/Makalah2014/MakalahIF2211-2014-037.pdf).
- **Jaśkowski (2016), version 3**: pages 10-11 combine learned evaluation with expectimax and report evaluation budgets. This provides a concrete counterexample to an inherent learning-versus-search hierarchy. It does not establish the training quality of the historical `Rl` agent. [Paper](https://arxiv.org/pdf/1604.05085v3).

The former research page also listed autonomous-vehicle path planning ([Bian et al.](https://doi.org/10.3390/s22249682)), Go/NoGo search budgeting ([Lan et al.](https://arxiv.org/abs/2012.07910)), image-classification network conversion ([Li et al.](https://arxiv.org/abs/2105.12917)), and language-model mathematical reasoning ([Wu et al.](https://arxiv.org/abs/2509.25454)). These remain in `excludedReferences` as background, with explicit scope notes. Their reported metrics are not evidence for this 2048 dataset.

## Local PDF corpus and reproduction

No relevant PDF was found in the three accessible project roots. The three directly relevant public papers already referenced by the app were retrieved from arXiv or university hosts. Only public URLs were requested; repository content was not sent to another service.

[`research/sources.json`](../research/sources.json) records authorship, pinned version where available, URL, fingerprint, reuse status and relevant pages. [`research/coverage.json`](../research/coverage.json) records successful extraction of **20 pages, 17 embedded raster images and six rendered page previews**. Every page has extractable text. Relevant results pages were visually checked against extraction.

Run from the repository root with Python, `pypdf`, Pillow and either Poppler (`pdftoppm`) or `pypdfium2` installed:

```sh
python3 scripts/ingest-research.py --fetch
```

For offline repetition, retain the ignored corpus and run without `--fetch`. To ingest already downloaded PDFs, use `--source-dir /path/to/pdfs`; the filenames and expected hashes are in `sources.json`. Changed source bytes cause an error, requiring review before the fingerprint is updated.

Each `research/local/<source-id>/` folder contains the original PDF, `full-text.txt`, per-page text, `pages.json` mapping text/images to PDF pages, embedded raster extracts and selected rendered previews. Page numbers are PDF indices, not inferred printed labels. Embedded raster extraction does not capture vector plots; rendered previews do. Text order, equations, tables and ligatures may need manual checking. No OCR or automatic chart digitization was performed.

Full PDFs, extracted text and figures remain **local and Git-ignored** because general redistribution rights were not established: Jaśkowski's arXiv license grants arXiv distribution rights, Rodgers/Levine is ©IEEE, and Zaky supplies no explicit reuse license. Public artifacts contain original concise commentary and source metadata. The ingestion script never uploads source contents.

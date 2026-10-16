/* Reviewed source notes, separate from the historical score records.
 * Full PDFs, text and figure extracts live in the ignored research/local corpus.
 * Source fingerprints and reproduction instructions: research/sources.json.
 */
window.researchLibrary = {
  reviewedAt: "2026-10-12",
  papers: [
    {
      id: "rodgers-levine-2014",
      title: "An Investigation into 2048 AI Strategies",
      shortTitle: "Search, simulations and board structure",
      authors: "Philip Rodgers and John Levine",
      year: 2014,
      kind: "Direct 2048 study",
      venue: "IEEE CIG 2014",
      summary: "Compares Monte Carlo Tree Search with Averaged Depth-Limited Search on standard 4×4 2048. Board evaluation and the time available to search materially affect the comparison.",
      relevance: "Useful for interpreting score distributions. It does not identify the implementation behind this workbook’s Mc or Igs labels.",
      url: "https://doi.org/10.1109/CIG.2014.6932920",
      pdfUrl: "https://www.cse.unr.edu/~sushil/pubs/newestPapers/aux/paper_106.pdf",
      pages: 2,
      license: "© 2014 IEEE; full source and figures retained for local review only.",
      findings: [
        {
          title: "Heuristics change the comparison",
          text: "ADLS outperformed vanilla MCTS in the authors’ experiments with an evaluation function rewarding organized boards. An algorithm family name alone does not explain a score.",
          pages: [1],
          sourceUrl: "https://www.cse.unr.edu/~sushil/pubs/newestPapers/aux/paper_106.pdf#page=1"
        },
        {
          title: "Average score and rare tiles can diverge",
          text: "At depth six, increasing ADLS iterations from 32 to 64 slightly improved average score but produced fewer 16384 tiles. A higher mean need not imply better rare-event performance.",
          pages: [2],
          sourceUrl: "https://www.cse.unr.edu/~sushil/pubs/newestPapers/aux/paper_106.pdf#page=2"
        }
      ]
    },
    {
      id: "zaky-2014",
      title: "Minimax and Expectimax Algorithm to Solve 2048",
      shortTitle: "Why chance nodes and search depth matter",
      authors: "Ahmad Zaky",
      year: 2014,
      kind: "Direct 2048 study",
      venue: "Institut Teknologi Bandung, IF2211 course paper",
      summary: "Explains minimax, expectimax and board heuristics. It illustrates the tradeoff between search depth, speed and reaching the 2048 tile in one implementation.",
      relevance: "Conceptual context for Expectimax. This course paper’s reported win rates are not win rates for the imported dashboard records.",
      url: "https://informatika.stei.itb.ac.id/~rinaldi.munir/Stmik/2013-2014-genap/Makalah2014/MakalahIF2211-2014-037.pdf",
      pdfUrl: "https://informatika.stei.itb.ac.id/~rinaldi.munir/Stmik/2013-2014-genap/Makalah2014/MakalahIF2211-2014-037.pdf",
      pages: 6,
      license: "No explicit reuse license identified; full source and figures retained locally.",
      findings: [
        {
          title: "Model the random tile spawn",
          text: "Expectimax weights successor values by their probabilities. The paper describes uniformly chosen empty cells and a 90% / 10% split for spawning 2 / 4 tiles.",
          pages: [2, 3],
          sourceUrl: "https://informatika.stei.itb.ac.id/~rinaldi.munir/Stmik/2013-2014-genap/Makalah2014/MakalahIF2211-2014-037.pdf#page=3"
        },
        {
          title: "Depth and evaluation both matter",
          text: "The paper evaluates empty space, neighboring tile differences and large tiles near borders. Its deeper-search results illustrate why depth and runtime should accompany score comparisons.",
          pages: [3, 4, 5],
          sourceUrl: "https://informatika.stei.itb.ac.id/~rinaldi.munir/Stmik/2013-2014-genap/Makalah2014/MakalahIF2211-2014-037.pdf#page=5"
        }
      ]
    },
    {
      id: "jaskowski-2016",
      title: "Mastering 2048 with Delayed Temporal Coherence Learning, Multi-Stage Weight Promotion, Redundant Encoding and Carousel Shaping",
      shortTitle: "Learning and search can work together",
      authors: "Wojciech Jaśkowski",
      year: 2016,
      kind: "Direct 2048 study",
      venue: "arXiv:1604.05085v3",
      summary: "Uses temporal-difference learning with n-tuple value functions, training improvements and expectimax search to build a strong standard-board 2048 controller.",
      relevance: "Counters the idea that reinforcement learning must underperform search. The workbook’s Rl label does not document a model, training budget or search policy.",
      url: "https://arxiv.org/abs/1604.05085v3",
      pdfUrl: "https://arxiv.org/pdf/1604.05085v3",
      pages: 12,
      license: "arXiv non-exclusive distribution license; full source and figures retained locally.",
      findings: [
        {
          title: "Learning and planning are compatible",
          text: "The controller evaluates learned n-tuple values inside expectimax. Treating reinforcement learning and tree search as mutually exclusive hides a useful hybrid approach.",
          pages: [10, 11],
          sourceUrl: "https://arxiv.org/pdf/1604.05085v3#page=10"
        },
        {
          title: "Compare a score with its compute budget",
          text: "Table V reports average score, games tested, tile frequencies and speed for different search budgets. Those controls are missing from the historical workbook.",
          pages: [11],
          sourceUrl: "https://arxiv.org/pdf/1604.05085v3#page=11"
        }
      ]
    }
  ],
  benchmark: {
    source: "2048 Robots.xlsx",
    worksheet: "Record",
    range: "A2:F149",
    recordCount: 148,
    exportedAt: "2026-01-01T21:40:45.182383",
    experimentPeriod: "Undocumented overall; several source notes refer to December 2021.",
    algorithms: { Mc: "Monte Carlo", E: "Expectimax Tree", Igs: "IDDFS Graph Search", Rl: "Reinforcement Learning" },
    sampleSizes: { "16": { Mc: 20, E: 20, Igs: 20, Rl: 20 }, "25": { Mc: 17, E: 17, Igs: 17, Rl: 17 } },
    fieldSemantics: {
      Index: "Historical record identifier; not a timestamp or paired random seed.",
      Algorithm: "Source app’s label; implementation details are not recorded.",
      "Grid Area": "Number of cells: 16 means 4×4 and 25 means 5×5.",
      Score: "Recorded cumulative game score; not maximum tile, win status, move count or duration.",
      Notes: "Sparse manual annotations; an empty note does not establish a failed run."
    },
    sourceSha256: "025e741e2b7821da361a908cf98b6808f4fedb242c95be54fcd21dfc93899004"
  },
  cautions: [
    "These are imported historical observations, not a controlled benchmark of the browser solvers.",
    "Compare algorithms within a board size. Extra cells change the task and score scale.",
    "There are 20 observations per algorithm on 4×4 and 17 on 5×5. Sample averages do not establish universal superiority.",
    "The data has no complete maximum-tile, move-count, duration, seed, search-depth, hardware or training-budget fields.",
    "Record 146 has score 11,525, which differs from standard 2048’s multiples-of-four scoring. It is preserved pending source verification.",
    "The Full Name column and legacy exported legends have errors. Labels are mapped from the source workbook’s Legend pairs.",
    "The cited papers study standard 4×4 boards. Their results do not explain the observed 5×5 advantage without further experiments."
  ],
  excludedReferences: [
    { id: "bian-2022", title: "End-to-End One-Shot Path-Planning Algorithm", authors: "Tongfei Bian, Yang Xing and Argyrios Zolotas", year: 2022, kind: "Background only", url: "https://doi.org/10.3390/s22249682", reason: "Autonomous-vehicle path planning on grid maps; not evidence for these 2048 scores." },
    { id: "lan-2020", title: "Learning to Stop: Dynamic Simulation Monte-Carlo Tree Search", authors: "Li-Cheng Lan et al.", year: 2020, kind: "Background only", url: "https://arxiv.org/abs/2012.07910", reason: "Search-budget research demonstrated in Go and NoGo; not a 2048 benchmark." },
    { id: "li-2021", title: "BSNN: Towards Faster and Better Conversion of Artificial Neural Networks to Spiking Neural Networks with Bistable Neurons", authors: "Yang Li, Yi Zeng and Dongcheng Zhao", year: 2021, kind: "Background only", url: "https://arxiv.org/abs/2105.12917", reason: "Neural-network conversion and image-classification experiments; not a 2048 study." },
    { id: "wu-2025", title: "DeepSearch: Overcome the Bottleneck of Reinforcement Learning with Verifiable Rewards via Monte Carlo Tree Search", authors: "Fang Wu et al.", year: 2025, kind: "Background only", url: "https://arxiv.org/abs/2509.25454", reason: "Language-model mathematical reasoning; not evidence for this game or its historical results." }
  ]
};

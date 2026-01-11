document.addEventListener('DOMContentLoaded', () => {
    if (typeof dashboardData !== 'undefined') {
        initDashboard(dashboardData);
    } else {
        console.error('Dashboard data not found. Ensure dashboard_data.js is loaded.');
    }
});

// Algorithm name mapping
const ALGO_NAMES = {
    'Mc': 'Monte Carlo',
    'E': 'Expectimax Tree',
    'Igs': 'IDDFS Graph Search',
    'Rl': 'Reinforcement Learning'
};

// Grid size mapping
const GRID_NAMES = {
    9: '3×3',
    16: '4×4',
    25: '5×5'
};

// Pagination state
let currentPage = 1;
let recordsPerPage = 25;
let filteredRecords = [];

function initDashboard(data) {
    const { records } = data;

    // Filter out empty records or invalid ones
    const validRecords = records.filter(r => r.Score > 0);

    updateSummaryStats(validRecords);
    renderCharts(validRecords);
    renderAnalysis(validRecords);
    renderGridSizeAnalysis(validRecords);
    initExplorer(validRecords);
    initTable(validRecords);
}

function updateSummaryStats(records) {
    const totalRuns = records.length;
    const highScore = Math.max(...records.map(r => Number(r.Score) || 0));
    
    // Count grid sizes
    const gridCounts = {};
    records.forEach(r => {
        const gridArea = r['Grid Area'];
        gridCounts[gridArea] = (gridCounts[gridArea] || 0) + 1;
    });

    document.getElementById('stat-total-runs').textContent = totalRuns;
    document.getElementById('stat-high-score').textContent = highScore.toLocaleString();
    
    // Show most common grid size instead of avg tile (which isn't in data)
    const mostCommonGrid = Object.entries(gridCounts)
        .sort((a, b) => b[1] - a[1])[0];
    document.getElementById('stat-avg-tile').textContent = 
        GRID_NAMES[mostCommonGrid[0]] || `${Math.sqrt(mostCommonGrid[0])}×${Math.sqrt(mostCommonGrid[0])}`;
}

// ---------------------------------------------------------
// Grid Size Analysis - NEW
// ---------------------------------------------------------

function renderGridSizeAnalysis(records) {
    // Group by Grid Area and Algorithm
    const gridAlgoStats = {};
    
    records.forEach(r => {
        const gridArea = r['Grid Area'];
        const algo = r['Algorithm'] || 'Unknown';
        
        if (!gridAlgoStats[gridArea]) gridAlgoStats[gridArea] = {};
        if (!gridAlgoStats[gridArea][algo]) {
            gridAlgoStats[gridArea][algo] = { sum: 0, count: 0 };
        }
        
        gridAlgoStats[gridArea][algo].sum += (Number(r.Score) || 0);
        gridAlgoStats[gridArea][algo].count += 1;
    });

    // Find best algorithm for each grid size
    const gridWinners = {};
    const gridSizes = Object.keys(gridAlgoStats).sort((a, b) => Number(a) - Number(b));
    
    gridSizes.forEach(gridArea => {
        let bestAlgo = null;
        let bestAvg = 0;
        
        Object.entries(gridAlgoStats[gridArea]).forEach(([algo, stats]) => {
            const avg = stats.sum / stats.count;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestAlgo = algo;
            }
        });
        
        gridWinners[gridArea] = { algo: bestAlgo, avgScore: bestAvg };
    });

    // Render winner cards
    const winnersContainer = document.getElementById('grid-winners');
    winnersContainer.innerHTML = '';
    
    gridSizes.forEach(gridArea => {
        const winner = gridWinners[gridArea];
        const gridName = GRID_NAMES[gridArea] || `${Math.sqrt(gridArea)}×${Math.sqrt(gridArea)}`;
        
        const card = document.createElement('div');
        card.className = 'grid-winner-card';
        card.innerHTML = `
            <h4>${gridName} Grid</h4>
            <div class="winner-algo">${ALGO_NAMES[winner.algo] || winner.algo}</div>
            <div class="winner-score">Avg: ${Math.round(winner.avgScore).toLocaleString()}</div>
        `;
        winnersContainer.appendChild(card);
    });

    // Check if one algorithm dominates all grid sizes
    const allWinners = Object.values(gridWinners).map(w => w.algo);
    const uniqueWinners = [...new Set(allWinners)];
    
    if (uniqueWinners.length === 1) {
        const dominantCard = document.createElement('div');
        dominantCard.className = 'grid-winner-card';
        dominantCard.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.2))';
        dominantCard.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        dominantCard.innerHTML = `
            <h4>🏆 Overall Winner</h4>
            <div class="winner-algo">${ALGO_NAMES[uniqueWinners[0]] || uniqueWinners[0]}</div>
            <div class="winner-score">Best across all grid sizes!</div>
        `;
        winnersContainer.appendChild(dominantCard);
    }

    // Render Grid Size Comparison Chart
    renderGridSizeChart(gridAlgoStats);
}

function renderGridSizeChart(gridAlgoStats) {
    const ctx = document.getElementById('gridSizeChart').getContext('2d');
    
    const gridSizes = Object.keys(gridAlgoStats).sort((a, b) => Number(a) - Number(b));
    const algorithms = [...new Set(Object.values(gridAlgoStats).flatMap(g => Object.keys(g)))];
    
    const colors = {
        'Mc': 'rgba(56, 189, 248, 0.8)',
        'E': 'rgba(16, 185, 129, 0.8)',
        'Igs': 'rgba(139, 92, 246, 0.8)',
        'Rl': 'rgba(245, 158, 11, 0.8)'
    };

    const datasets = algorithms.map(algo => ({
        label: ALGO_NAMES[algo] || algo,
        data: gridSizes.map(grid => {
            const stats = gridAlgoStats[grid]?.[algo];
            return stats ? Math.round(stats.sum / stats.count) : 0;
        }),
        backgroundColor: colors[algo] || 'rgba(148, 163, 184, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
    }));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: gridSizes.map(g => GRID_NAMES[g] || `${Math.sqrt(g)}×${Math.sqrt(g)}`),
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top'
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Average Score' }
                },
                x: {
                    title: { display: true, text: 'Grid Size' }
                }
            }
        }
    });
}

// ---------------------------------------------------------
// Analysis & Explorer Functions
// ---------------------------------------------------------

function renderAnalysis(records) {
    const ctx = document.getElementById('bestAlgoChart').getContext('2d');

    // Group by Algorithm & Calculate Average Score
    const algoStats = {};
    records.forEach(r => {
        const algo = r['Algorithm'] || 'Unknown';
        if (!algoStats[algo]) algoStats[algo] = { sum: 0, count: 0 };
        algoStats[algo].sum += (Number(r.Score) || 0);
        algoStats[algo].count += 1;
    });

    const labels = Object.keys(algoStats);
    const data = labels.map(algo => Math.round(algoStats[algo].sum / algoStats[algo].count));

    // Sort for better visualization (High to Low)
    const sortedIndices = data.map((v, i) => [v, i])
        .sort((a, b) => b[0] - a[0])
        .map(pair => pair[1]);

    const sortedLabels = sortedIndices.map(i => ALGO_NAMES[labels[i]] || labels[i]);
    const sortedData = sortedIndices.map(i => data[i]);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: 'Average Score',
                data: sortedData,
                backgroundColor: [
                    'rgba(56, 189, 248, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Avg Score: ${context.raw.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Average Score' }
                }
            }
        }
    });
}

function initExplorer(records) {
    const ctx = document.getElementById('explorerChart').getContext('2d');
    let explorerChart;

    const groupBySelect = document.getElementById('group-by');
    const metricSelect = document.getElementById('metric');

    const updateChart = () => {
        const groupBy = groupBySelect.value;
        const metric = metricSelect.value;

        // Aggregate Data
        const groups = {};
        records.forEach(r => {
            let key = r[groupBy];
            if (!key) key = 'Unknown';

            if (!groups[key]) groups[key] = { sum: 0, count: 0 };

            if (metric === 'Count') {
                groups[key].count += 1;
            } else {
                groups[key].sum += (Number(r[metric]) || 0);
                groups[key].count += 1;
            }
        });

        const labels = Object.keys(groups).sort();

        let data;
        let chartType = 'bar';

        if (metric === 'Count') {
            data = labels.map(k => groups[k].count);
            if (labels.length <= 5) chartType = 'pie';
        } else {
            data = labels.map(k => Math.round(groups[k].sum / groups[k].count));
        }

        // Format labels for display
        const displayLabels = labels.map(label => {
            if (groupBy === 'Algorithm') return ALGO_NAMES[label] || label;
            if (groupBy === 'Grid Area') return GRID_NAMES[label] || label;
            return label;
        });

        // Color palette
        const colors = displayLabels.map((_, i) => `hsl(${i * 360 / displayLabels.length}, 70%, 60%)`);

        // Destroy old chart if exists
        if (explorerChart) explorerChart.destroy();

        explorerChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: displayLabels,
                datasets: [{
                    label: metric === 'Count' ? 'Count' : `Average ${metric}`,
                    data: data,
                    backgroundColor: colors,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: displayLabels.length <= 10 },
                    title: {
                        display: true,
                        text: `${metric} by ${groupBy}`,
                        color: '#f8fafc',
                        font: { size: 16 }
                    }
                }
            }
        });
    };

    // Listeners
    groupBySelect.addEventListener('change', updateChart);
    metricSelect.addEventListener('change', updateChart);

    // Initial call
    updateChart();
}

function renderCharts(records) {
    const ctxScore = document.getElementById('scoreChart').getContext('2d');
    const ctxTile = document.getElementById('tileChart').getContext('2d');
    const ctxTimeline = document.getElementById('timelineChart').getContext('2d');

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

    // Score Distribution Chart (Bar)
    const scoreBins = {};
    records.forEach(r => {
        const bin = Math.floor((Number(r.Score) || 0) / 20000) * 20000;
        const label = `${(bin / 1000)}k-${(bin + 20000) / 1000}k`;
        scoreBins[label] = (scoreBins[label] || 0) + 1;
    });

    new Chart(ctxScore, {
        type: 'bar',
        data: {
            labels: Object.keys(scoreBins),
            datasets: [{
                label: 'Frequency',
                data: Object.values(scoreBins),
                backgroundColor: 'rgba(56, 189, 248, 0.6)',
                borderColor: '#38bdf8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    // Algorithm Distribution (Doughnut) - replacing Max Tile which isn't in data
    const algoCounts = {};
    records.forEach(r => {
        const algo = ALGO_NAMES[r['Algorithm']] || r['Algorithm'] || 'Unknown';
        algoCounts[algo] = (algoCounts[algo] || 0) + 1;
    });

    new Chart(ctxTile, {
        type: 'doughnut',
        data: {
            labels: Object.keys(algoCounts),
            datasets: [{
                data: Object.values(algoCounts),
                backgroundColor: [
                    '#38bdf8', '#10b981', '#8b5cf6', '#f59e0b'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { position: 'right' },
                title: { display: true, text: 'Algorithm Distribution' }
            }
        }
    });

    // Timeline Chart (Scores over time/index)
    new Chart(ctxTimeline, {
        type: 'line',
        data: {
            labels: records.map((r, i) => `Run ${r.Index || i + 1}`),
            datasets: [{
                label: 'Score',
                data: records.map(r => r.Score),
                borderColor: '#818cf8',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(129, 140, 248, 0.1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ---------------------------------------------------------
// Table with Pagination
// ---------------------------------------------------------

function initTable(records) {
    filteredRecords = records;
    
    const limitSelect = document.getElementById('rows-limit');
    const searchInput = document.getElementById('search-input');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    // Limit Change Listener
    limitSelect.addEventListener('change', (e) => {
        recordsPerPage = e.target.value === 'all' ? filteredRecords.length : parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredRecords = records.filter(r =>
            (r.Algorithm && String(r.Algorithm).toLowerCase().includes(term)) ||
            (r.Notes && String(r.Notes).toLowerCase().includes(term)) ||
            (r['Grid Area'] && String(r['Grid Area']).includes(term))
        );
        currentPage = 1;
        renderTable();
    });

    // Pagination buttons
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Initial render
    renderTable();
}

function renderTable() {
    const tbody = document.querySelector('#runs-table tbody');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    tbody.innerHTML = '';

    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage) || 1;
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredRecords.length);
    const displayRecords = filteredRecords.slice(startIndex, endIndex);

    displayRecords.forEach((r) => {
        const gridName = GRID_NAMES[r['Grid Area']] || `${Math.sqrt(r['Grid Area'])}×${Math.sqrt(r['Grid Area'])}`;
        const algoName = ALGO_NAMES[r.Algorithm] || r.Algorithm || '-';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${r.Index || '-'}</td>
            <td>${algoName}</td>
            <td>${gridName}</td>
            <td>${Number(r.Score).toLocaleString()}</td>
            <td>${r.Notes || '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    // Update pagination info
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${filteredRecords.length} records)`;
    
    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

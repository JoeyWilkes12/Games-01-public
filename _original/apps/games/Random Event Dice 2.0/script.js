/**
 * Random Event Dice 2.0
 * Single file bundle for file:// compatibility
 */

// --- Utils ---
const Logger = {
    log: (msg) => {
        const panel = document.getElementById('debug-logs');
        if (!panel) return;

        const now = new Date();
        const ts = now.toLocaleTimeString('en-US', { hour12: false });
        const entry = document.createElement('div');
        entry.style.borderBottom = '1px solid #333';
        entry.style.marginBottom = '2px';
        entry.innerHTML = `<span style="opacity:0.6">[${ts}]</span> ${msg}`;
        panel.prepend(entry);
    },
    clear: () => {
        const panel = document.getElementById('debug-logs');
        if (panel) panel.innerHTML = '';
    }
};

// --- UI ---
const UI = {
    elements: {
        diceContainer: null,
        timer: null,
        inputs: {}
    },

    init() {
        this.elements.diceContainer = document.getElementById('dice-container');
        this.elements.timer = document.getElementById('timer-display');
        this.elements.alertOverlay = document.getElementById('alert-overlay');
        this.elements.settingsContent = document.getElementById('settings-content');
        this.elements.modal = document.getElementById('advanced-modal');
        this.elements.logicList = document.getElementById('logic-list');

        this.elements.inputs = {
            diceCount: document.getElementById('dice-count'),
            diceSides: document.getElementById('dice-sides'),
            interval: document.getElementById('roll-interval'),
            duration: document.getElementById('game-duration'),
            resetDuration: document.getElementById('reset-duration'),
            volume: document.getElementById('alert-volume')
        };
    },

    bindEvents(gameInstance) {
        this.init(); // Ensure elements are found

        // Main Controls
        document.getElementById('start-btn').addEventListener('click', () => gameInstance.start());
        document.getElementById('stop-btn').addEventListener('click', () => gameInstance.stop());
        document.getElementById('toggle-settings').addEventListener('click', () => {
            this.elements.settingsContent.classList.toggle('collapsed');
        });

        // Debug Toggle
        document.getElementById('debug-toggle').addEventListener('click', () => {
            document.getElementById('debug-panel').classList.toggle('hidden');
        });
        document.querySelector('.close-debug').addEventListener('click', () => {
            document.getElementById('debug-panel').classList.add('hidden');
        });

        // Settings Inputs
        this.elements.inputs.diceCount.addEventListener('change', (e) => gameInstance.updateSetting('diceCount', parseInt(e.target.value)));
        this.elements.inputs.diceSides.addEventListener('change', (e) => gameInstance.updateSetting('diceSides', parseInt(e.target.value)));
        this.elements.inputs.interval.addEventListener('change', (e) => gameInstance.updateSetting('interval', parseFloat(e.target.value) * 1000));
        this.elements.inputs.duration.addEventListener('change', (e) => gameInstance.updateSetting('duration', parseInt(e.target.value)));

        // New Inputs
        if (this.elements.inputs.resetDuration) {
            this.elements.inputs.resetDuration.addEventListener('change', (e) => gameInstance.updateSetting('resetDuration', parseFloat(e.target.value) * 1000));
        }
        if (this.elements.inputs.volume) {
            this.elements.inputs.volume.addEventListener('input', (e) => gameInstance.updateSetting('volume', parseInt(e.target.value)));
        }

        // Advanced Modal
        document.getElementById('advanced-settings-btn').addEventListener('click', () => {
            this.openModal(gameInstance);
        });
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        document.getElementById('save-logic-btn').addEventListener('click', () => {
            this.saveModal(gameInstance);
        });
        document.getElementById('add-logic-btn').addEventListener('click', () => {
            this.addLogicGroup(gameInstance.settings.diceCount);
        });
    },

    updateControls(isPlaying) {
        document.getElementById('start-btn').disabled = isPlaying;
        document.getElementById('stop-btn').disabled = !isPlaying;

        // Disable settings inputs while playing (except volume maybe? users usually like volume adjustable live)
        // Let's keep volume enabled, disable others
        Object.entries(this.elements.inputs).forEach(([key, el]) => {
            if (key !== 'volume') el.disabled = isPlaying;
        });

        document.getElementById('advanced-settings-btn').disabled = isPlaying;
    },

    renderDice(count, values, matches = []) {
        if (!this.elements.diceContainer) return;
        this.elements.diceContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const die = document.createElement('div');
            die.className = 'die';
            if (matches.includes(i)) die.classList.add('match');

            const val = values[i];
            die.textContent = val !== undefined ? val : '?';

            // Visual flair
            if (i === 0) die.style.borderColor = '#ef4444';
            if (i === 1) die.style.borderColor = '#3b82f6';
            if (i === 2) die.style.borderColor = '#10b981';

            this.elements.diceContainer.appendChild(die);
        }
    },

    animateRoll() {
        const dice = document.querySelectorAll('.die');
        dice.forEach(d => {
            d.classList.add('rolling');
            setTimeout(() => d.classList.remove('rolling'), 300);
        });
    },

    updateTimer(seconds) {
        if (!this.elements.timer) return;
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        this.elements.timer.textContent = `${m}:${s}`;
    },

    showAlert(show, text = "EVENT TRIGGERED!") {
        if (show) {
            document.body.classList.add('alert-active');
            this.elements.alertOverlay.classList.remove('hidden');
            this.elements.alertOverlay.querySelector('.alert-message').textContent = text;
        } else {
            document.body.classList.remove('alert-active');
            this.elements.alertOverlay.classList.add('hidden');
        }
    },

    // --- Modal Logic ---

    openModal(game) {
        this.elements.modal.classList.remove('hidden');
        this.renderLogicList(game.settings.eventDefinitions, game.settings.diceCount);
    },

    closeModal() {
        this.elements.modal.classList.add('hidden');
    },

    renderLogicList(definitions, diceCount) {
        this.elements.logicList.innerHTML = '';
        definitions.forEach(def => {
            this.addLogicGroup(diceCount, def);
        });
    },

    addLogicGroup(diceCount, def = null) {
        const wrapper = document.createElement('div');
        wrapper.className = 'logic-item';

        let dieOptions = '';
        for (let i = 0; i < diceCount; i++) {
            dieOptions += `<option value="${i}">Die ${i + 1}</option>`;
        }

        let rulesHtml = '';
        if (def && def.rules) {
            def.rules.forEach(r => {
                if (r.dieIndex >= diceCount) return;

                rulesHtml += `
                    <div class="rule-item" data-die="${r.dieIndex}" data-op="${r.operator}" data-val="${r.value}">
                        <span>Die ${parseInt(r.dieIndex) + 1} ${r.operator} ${r.value}</span>
                        <span class="logic-remove" onclick="this.parentElement.remove()">&times;</span>
                    </div>`;
            });
        }

        wrapper.innerHTML = `
            <div class="logic-header">
                <span>Event Definition (AND Logic)</span>
                <span class="logic-remove" onclick="this.closest('.logic-item').remove()">Remove Group</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                <select class="die-sel" style="width:auto;">${dieOptions}</select>
                <select class="op-sel" style="width:auto;">
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                </select>
                <input type="number" class="val-input" value="1" min="1" style="width:60px;">
                <button type="button" class="secondary-btn" style="padding:0.25rem 0.5rem;" onclick="UI.addRuleToGroup(this)">+ Add Rule</button>
            </div>
            <div class="rule-group">${rulesHtml}</div>
        `;
        this.elements.logicList.appendChild(wrapper);
    },

    addRuleToGroup(btn) {
        const parent = btn.parentElement;
        const dieIdx = parent.querySelector('.die-sel').value;
        const op = parent.querySelector('.op-sel').value;
        const val = parent.querySelector('.val-input').value;
        const group = parent.nextElementSibling;

        const div = document.createElement('div');
        div.className = 'rule-item';
        div.dataset.die = dieIdx;
        div.dataset.op = op;
        div.dataset.val = val;
        div.innerHTML = `<span>Die ${parseInt(dieIdx) + 1} ${op} ${val}</span> <span class="logic-remove" onclick="this.parentElement.remove()">&times;</span>`;
        group.appendChild(div);
    },

    saveModal(game) {
        const items = this.elements.logicList.querySelectorAll('.logic-item');
        const newDefs = [];

        items.forEach(item => {
            const rules = [];
            item.querySelectorAll('.rule-item').forEach(r => {
                rules.push({
                    dieIndex: parseInt(r.dataset.die),
                    operator: r.dataset.op,
                    value: parseInt(r.dataset.val)
                });
            });
            if (rules.length > 0) newDefs.push({ rules });
        });

        game.updateSetting('eventDefinitions', newDefs);
        this.closeModal();
        Logger.log(`Saved ${newDefs.length} event definitions.`);
    }
};

// --- Game Class ---
class Game {
    constructor() {
        this.settings = {
            diceCount: 2,
            diceSides: 6,
            interval: 1000,
            duration: 60,
            resetDuration: 2000,
            volume: 10,
            eventDefinitions: []
        };

        this.state = {
            isPlaying: false,
            isResetting: false,
            diceValues: [],
            timeLeft: 0
        };

        this.intervals = {
            gameLoop: null,
            timer: null,
            reset: null
        };

        this.init();
    }

    init() {
        this.reloadDefaults();

        UI.init();

        // Populate inputs
        if (UI.elements.inputs.diceCount) UI.elements.inputs.diceCount.value = this.settings.diceCount;
        if (UI.elements.inputs.diceSides) UI.elements.inputs.diceSides.value = this.settings.diceSides;
        if (UI.elements.inputs.interval) UI.elements.inputs.interval.value = this.settings.interval / 1000;
        if (UI.elements.inputs.duration) UI.elements.inputs.duration.value = this.settings.duration;
        if (UI.elements.inputs.resetDuration) UI.elements.inputs.resetDuration.value = this.settings.resetDuration / 1000;
        if (UI.elements.inputs.volume) UI.elements.inputs.volume.value = this.settings.volume;

        UI.renderDice(this.settings.diceCount, []);
        UI.bindEvents(this);
        Logger.log('RED 2.0 Initialized.');
    }

    reloadDefaults() {
        this.settings.eventDefinitions = [];
        if (this.settings.diceCount >= 2) {
            for (let i = 1; i <= 6; i++) {
                this.settings.eventDefinitions.push({
                    rules: [
                        { dieIndex: 0, operator: '==', value: i },
                        { dieIndex: 1, operator: '==', value: i }
                    ]
                });
            }
        } else if (this.settings.diceCount === 1) {
            this.settings.eventDefinitions.push({
                rules: [{ dieIndex: 0, operator: '==', value: 1 }]
            });
        }
    }

    start() {
        if (this.state.isPlaying) return;

        this.state.isPlaying = true;
        this.state.timeLeft = this.settings.duration * 60;
        this.state.isResetting = false;

        UI.updateControls(true);
        UI.updateTimer(this.state.timeLeft);

        Logger.log(`Game Started. Dice: ${this.settings.diceCount}, Side: ${this.settings.diceSides}, Vol: ${this.settings.volume}%`);

        this.intervals.timer = setInterval(() => {
            if (this.state.timeLeft > 0) {
                this.state.timeLeft--;
                UI.updateTimer(this.state.timeLeft);
            } else {
                this.stop();
            }
        }, 1000);

        this.roll();
        this.intervals.gameLoop = setInterval(() => {
            if (!this.state.isResetting) {
                this.roll();
            }
        }, this.settings.interval);
    }

    stop() {
        this.state.isPlaying = false;
        clearInterval(this.intervals.timer);
        clearInterval(this.intervals.gameLoop);
        clearTimeout(this.intervals.reset);

        UI.updateControls(false);
        UI.showAlert(false);
        Logger.log('Game Stopped.');
    }

    updateSetting(key, value) {
        if (key === 'diceCount') {
            if (value < 1) value = 1;
            if (value > 10) value = 10;
        }

        this.settings[key] = value;
        Logger.log(`Set ${key} = ${value}`);

        if (key === 'diceCount') {
            UI.renderDice(value, []);
        }
    }

    roll() {
        UI.animateRoll();
        const vals = [];
        for (let i = 0; i < this.settings.diceCount; i++) {
            vals.push(Math.floor(Math.random() * this.settings.diceSides) + 1);
        }
        this.state.diceValues = vals;

        setTimeout(() => {
            this.checkEvents(vals);
        }, 300);
    }

    checkEvents(values) {
        let matchFound = false;
        let matchedIndices = new Set();

        for (const def of this.settings.eventDefinitions) {
            const allRulesMet = def.rules.every(r => {
                if (r.dieIndex >= values.length) return false;
                const val = values[r.dieIndex];
                switch (r.operator) {
                    case '==': return val == r.value;
                    case '!=': return val != r.value;
                    case '>': return val > r.value;
                    case '<': return val < r.value;
                    default: return false;
                }
            });

            if (allRulesMet && def.rules.length > 0) {
                matchFound = true;
                def.rules.forEach(r => matchedIndices.add(r.dieIndex));
            }
        }

        UI.renderDice(this.settings.diceCount, values, Array.from(matchedIndices));
        if (matchFound) {
            this.triggerAlert();
            Logger.log(`EVENT! Rolled: [${values.join(', ')}]`);
        } else {
            UI.showAlert(false);
            Logger.log(`Rolled: [${values.join(', ')}]`);
        }
    }

    triggerAlert() {
        this.state.isResetting = true;
        UI.showAlert(true, "EVENT MATCHED!");
        this.beep();

        clearTimeout(this.intervals.reset);
        this.intervals.reset = setTimeout(() => {
            this.state.isResetting = false;
            UI.showAlert(false);
        }, this.settings.resetDuration);
    }

    beep() {
        if (this.settings.volume <= 0) return;

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;

            // Map 0-100 to 0.0-0.5 (max gain shouldn't blast ears)
            const vol = (this.settings.volume / 100) * 0.5;

            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // Ignore if blocked
        }
    }
}

// --- Init ---
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
    // Expose UI helper for HTML
    window.UI = UI;
});

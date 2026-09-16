/**
 * Wire & Connector Interactive Management Engine - Dual-End Cable System
 * Supports End A (Master) and End B (Remote) assembly, crimping, and dynamic wiremap
 */
class WireManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = Object.assign({
            onSlotChange: null,
            cablePreset: 'straight_b',
            showHints: true
        }, options);

        this.cablePreset = this.options.cablePreset;
        this.activeEnd = 'A'; // 'A' or 'B'
        this.selectedWire = null;
        this.currentTab = 'crimp'; // 'crimp' or 'wiremap'

        // Initialize End A and End B states
        this.ends = {
            A: {
                label: 'Конектор А (Master)',
                slots: [null, null, null, null, null, null, null, null],
                availableWires: [...THEORY_DATA.wireColors],
                isCrimped: false,
                targetStandard: 't568b'
            },
            B: {
                label: 'Конектор Б (Remote)',
                slots: [null, null, null, null, null, null, null, null],
                availableWires: [...THEORY_DATA.wireColors],
                isCrimped: false,
                targetStandard: 't568b'
            }
        };

        this.applyPreset(this.cablePreset, false);
        this.bindEvents();
        this.shuffleWires('A', false);
        this.shuffleWires('B', false);
    }

    bindEvents() {
        if (!this.container) return;

        // Click delegation
        this.container.addEventListener('click', (e) => {
            // View Switcher (Crimp Workbench vs Wiremap Diagram)
            const viewBtn = e.target.closest('[data-view-tab]');
            if (viewBtn) {
                this.currentTab = viewBtn.dataset.viewTab;
                this.render();
                return;
            }

            // Connector End Switcher (End A vs End B)
            const endBtn = e.target.closest('[data-end-switch]');
            if (endBtn) {
                const targetEnd = endBtn.dataset.endSwitch;
                this.setActiveEnd(targetEnd);
                return;
            }

            // Slot click
            const slotEl = e.target.closest('.slot-channel');
            if (slotEl) {
                const idx = parseInt(slotEl.dataset.slot, 10);
                this.handleSlotClick(idx);
                return;
            }

            // Wire token click in tray
            const tokenEl = e.target.closest('.wire-token');
            if (tokenEl) {
                const wireId = tokenEl.dataset.wireId;
                this.handleWireTokenClick(wireId);
                return;
            }
        });

        // HTML5 Drag and Drop support
        this.container.addEventListener('dragstart', (e) => {
            const currentEndObj = this.ends[this.activeEnd];
            const tokenEl = e.target.closest('.wire-token');
            if (tokenEl && !currentEndObj.isCrimped) {
                e.dataTransfer.setData('text/plain', tokenEl.dataset.wireId);
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        this.container.addEventListener('dragover', (e) => {
            const currentEndObj = this.ends[this.activeEnd];
            const slotEl = e.target.closest('.slot-channel');
            if (slotEl && !currentEndObj.isCrimped) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });

        this.container.addEventListener('dragenter', (e) => {
            const currentEndObj = this.ends[this.activeEnd];
            const slotEl = e.target.closest('.slot-channel');
            if (slotEl && !currentEndObj.isCrimped) {
                slotEl.classList.add('drag-over');
            }
        });

        this.container.addEventListener('dragleave', (e) => {
            const slotEl = e.target.closest('.slot-channel');
            if (slotEl) {
                slotEl.classList.remove('drag-over');
            }
        });

        this.container.addEventListener('drop', (e) => {
            const currentEndObj = this.ends[this.activeEnd];
            const slotEl = e.target.closest('.slot-channel');
            if (slotEl && !currentEndObj.isCrimped) {
                e.preventDefault();
                slotEl.classList.remove('drag-over');
                const wireId = e.dataTransfer.getData('text/plain');
                if (wireId) {
                    const idx = parseInt(slotEl.dataset.slot, 10);
                    this.placeWireInSlot(wireId, idx);
                }
            }
        });
    }

    applyPreset(presetId, triggerCallback = true) {
        this.cablePreset = presetId;
        const preset = THEORY_DATA.cablePresets[presetId] || THEORY_DATA.cablePresets.straight_b;

        this.ends.A.targetStandard = preset.endA || 't568b';
        this.ends.B.targetStandard = preset.endB || 't568b';

        // Reset crimp status when changing preset
        this.ends.A.isCrimped = false;
        this.ends.B.isCrimped = false;

        this.shuffleWires('A', false);
        this.shuffleWires('B', false);
        this.render();

        if (triggerCallback && this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    setActiveEnd(end) {
        if (end !== 'A' && end !== 'B') return;
        this.activeEnd = end;
        this.selectedWire = null;
        if (window.sounds) window.sounds.playClick();
        this.render();
        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    showToast(message, type = 'info') {
        let toastEl = document.getElementById('simToast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'simToast';
            toastEl.className = 'sim-toast';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = message;
        toastEl.className = `sim-toast show ${type}`;
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toastEl.className = 'sim-toast';
        }, 3000);
    }

    shuffleWires(end = this.activeEnd, triggerCallback = true) {
        const targetObj = this.ends[end];
        if (targetObj.isCrimped) {
            if (triggerCallback) {
                if (window.sounds) window.sounds.playError();
                this.showToast(`⚠️ Конектор ${end} уже обтиснуто! Спочатку зріжте його бокорізами для нового монтажу.`, 'warning');
            }
            return;
        }

        targetObj.slots = [null, null, null, null, null, null, null, null];
        const wires = [...THEORY_DATA.wireColors];
        for (let i = wires.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wires[i], wires[j]] = [wires[j], wires[i]];
        }
        targetObj.availableWires = wires;
        this.selectedWire = null;
        this.render();

        if (triggerCallback) {
            if (window.sounds) window.sounds.playSnip();
            if (this.options.onSlotChange) {
                this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
            }
        }
    }

    clearSlots(end = this.activeEnd) {
        const targetObj = this.ends[end];
        if (targetObj.isCrimped) {
            this.cutAndResetConnector(end);
            return;
        }

        targetObj.slots.forEach(wire => {
            if (wire) targetObj.availableWires.push(wire);
        });
        targetObj.slots = [null, null, null, null, null, null, null, null];
        this.selectedWire = null;
        this.render();
        if (window.sounds) window.sounds.playClick();
        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    cutAndResetConnector(end = this.activeEnd) {
        const targetObj = this.ends[end];
        targetObj.isCrimped = false;
        targetObj.slots.forEach(wire => {
            if (wire) targetObj.availableWires.push(wire);
        });
        targetObj.slots = [null, null, null, null, null, null, null, null];
        this.selectedWire = null;
        if (window.sounds) window.sounds.playSnip();
        this.render();
        this.showToast(`✂️ Конектор ${end} зрізано бокорізами! Взято новий роз'єм RJ-45, жилки повернуто в касету.`, 'success');
        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    autoFillActiveEnd() {
        const targetObj = this.ends[this.activeEnd];
        if (targetObj.isCrimped) {
            if (window.sounds) window.sounds.playError();
            this.showToast(`⚠️ Конектор ${this.activeEnd} вже затиснутий ножами. Щоб переробити, спочатку зріжте його.`, 'warning');
            return;
        }

        targetObj.slots = [null, null, null, null, null, null, null, null];
        targetObj.availableWires = [];
        const stdPins = THEORY_DATA.standards[targetObj.targetStandard].pins;
        stdPins.forEach((pin, idx) => {
            const wireObj = THEORY_DATA.wireColors.find(w => w.id === pin.colorId);
            targetObj.slots[idx] = wireObj;
        });
        this.selectedWire = null;
        this.render();
        if (window.sounds) window.sounds.playWireSnap();
        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    autoFillBothEnds() {
        ['A', 'B'].forEach(end => {
            const targetObj = this.ends[end];
            targetObj.slots = [null, null, null, null, null, null, null, null];
            targetObj.availableWires = [];
            const stdPins = THEORY_DATA.standards[targetObj.targetStandard].pins;
            stdPins.forEach((pin, idx) => {
                const wireObj = THEORY_DATA.wireColors.find(w => w.id === pin.colorId);
                targetObj.slots[idx] = wireObj;
            });
        });
        this.selectedWire = null;
        this.render();
        if (window.sounds) window.sounds.playWireSnap();
        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    handleWireTokenClick(wireId) {
        const currentEndObj = this.ends[this.activeEnd];
        if (currentEndObj.isCrimped) {
            if (window.sounds) window.sounds.playError();
            this.showToast(`⚠️ Конектор ${this.activeEnd} уже затиснутий ножами. Щоб переробити, зріжте його бокорізами.`, 'warning');
            return;
        }

        if (this.selectedWire && this.selectedWire.id === wireId) {
            this.selectedWire = null;
        } else {
            this.selectedWire = currentEndObj.availableWires.find(w => w.id === wireId);
            if (window.sounds) window.sounds.playClick();
        }
        this.render();
    }

    handleSlotClick(slotIndex) {
        const currentEndObj = this.ends[this.activeEnd];
        if (currentEndObj.isCrimped) {
            if (window.sounds) window.sounds.playError();
            this.showToast(`⚠️ Конектор ${this.activeEnd} уже обтиснуто! Жилки надійно зафіксовані ножами. Щоб переробити, натисніть «✂️ Зрізати конектор».`, 'warning');
            return;
        }

        if (!this.selectedWire) {
            // Clicked occupied slot without selected wire -> return wire to tray
            if (currentEndObj.slots[slotIndex]) {
                currentEndObj.availableWires.push(currentEndObj.slots[slotIndex]);
                currentEndObj.slots[slotIndex] = null;
                if (window.sounds) window.sounds.playClick();
                this.render();
                if (this.options.onSlotChange) {
                    this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
                }
            }
            return;
        }

        this.placeWireInSlot(this.selectedWire.id, slotIndex);
    }

    placeWireInSlot(wireId, slotIndex) {
        const currentEndObj = this.ends[this.activeEnd];
        if (currentEndObj.isCrimped) return;

        const wireToPlace = currentEndObj.availableWires.find(w => w.id === wireId);
        if (!wireToPlace) return;

        currentEndObj.availableWires = currentEndObj.availableWires.filter(w => w.id !== wireToPlace.id);

        if (currentEndObj.slots[slotIndex]) {
            currentEndObj.availableWires.push(currentEndObj.slots[slotIndex]);
        }

        currentEndObj.slots[slotIndex] = wireToPlace;
        this.selectedWire = null;
        if (window.sounds) window.sounds.playWireSnap();
        this.render();

        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    crimpActiveEnd() {
        const currentEndObj = this.ends[this.activeEnd];
        currentEndObj.isCrimped = true;
        if (window.sounds) window.sounds.playCrimp();
        this.render();
        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    crimpBothEnds() {
        this.ends.A.isCrimped = true;
        this.ends.B.isCrimped = true;
        if (window.sounds) window.sounds.playCrimp();
        this.render();
        if (this.options.onSlotChange) {
            this.options.onSlotChange(this.getSlotWireIds('A'), this.getSlotWireIds('B'));
        }
    }

    resetCrimp() {
        this.ends.A.isCrimped = false;
        this.ends.B.isCrimped = false;
        this.render();
    }

    getSlotWireIds(end = this.activeEnd) {
        return this.ends[end].slots.map(w => w ? w.id : null);
    }

    isCurrentEndComplete() {
        return this.ends[this.activeEnd].slots.every(w => w !== null);
    }

    isBothEndsComplete() {
        return this.ends.A.slots.every(w => w !== null) && this.ends.B.slots.every(w => w !== null);
    }

    isReadyForTesting() {
        return this.ends.A.isCrimped && this.ends.B.isCrimped;
    }

    render() {
        if (!this.container) return;

        if (this.currentTab === 'wiremap') {
            this.container.innerHTML = this.renderWiremapView();
            return;
        }

        const currentEndObj = this.ends[this.activeEnd];
        const std = THEORY_DATA.standards[currentEndObj.targetStandard] || THEORY_DATA.standards.t568b;

        // 1. Build Gold Blades
        let goldPinsHtml = '';
        for (let i = 0; i < 8; i++) {
            const hasWire = currentEndObj.slots[i] !== null;
            const isConn = hasWire ? 'connected' : '';
            const isPressed = currentEndObj.isCrimped ? 'pressed' : '';
            goldPinsHtml += `
                <div class="gold-pin ${isConn} ${isPressed}" title="Контакт ${i+1}">
                    <span class="pin-blade"></span>
                    <span class="pin-num">${i+1}</span>
                </div>
            `;
        }

        // 2. Build 8 Slots
        let slotsHtml = '';
        for (let i = 0; i < 8; i++) {
            const wire = currentEndObj.slots[i];
            const expected = std.pins[i];
            const isCorrect = wire && wire.id === expected.colorId;
            const occClass = wire ? 'occupied' : 'empty';
            const dropClass = this.selectedWire ? 'droppable' : '';

            let hintBar = '';
            if (this.options.showHints && !wire) {
                hintBar = `<div class="slot-hint-bar hint-${expected.colorId}" title="Очікується пін ${i+1}: ${expected.name}"></div>`;
            }

            let wireHtml = '';
            if (wire) {
                const badge = isCorrect ? '<span class="status-badge valid">✓</span>' : (this.options.showHints ? '<span class="status-badge invalid">✗</span>' : '');
                wireHtml = `
                    <div class="inserted-wire wire-${wire.id}">
                        <div class="wire-copper-tip"></div>
                        <div class="wire-stem"></div>
                        <span class="wire-label">${i+1}</span>
                        ${badge}
                    </div>
                `;
            } else {
                wireHtml = `<div class="empty-guide"><span class="pin-guide-num">${i+1}</span></div>`;
            }

            slotsHtml += `
                <div class="slot-channel ${occClass} ${dropClass}" data-slot="${i}">
                    ${hintBar}
                    ${wireHtml}
                </div>
            `;
        }

        // 3. Build Available Wire Tray
        let trayHtml = '';
        currentEndObj.availableWires.forEach(wire => {
            const isSel = this.selectedWire && this.selectedWire.id === wire.id;
            const selClass = isSel ? 'selected' : '';
            trayHtml += `
                <div class="wire-token wire-${wire.id} ${selClass}" data-wire-id="${wire.id}" draggable="true" title="${wire.name} (перетягніть або клікніть)">
                    <div class="token-copper"></div>
                    <div class="token-strand"></div>
                    <span class="token-title">${wire.name}</span>
                </div>
            `;
        });

        let emptyMsg = '';
        if (currentEndObj.availableWires.length === 0) {
            emptyMsg = `
                <div class="tray-complete-banner">
                    <span class="badge-done">✓ ВСІ 8 ЖИЛ ЗМОНТОВАНО У КОНЕКТОР ${this.activeEnd}</span>
                    <span class="banner-sub">Натисніть «🔨 ОБТИСНУТИ КОНЕКТОР ${this.activeEnd}», або перемкніться на інший кінець!</span>
                </div>
            `;
        }

        // Status badges for End A and End B
        const aCount = this.ends.A.slots.filter(w => w !== null).length;
        const bCount = this.ends.B.slots.filter(w => w !== null).length;
        const aStatus = this.ends.A.isCrimped ? '🔒 Обтиснуто' : `${aCount}/8`;
        const bStatus = this.ends.B.isCrimped ? '🔒 Обтиснуто' : `${bCount}/8`;

        this.container.innerHTML = `
            <div class="workbench-viewport">
                <!-- VIEW TABS (Crimp vs Wiremap) & END SWITCHER -->
                <div class="dual-end-navbar">
                    <div class="end-selector-group">
                        <button class="btn-end-tab ${this.activeEnd === 'A' ? 'active' : ''}" data-end-switch="A">
                            🔌 Кінець А: <span class="end-badge ${this.ends.A.isCrimped ? 'crimped' : ''}">${aStatus}</span>
                        </button>
                        <button class="btn-end-tab ${this.activeEnd === 'B' ? 'active' : ''}" data-end-switch="B">
                            🔌 Кінець Б: <span class="end-badge ${this.ends.B.isCrimped ? 'crimped' : ''}">${bStatus}</span>
                        </button>
                    </div>

                    <div class="mode-view-toggle">
                        <button class="btn-mode-tab active" data-view-tab="crimp">🛠️ Монтаж</button>
                        <button class="btn-mode-tab" data-view-tab="wiremap">🔀 Схема Wiremap</button>
                    </div>
                </div>

                <!-- CONNECTOR INFO BANNER -->
                <div class="connector-identity-banner">
                    <div class="conn-id-item conn-id-title" title="Активний роз'єм кабелю">
                        <span class="conn-id-icon">🔌</span>
                        <span class="conn-id-text"><strong>${currentEndObj.label}</strong></span>
                    </div>
                    <div class="conn-id-item conn-id-std" title="Цільовий стандарт монтажу">
                        <span class="conn-id-icon">🎯</span>
                        <span class="conn-id-text"><strong>${std.name}</strong></span>
                    </div>
                    <div class="conn-id-item conn-id-status ${currentEndObj.isCrimped ? 'crimp-yes' : 'crimp-no'}">
                        <span class="conn-id-icon">${currentEndObj.isCrimped ? '✓' : '⏳'}</span>
                        <span class="conn-id-text"><strong>${currentEndObj.isCrimped ? 'Зафіксовано ножами' : 'Очікує обтискання'}</strong></span>
                    </div>
                </div>

                <!-- RJ-45 CONNECTOR HOUSING -->
                <div class="rj45-chassis ${currentEndObj.isCrimped ? 'crimped' : ''}">
                    <!-- Top Gold Contacts Block -->
                    <div class="gold-contacts-block">
                        ${goldPinsHtml}
                    </div>

                    <!-- Transparent Polycarbonate Plug Body -->
                    <div class="polycarbonate-shell">
                        <div class="plug-latch-arm">
                            <span class="latch-title">RJ-45 (8P8C) Modular Plug — Кінець ${this.activeEnd}</span>
                        </div>

                        <div class="channels-grid">
                            ${slotsHtml}
                        </div>

                        <div class="strain-relief-wedge ${currentEndObj.isCrimped ? 'engaged' : ''}">
                            <span class="wedge-text">ПРИТИСКНИЙ КЛИН ОБОЛОНКИ КАБЕЛЮ (КІНЕЦЬ ${this.activeEnd})</span>
                        </div>
                    </div>
                </div>

                <!-- CABLE JACKET ENTRY -->
                <div class="cable-entry-box">
                    <div class="utp-cable-body">
                        <div class="cable-sheath-line">
                            <span class="cable-print">CAT 5e/6 UTP 4-PAIR 24AWG • END ${this.activeEnd} • ANSI/TIA-568</span>
                        </div>
                    </div>
                </div>

                <!-- TRAY FOR AVAILABLE WIRES -->
                <div class="tray-container">
                    <div class="tray-top-bar">
                        <span class="tray-heading">Провідники для ${currentEndObj.label} (клікніть або перетягніть жилку ➔ у слот):</span>
                        <span class="tray-stats">Залишилося: <strong>${currentEndObj.availableWires.length}</strong> з 8</span>
                    </div>
                    <div class="tray-wire-grid">
                        ${trayHtml}
                        ${emptyMsg}
                    </div>
                </div>
            </div>
        `;
    }

    renderWiremapView() {
        const wiresA = this.ends.A.slots;
        const wiresB = this.ends.B.slots;

        // Build Left Pin list (End A)
        let leftPinsHtml = '';
        for (let i = 0; i < 8; i++) {
            const w = wiresA[i];
            const name = w ? w.name : 'Не підключено';
            const colorClass = w ? `wire-${w.id}` : 'wire-empty';
            leftPinsHtml += `
                <div class="wiremap-pin-row" data-pin-a="${i+1}">
                    <span class="wm-pin-num">${i+1}</span>
                    <div class="wm-pin-strand ${colorClass}"></div>
                    <span class="wm-pin-name">${name}</span>
                </div>
            `;
        }

        // Build Right Pin list (End B)
        let rightPinsHtml = '';
        for (let i = 0; i < 8; i++) {
            const w = wiresB[i];
            const name = w ? w.name : 'Не підключено';
            const colorClass = w ? `wire-${w.id}` : 'wire-empty';
            rightPinsHtml += `
                <div class="wiremap-pin-row right" data-pin-b="${i+1}">
                    <span class="wm-pin-name">${name}</span>
                    <div class="wm-pin-strand ${colorClass}"></div>
                    <span class="wm-pin-num">${i+1}</span>
                </div>
            `;
        }

        // Build SVG Curved Paths
        let svgPaths = '';
        const yStart = 26;
        const yStep = 44;

        for (let i = 0; i < 8; i++) {
            const wireA = wiresA[i];
            const y1 = yStart + i * yStep;

            if (wireA) {
                // Find where wireA connects on End B
                const bIdx = wiresB.findIndex(wb => wb && wb.id === wireA.id);
                if (bIdx !== -1) {
                    const y2 = yStart + bIdx * yStep;
                    const strokeColor = wireA.color || '#38bdf8';
                    const isDash = wireA.isStripe;
                    const isCrossed = (i !== bIdx);
                    const crossClass = isCrossed ? 'cross-trace' : 'straight-trace';

                    // Smooth Bezier curve connecting left x=0 to right x=280
                    svgPaths += `
                        <path d="M 0 ${y1} C 120 ${y1}, 160 ${y2}, 280 ${y2}" 
                              stroke="${strokeColor}" 
                              stroke-width="${isCrossed ? '4' : '3.5'}" 
                              stroke-dasharray="${isDash ? '7, 4' : 'none'}" 
                              fill="none" 
                              class="cable-trace-line ${crossClass}" 
                              data-trace="${i+1}-${bIdx+1}">
                            <title>Пін A ${i+1} (${wireA.name}) ➔ Пін B ${bIdx+1}</title>
                        </path>
                    `;
                }
            }
        }

        const aStatus = this.ends.A.isCrimped ? '🔒 Обтиснуто' : `${wiresA.filter(w=>w).length}/8`;
        const bStatus = this.ends.B.isCrimped ? '🔒 Обтиснуто' : `${wiresB.filter(w=>w).length}/8`;

        return `
            <div class="workbench-viewport">
                <!-- Dual End Header -->
                <div class="dual-end-navbar">
                    <div class="end-selector-group">
                        <button class="btn-end-tab" data-end-switch="A">
                            🔌 Кінець А: <span class="end-badge ${this.ends.A.isCrimped ? 'crimped' : ''}">${aStatus}</span>
                        </button>
                        <button class="btn-end-tab" data-end-switch="B">
                            🔌 Кінець Б: <span class="end-badge ${this.ends.B.isCrimped ? 'crimped' : ''}">${bStatus}</span>
                        </button>
                    </div>

                    <div class="mode-view-toggle">
                        <button class="btn-mode-tab" data-view-tab="crimp">🛠️ Монтаж</button>
                        <button class="btn-mode-tab active" data-view-tab="wiremap">🔀 Схема Wiremap</button>
                    </div>
                </div>

                <!-- Wiremap Interactive Board -->
                <div class="wiremap-board-container">
                    <div class="wiremap-header">
                        <h4>🔀 Інтерактивна схема трасування витої пари (Master ↔ Remote)</h4>
                        <p>Наочне відображення проходження сигналів між Кінцем А (ліворуч) та Кінцем Б (праворуч)</p>
                    </div>

                    <div class="wiremap-stage">
                        <!-- Left Connector A -->
                        <div class="wiremap-column col-left">
                            <div class="wm-col-title">Конектор А (Master)</div>
                            <div class="wm-pins-list">
                                ${leftPinsHtml}
                            </div>
                        </div>

                        <!-- Center SVG Wiring Canvas -->
                        <div class="wiremap-canvas-wrapper">
                            <svg viewBox="0 0 280 370" class="wiremap-svg">
                                <!-- Background channel grid -->
                                ${[0,1,2,3,4,5,6,7].map(k => `<line x1="0" y1="${yStart + k*yStep}" x2="280" y2="${yStart + k*yStep}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3" />`).join('')}
                                ${svgPaths}
                            </svg>
                        </div>

                        <!-- Right Connector B -->
                        <div class="wiremap-column col-right">
                            <div class="wm-col-title">Конектор Б (Remote)</div>
                            <div class="wm-pins-list">
                                ${rightPinsHtml}
                            </div>
                        </div>
                    </div>

                    <div class="wiremap-footer-notes">
                        <div class="note-pill">
                            <span class="legend-dot straight"></span> <strong>Пряма лінія:</strong> 1-1, 2-2 ... (Прямий кабель для зв'язку ПК ↔ Світч)
                        </div>
                        <div class="note-pill">
                            <span class="legend-dot crossed"></span> <strong>Перехресна лінія:</strong> 1-3, 2-6 (Кросовер для з'єднання ПК ↔ ПК без світча)
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.WireManager = WireManager;

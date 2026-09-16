/**
 * Application Controller - RJ-45 Crimp Lab Pro v3.0 DUAL-END
 */
let workbench = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Workbench with Dual-End support
    workbench = new WireManager('workbenchContainer', {
        cablePreset: 'straight_b',
        showHints: true,
        onSlotChange: (wiresA, wiresB) => {
            updateWorkbenchStatus(wiresA, wiresB);
        }
    });
    window.workbench = workbench;

    // Trigger initial UI status update
    updateWorkbenchStatus(workbench.getSlotWireIds('A'), workbench.getSlotWireIds('B'));

    // 2. Load stored student metadata
    const storedName = localStorage.getItem('crimp_student_name') || '';
    const storedGroup = localStorage.getItem('crimp_student_group') || '1КСМ24';
    const studentNameInput = document.getElementById('studentName');
    const studentGroupInput = document.getElementById('studentGroup');

    if (studentNameInput) {
        studentNameInput.value = storedName;
        studentNameInput.addEventListener('input', (e) => {
            localStorage.setItem('crimp_student_name', e.target.value);
        });
    }

    if (studentGroupInput) {
        studentGroupInput.value = storedGroup;
        studentGroupInput.addEventListener('input', (e) => {
            localStorage.setItem('crimp_student_group', e.target.value);
        });
    }

    // 3. Cable Preset Switcher (Straight T568B, Straight T568A, Crossover B-A, Crossover A-B, Custom)
    document.querySelectorAll('#presetTabs [data-preset]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#presetTabs [data-preset]').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const presetId = e.currentTarget.dataset.preset;
            setCablePreset(presetId);
        });
    });

    // 4. Lab Mission Switcher
    const missionSelect = document.getElementById('missionSelect');
    if (missionSelect) {
        missionSelect.addEventListener('change', (e) => {
            const missionId = e.target.value;
            const mission = THEORY_DATA.labMissions.find(m => m.id === missionId);
            if (mission) {
                document.getElementById('missionBadge').textContent = '🎯 ' + mission.title.split(':')[0].toUpperCase();
                document.getElementById('missionDesc').textContent = mission.desc;

                // Select matching preset button
                const matchingTab = document.querySelector(`#presetTabs [data-preset="${mission.preset}"]`);
                if (matchingTab) {
                    document.querySelectorAll('#presetTabs [data-preset]').forEach(b => b.classList.remove('active'));
                    matchingTab.classList.add('active');
                }
                setCablePreset(mission.preset);
            }
        });
    }

    // 5. Workbench Action Buttons
    const btnShuffle = document.getElementById('btnShuffle');
    if (btnShuffle) {
        btnShuffle.addEventListener('click', () => {
            if (workbench) workbench.shuffleWires(workbench.activeEnd, true);
        });
    }

    const btnClear = document.getElementById('btnClear');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (workbench) workbench.clearSlots(workbench.activeEnd);
        });
    }

    const btnAutoHint = document.getElementById('btnAutoHint');
    if (btnAutoHint) {
        btnAutoHint.addEventListener('click', () => {
            if (workbench) workbench.autoFillActiveEnd();
        });
    }

    const btnAutoBoth = document.getElementById('btnAutoBoth');
    if (btnAutoBoth) {
        btnAutoBoth.addEventListener('click', () => {
            if (workbench) workbench.autoFillBothEnds();
        });
    }

    const btnCrimp = document.getElementById('btnCrimp');
    if (btnCrimp) {
        btnCrimp.addEventListener('click', () => {
            if (!workbench) return;
            const currentEndObj = workbench.ends[workbench.activeEnd];

            if (currentEndObj.isCrimped) {
                // Already crimped - cannot re-crimp without cutting
                return;
            }

            if (!workbench.isCurrentEndComplete()) {
                alert(`Будь ласка, заповніть усі 8 слотів ${currentEndObj.label} перед обтисканням!`);
                if (window.sounds) window.sounds.playError();
                return;
            }
            workbench.crimpActiveEnd();
        });
    }

    const btnRunTest = document.getElementById('btnRunTest');
    if (btnRunTest) {
        btnRunTest.addEventListener('click', () => {
            runCableTest();
        });
    }

    // 6. Sound Toggle
    const btnSoundToggle = document.getElementById('btnSoundToggle');
    if (btnSoundToggle) {
        btnSoundToggle.addEventListener('click', (e) => {
            if (window.sounds) {
                const enabled = window.sounds.toggle();
                e.currentTarget.textContent = enabled ? '🔊 Звук: УВІМК' : '🔇 Звук: ВИМК';
            }
        });
    }

    // 7. Theory Modal
    const theoryModal = document.getElementById('theoryModal');
    const btnOpenTheory = document.getElementById('btnOpenTheory');
    const btnCloseTheory = document.getElementById('btnCloseTheory');

    if (btnOpenTheory && theoryModal) {
        btnOpenTheory.addEventListener('click', () => {
            theoryModal.classList.add('open');
        });
    }
    if (btnCloseTheory && theoryModal) {
        btnCloseTheory.addEventListener('click', () => {
            theoryModal.classList.remove('open');
        });
    }

    // 8. Certificate Modal
    const certModal = document.getElementById('certModal');
    const btnOpenCert = document.getElementById('btnOpenCert');
    const btnCloseCert = document.getElementById('btnCloseCert');

    if (btnOpenCert && certModal) {
        btnOpenCert.addEventListener('click', () => {
            generateCertificate();
            certModal.classList.add('open');
        });
    }
    if (btnCloseCert && certModal) {
        btnCloseCert.addEventListener('click', () => {
            certModal.classList.remove('open');
        });
    }

    // Close modals on backdrop click
    [theoryModal, certModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (theoryModal) theoryModal.classList.remove('open');
            if (certModal) certModal.classList.remove('open');
        }
    });
});

function setCablePreset(presetId) {
    if (!workbench) return;
    workbench.applyPreset(presetId, true);

    const preset = THEORY_DATA.cablePresets[presetId] || THEORY_DATA.cablePresets.straight_b;
    const titleEl = document.getElementById('currentStandardTitle');
    const subEl = document.getElementById('currentStandardSubtitle');
    const statusEl = document.getElementById('termStatus');

    if (titleEl) titleEl.textContent = preset.name;
    if (subEl) subEl.textContent = `${preset.description} (${preset.usage})`;
    if (statusEl) statusEl.textContent = `Очікування обтискання конекторів для режиму: ${preset.shortName}`;
}

function updateWorkbenchStatus(wiresA, wiresB) {
    if (!workbench) return;

    const currentEndObj = workbench.ends[workbench.activeEnd];
    const filledCurrent = currentEndObj.slots.filter(w => w !== null).length;
    const countEl = document.getElementById('crimpCount');
    if (countEl) countEl.textContent = filledCurrent;

    const btnCrimp = document.getElementById('btnCrimp');
    const btnRunTest = document.getElementById('btnRunTest');

    // Update crimp button label & state
    // Update crimp & clear button labels & states
    const btnClear = document.getElementById('btnClear');
    if (currentEndObj.isCrimped) {
        if (btnCrimp) {
            btnCrimp.textContent = `🔒 КОНЕКТОР ${workbench.activeEnd} ОБТИСНУТО`;
            btnCrimp.title = "Мідні контакти надійно зафіксовані ножами. Для повторного монтажу скористайтесь кнопкою «✂️ Зрізати конектор».";
            btnCrimp.disabled = true;
            btnCrimp.classList.remove('pulse', 'btn-uncrimp');
        }
        if (btnClear) {
            btnClear.innerHTML = `✂️ Зрізати конектор ${workbench.activeEnd}`;
            btnClear.title = "Зрізати затиснутий роз'єм бокорізами, повернути жилки та взяти новий конектор RJ-45";
            btnClear.classList.add('btn-cut-mode');
        }
    } else {
        if (btnCrimp) {
            btnCrimp.innerHTML = `🔨 ОБТИСНУТИ КОНЕКТОР ${workbench.activeEnd} (<span id="crimpCount">${filledCurrent}</span>/8)`;
            btnCrimp.title = "Затиснути жилки ножами конектора";
            btnCrimp.disabled = false;
            btnCrimp.classList.remove('btn-uncrimp');
            if (filledCurrent === 8) {
                btnCrimp.classList.add('pulse');
            } else {
                btnCrimp.classList.remove('pulse');
            }
        }
        if (btnClear) {
            btnClear.innerHTML = `🧹 Очистити`;
            btnClear.title = "Очистити конектор та повернути жилки в касету";
            btnClear.classList.remove('btn-cut-mode');
        }
    }

    // Both ends crimped check for testing
    const bothCrimped = workbench.isReadyForTesting();
    if (btnRunTest) {
        btnRunTest.disabled = !bothCrimped;
    }

    const termStatus = document.getElementById('termStatus');
    if (termStatus && !window.cableTester.isRunning) {
        if (bothCrimped) {
            termStatus.textContent = '✓ Обидва конектори (А і Б) обтиснуто! Готово до запуску LAN-тестера.';
        } else {
            const remaining = [];
            if (!workbench.ends.A.isCrimped) remaining.push('Кінець А');
            if (!workbench.ends.B.isCrimped) remaining.push('Кінець Б');
            termStatus.textContent = `Очікує обтискання: ${remaining.join(' та ')}.`;
        }
    }
}

function runCableTest() {
    const btn = document.getElementById('btnRunTest');
    if (btn) btn.disabled = true;

    // Reset LEDs
    for (let i = 1; i <= 8; i++) {
        const m = document.getElementById('m-led-' + i);
        const r = document.getElementById('r-led-' + i);
        if (m) m.className = 'led-diode';
        if (r) r.className = 'led-diode';
    }

    const wiresA = workbench.getSlotWireIds('A');
    const wiresB = workbench.getSlotWireIds('B');
    const diag = window.cableTester.configure(wiresA, wiresB, workbench.cablePreset);

    const termStatus = document.getElementById('termStatus');
    const termSpeed = document.getElementById('termSpeed');
    const termFeed = document.getElementById('termFeed');

    if (termStatus) termStatus.textContent = '⚡ Сканування ліній 1..8 (подача імпульсів Master ➔ Remote)...';
    if (termSpeed) termSpeed.textContent = 'Швидкість: Тестування каналу...';

    window.cableTester.start((stepData) => {
        if (window.sounds) window.sounds.playLedTick(450 + stepData.masterPin * 50);

        // Turn off all diodes for scan animation
        for (let i = 1; i <= 8; i++) {
            const m = document.getElementById('m-led-' + i);
            const r = document.getElementById('r-led-' + i);
            if (m) m.className = 'led-diode';
            if (r) r.className = 'led-diode';
        }

        // Master LED (always green for sending line)
        const mEl = document.getElementById('m-led-' + stepData.masterPin);
        if (mEl) mEl.className = 'led-diode glow-green';

        // Remote LED
        if (stepData.remotePin) {
            const rEl = document.getElementById('r-led-' + stepData.remotePin);
            if (rEl) {
                rEl.className = stepData.isMatch ? 'led-diode glow-green' : 'led-diode glow-red';
            }
        }
    }, (finalResult) => {
        if (btn) btn.disabled = false;

        // Light all mapped pins to display completed state
        finalResult.mapping.forEach(m => {
            const mEl = document.getElementById('m-led-' + m.masterPin);
            if (mEl) mEl.className = 'led-diode glow-green';

            if (m.remotePin) {
                const rEl = document.getElementById('r-led-' + m.remotePin);
                if (rEl) rEl.className = m.isMatch ? 'led-diode glow-green' : 'led-diode glow-red';
            }
        });

        if (finalResult.status === 'pass') {
            if (window.sounds) window.sounds.playSuccess();
        } else {
            if (window.sounds) window.sounds.playError();
        }

        if (termStatus) termStatus.textContent = finalResult.title;
        if (termSpeed) termSpeed.textContent = 'Швидкість: ' + finalResult.speedTier;
        if (termFeed) termFeed.innerHTML = finalResult.details.map(d => '• ' + d).join('<br>');

        // Auto open certificate if test passed
        if (finalResult.status === 'pass') {
            setTimeout(() => {
                generateCertificate(finalResult);
                const certModal = document.getElementById('certModal');
                if (certModal) certModal.classList.add('open');
            }, 800);
        }
    });
}

function generateCertificate(result = null) {
    const studentInput = document.getElementById('studentName');
    const groupInput = document.getElementById('studentGroup');
    const name = (studentInput && studentInput.value.trim()) || 'Студент (не вказано)';
    const group = (groupInput && groupInput.value.trim()) || '1КСМ24';

    const preset = THEORY_DATA.cablePresets[workbench.cablePreset] || THEORY_DATA.cablePresets.straight_b;
    const cableTypeName = result ? result.cableType : preset.name;

    const now = new Date();
    const timeStr = now.toLocaleDateString('uk-UA') + ' ' + now.toLocaleTimeString('uk-UA');
    const randHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const randHash = `SHA-RJ45-${preset.category.toUpperCase()}-${randHex}`;

    const certStudent = document.getElementById('certStudent');
    const certGroup = document.getElementById('certGroup');
    const certStandard = document.getElementById('certStandard');
    const certTime = document.getElementById('certTime');
    const certHash = document.getElementById('certHash');
    const certSpeed = document.getElementById('certSpeed');
    const certSealText = document.getElementById('certSealText');

    if (certStudent) certStudent.textContent = name;
    if (certGroup) certGroup.textContent = group;
    if (certStandard) certStandard.textContent = cableTypeName;
    if (certTime) certTime.textContent = timeStr;
    if (certHash) certHash.textContent = randHash;
    if (certSpeed) certSpeed.textContent = result ? result.speedTier : '1000 Mbps Gigabit Full Duplex';

    if (certSealText) {
        if (result && result.isCrossover) {
            certSealText.textContent = '✓ ПЕРЕХРЕСНИЙ КРОСОВЕР ЛІНК ВЕРИФІКОВАНО (PC-to-PC DIRECT)';
        } else {
            certSealText.textContent = '✓ ПРЯМИЙ ПАТЧ-КОРД ВЕРИФІКОВАНО (PC-to-SWITCH LINK)';
        }
    }
}

// URL Capture Mode Helper for Documentation Screenshots
const urlParams = new URLSearchParams(window.location.search);
const shotMode = urlParams.get('shot');
if (shotMode) {
    setTimeout(() => {
        const studentInput = document.getElementById('studentName');
        const groupInput = document.getElementById('studentGroup');
        if (studentInput) studentInput.value = 'Іваненко О.В.';
        if (groupInput) groupInput.value = '1КСМ24';

        if (shotMode === 'theory') {
            const btn = document.getElementById('btnOpenTheory');
            if (btn) btn.click();
        } else if (shotMode === 'task1') {
            const mSel = document.getElementById('missionSelect');
            if (mSel) { mSel.value = 'm1'; mSel.dispatchEvent(new Event('change')); }
            workbench.applyPreset('straight_b', true);
            workbench.autoFillBothEnds();
            workbench.ends.A.isCrimped = true;
            workbench.ends.B.isCrimped = true;
            workbench.render();
            updateWorkbenchStatus(workbench.getSlotWireIds('A'), workbench.getSlotWireIds('B'));

            for (let i = 1; i <= 8; i++) {
                const m = document.getElementById('m-led-' + i);
                const r = document.getElementById('r-led-' + i);
                if (m) m.className = 'led-diode glow-green';
                if (r) r.className = 'led-diode glow-green';
            }
            const termStatus = document.getElementById('termStatus');
            const termSpeed = document.getElementById('termSpeed');
            const termFeed = document.getElementById('termFeed');
            if (termStatus) termStatus.textContent = '✓ ПАС (ЦІЛІСНІСТЬ ПІДТВЕРДЖЕНО)';
            if (termSpeed) termSpeed.textContent = 'Швидкість: 1000 Mbps Gigabit (Full Duplex)';
            if (termFeed) termFeed.innerHTML = '• Усі 8 ліній цілісні та спарені бездоганно.<br>• Підтримка 1000BASE-T Gigabit Ethernet.';
        } else if (shotMode === 'cert') {
            workbench.applyPreset('straight_b', true);
            workbench.autoFillBothEnds();
            workbench.ends.A.isCrimped = true;
            workbench.ends.B.isCrimped = true;
            generateCertificate({
                cableType: 'Прямий патч-корд T568B ↔ T568B (Straight-Through)',
                speedTier: '1000 Mbps Gigabit (Full Duplex)',
                isCrossover: false
            });
            const certModal = document.getElementById('certModal');
            if (certModal) certModal.classList.add('open');
        } else if (shotMode === 'wiremap') {
            const mSel = document.getElementById('missionSelect');
            if (mSel) { mSel.value = 'm3'; mSel.dispatchEvent(new Event('change')); }
            workbench.applyPreset('crossover_ba', true);
            workbench.autoFillBothEnds();
            workbench.ends.A.isCrimped = true;
            workbench.ends.B.isCrimped = true;
            workbench.currentTab = 'wiremap';
            workbench.render();
            updateWorkbenchStatus(workbench.getSlotWireIds('A'), workbench.getSlotWireIds('B'));
        } else if (shotMode === 'defect') {
            const mSel = document.getElementById('missionSelect');
            if (mSel) { mSel.value = 'm4'; mSel.dispatchEvent(new Event('change')); }
            workbench.applyPreset('straight_b', true);
            workbench.autoFillBothEnds();
            const t = workbench.ends.B.slots[3];
            workbench.ends.B.slots[3] = workbench.ends.B.slots[4];
            workbench.ends.B.slots[4] = t;
            workbench.ends.A.isCrimped = true;
            workbench.ends.B.isCrimped = true;
            workbench.render();
            updateWorkbenchStatus(workbench.getSlotWireIds('A'), workbench.getSlotWireIds('B'));

            for (let i = 1; i <= 8; i++) {
                const m = document.getElementById('m-led-' + i);
                const r = document.getElementById('r-led-' + i);
                if (m) m.className = 'led-diode glow-green';
                if (r) {
                    if (i === 4 || i === 5) {
                        r.className = 'led-diode glow-red';
                    } else {
                        r.className = 'led-diode glow-green';
                    }
                }
            }
            const termStatus = document.getElementById('termStatus');
            const termSpeed = document.getElementById('termSpeed');
            const termFeed = document.getElementById('termFeed');
            if (termStatus) termStatus.textContent = '⚠️ ПОМИЛКА РОЗПІНОВКИ / НЕВІРНА ПАРА';
            if (termSpeed) termSpeed.textContent = 'Швидкість: 100 Mbps Fast Ethernet (Half Duplex) — Обмеження';
            if (termFeed) termFeed.innerHTML = '• Робочі пари 1-2 та 3-6 цілісні (передача 100 Мбіт/с можлива).<br>• Допоміжна пара 4-5 пошкоджена або розщеплена (Gigabit недоступний).';
        }
    }, 200);
}

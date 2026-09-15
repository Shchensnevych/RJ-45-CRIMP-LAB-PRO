/**
 * LAN Cable Tester Engine - Dual-End Master & Remote Unit Simulation
 * Supports Straight-Through (T568A/T568B), Crossover (100M/1000M), and Custom Cable Analysis
 */
class CableTester {
    constructor() {
        this.isRunning = false;
        this.currentPin = 0;
        this.timer = null;
        this.speed = 320;
        this.onStepCallback = null;
        this.onCompleteCallback = null;
        this.mapping = [];
        this.diagnosticResult = null;
    }

    configure(wiresA, wiresB, cablePresetId = 'straight_b') {
        this.stop();
        this.mapping = [];

        const preset = THEORY_DATA.cablePresets[cablePresetId] || THEORY_DATA.cablePresets.straight_b;
        const stdA = THEORY_DATA.standards[preset.endA || 't568b'];
        const stdB = THEORY_DATA.standards[preset.endB || 't568b'];

        const expectedPinsA = stdA ? stdA.pins.map(p => p.colorId) : THEORY_DATA.standards.t568b.pins.map(p => p.colorId);
        const expectedPinsB = stdB ? stdB.pins.map(p => p.colorId) : THEORY_DATA.standards.t568b.pins.map(p => p.colorId);

        // Expected mapping from Master pin to Remote pin based on preset
        const isCrossPreset = (preset.category === 'crossover');
        const crossMap = { 1: 3, 2: 6, 3: 1, 4: 4, 5: 5, 6: 2, 7: 7, 8: 8 };

        for (let i = 0; i < 8; i++) {
            const masterPin = i + 1;
            const wireA = wiresA ? wiresA[i] : null;
            
            // Where does this exact wire lead on End B?
            let remotePin = null;
            if (wireA && wiresB) {
                const bIdx = wiresB.indexOf(wireA);
                if (bIdx !== -1) {
                    remotePin = bIdx + 1;
                }
            }

            // Expected remote pin
            const expectedRemotePin = isCrossPreset ? crossMap[masterPin] : masterPin;
            const expectedWireA = expectedPinsA[i];
            const expectedWireB = expectedPinsB[expectedRemotePin - 1];

            // Match condition
            const isMatch = (wireA !== null && remotePin === expectedRemotePin && wireA === expectedWireA);

            this.mapping.push({
                masterPin: masterPin,
                remotePin: remotePin,
                expectedRemotePin: expectedRemotePin,
                wireId: wireA,
                isMatch: isMatch,
                isCrossoverPin: (isCrossPreset && (masterPin === 1 || masterPin === 2 || masterPin === 3 || masterPin === 6))
            });
        }

        this.diagnosticResult = this.analyze(wiresA, wiresB, cablePresetId);
        return this.diagnosticResult;
    }

    analyze(wiresA, wiresB, cablePresetId) {
        const t568bPins = THEORY_DATA.standards.t568b.pins.map(p => p.colorId);
        const t568aPins = THEORY_DATA.standards.t568a.pins.map(p => p.colorId);

        const isA_T568B = wiresA.every((w, i) => w === t568bPins[i]);
        const isA_T568A = wiresA.every((w, i) => w === t568aPins[i]);

        const isB_T568B = wiresB.every((w, i) => w === t568bPins[i]);
        const isB_T568A = wiresB.every((w, i) => w === t568aPins[i]);

        let status = 'error';
        let title = 'Помилка кабельної лінії';
        let cableType = 'Невідомий / Дефектний кабель';
        let speedTier = 'Link Down (0 Mbps)';
        let details = [];
        let isCrossover = false;

        // 1. Perfect Gigabit Straight T568B
        if (isA_T568B && isB_T568B) {
            status = 'pass';
            cableType = 'Прямий патч-корд T568B ↔ T568B (Straight-Through)';
            title = '✓ 1000 Mbps Gigabit Ethernet — Ідеальний прямий кабель (T568B)';
            speedTier = '1000 Mbps Gigabit (Full Duplex)';
            details.push('Обидва кінці (Master та Remote) обтиснуто за єдиним стандартом T568B.');
            details.push('Усі 4 кручені пари (A, B, C, D) змонтовано бездоганно.');
            details.push('Призначення: з\'єднання робочої станції (ПК) із комутатором (Switch) або настінною розеткою RJ-45.');
        }
        // 2. Perfect Gigabit Straight T568A
        else if (isA_T568A && isB_T568A) {
            status = 'pass';
            cableType = 'Прямий патч-корд T568A ↔ T568A (Straight-Through)';
            title = '✓ 1000 Mbps Gigabit Ethernet — Прямий кабель (T568A)';
            speedTier = '1000 Mbps Gigabit (Full Duplex)';
            details.push('Обидва кінці кабелю відповідають стандарту T568A.');
            details.push('Підтримує максимальну швидкість 1000BASE-T у повнодуплексному режимі.');
            details.push('Призначення: підключення мережевого обладнання (ПК ↔ Світч).');
        }
        // 3. Perfect Crossover (T568B ↔ T568A)
        else if ((isA_T568B && isB_T568A) || (isA_T568A && isB_T568B)) {
            status = 'pass';
            isCrossover = true;
            cableType = isA_T568B ? 'Перехресний кабель (Crossover: T568B ↔ T568A)' : 'Перехресний кабель (Crossover: T568A ↔ T568B)';
            title = '🔀 CROSSOVER CABLE — Зв\'язок PC-to-PC успішно встановлено!';
            speedTier = '100 / 1000 Mbps (Crossover Link OK)';
            details.push('Виявлено правильний перехресний монтаж Crossover: пари передачі Tx (1-2) з\'єднано з парами прийому Rx (3-6)!');
            details.push('Імпульси Master 1 ➔ Remote 3, Master 2 ➔ Remote 6, Master 3 ➔ Remote 1, Master 6 ➔ Remote 2.');
            details.push('Допоміжні пари 4-5 та 7-8 з\'єднано прямо, що відповідає стандарту ANSI/TIA/EIA-568 Crossover.');
            details.push('Призначення: пряме з\'єднання комп\'ютер ↔ комп\'ютер або комутатор ↔ комутатор без технології Auto-MDIX!');
        }
        // 4. Check Fast Ethernet capabilities
        else {
            // Check if Tx/Rx lines are at least functional straight
            const txRxStraight = [0, 1, 2, 5].every(i => wiresA[i] !== null && wiresA[i] === wiresB[i]);
            // Check if Tx/Rx lines are crossover (1->3, 2->6, 3->1, 6->2)
            const txRxCross = (
                wiresA[0] !== null && wiresA[0] === wiresB[2] &&
                wiresA[1] !== null && wiresA[1] === wiresB[5] &&
                wiresA[2] !== null && wiresA[2] === wiresB[0] &&
                wiresA[5] !== null && wiresA[5] === wiresB[1]
            );

            if (txRxStraight) {
                status = 'warning';
                cableType = 'Прямий кабель з дефектом допоміжних ліній';
                title = '⚠️ 100 Mbps Fast Ethernet — Обмеження швидкості';
                speedTier = '100 Mbps Fast Ethernet (Half Duplex)';
                details.push('Основні лінії передачі даних (1-2) та прийому (3-6) змонтовано прямо та вірно.');
                details.push('У парах 4-5 або 7-8 виявлено помилку (обрив або переплутані жилки). Гігабітний лінк 1000M не підніметься!');
                details.push('Мережева карта автоматично скине швидкість до 100 Мбіт/с.');
            } else if (txRxCross) {
                status = 'warning';
                isCrossover = true;
                cableType = 'Кросовер з дефектом пар 4-5 / 7-8';
                title = '🔀 100 Mbps Fast Ethernet Crossover';
                speedTier = '100 Mbps Fast Ethernet (Crossover)';
                details.push('Робочі пари кросовера (1-2 ↔ 3-6) зкомутовано правильно.');
                details.push('Пари 4-5 або 7-8 містять помилки. Зв\'язок ПК ↔ ПК можливий на швидкості 100 Мбіт/с.');
            } else {
                status = 'error';
                cableType = 'Дефектний кабель (Link Down)';
                title = '❌ Link Down — Сигнальні лінії порушено!';
                speedTier = 'Link Down (0 Mbps - Немає лінку)';
                details.push('Порушено базові лінії прийому та передачі даних (Tx/Rx pairs).');
                details.push('На діодному блоці Remote зафіксовано невідповідність портів (червоні світлодіоди).');
                details.push('Необхідно зрізати конектори та переобтиснути кабель відповідно до стандарту!');
            }
        }

        const correctCount = this.mapping.filter(m => m.isMatch).length;

        return {
            status,
            title,
            cableType,
            speedTier,
            details,
            correctCount,
            isCrossover,
            mapping: this.mapping
        };
    }

    start(onStep, onComplete) {
        this.stop();
        this.isRunning = true;
        this.currentPin = 0;
        this.onStepCallback = onStep;
        this.onCompleteCallback = onComplete;
        this.step();
    }

    step() {
        if (!this.isRunning) return;
        const currentMap = this.mapping[this.currentPin];
        if (this.onStepCallback) {
            this.onStepCallback({
                pinIndex: this.currentPin,
                masterPin: currentMap.masterPin,
                remotePin: currentMap.remotePin,
                expectedRemotePin: currentMap.expectedRemotePin,
                wireId: currentMap.wireId,
                isMatch: currentMap.isMatch,
                isCrossoverPin: currentMap.isCrossoverPin
            });
        }
        this.currentPin++;
        if (this.currentPin < 8) {
            this.timer = setTimeout(() => this.step(), this.speed);
        } else {
            this.timer = setTimeout(() => {
                this.stop();
                if (this.onCompleteCallback) {
                    this.onCompleteCallback(this.diagnosticResult);
                }
            }, this.speed * 1.5);
        }
    }

    stop() {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

window.cableTester = new CableTester();

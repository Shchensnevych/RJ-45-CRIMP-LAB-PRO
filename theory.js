/**
 * Theory Database, Standards Definition, Cable Presets & Lab Missions
 */
const THEORY_DATA = {
    standards: {
        t568b: {
            name: 'TIA/EIA-568-B',
            shortName: 'T568B',
            badge: 'Помаранчева пара (1-2)',
            description: 'Найпоширеніший стандарт для виготовлення прямого патч-корду. Починається з біло-помаранчевої пари.',
            pins: [
                { pin: 1, colorId: 'wo', name: 'Біло-помаранчевий', signal100: 'Tx+ (Передача +)', signal1000: 'BI_DA+ (Пара A +)' },
                { pin: 2, colorId: 'o',  name: 'Помаранчевий', signal100: 'Tx- (Передача -)', signal1000: 'BI_DA- (Пара A -)' },
                { pin: 3, colorId: 'wg', name: 'Біло-зелений', signal100: 'Rx+ (Прийом +)', signal1000: 'BI_DB+ (Пара B +)' },
                { pin: 4, colorId: 'bl', name: 'Синій', signal100: 'Не задіяно', signal1000: 'BI_DC+ (Пара C +)' },
                { pin: 5, colorId: 'wbl',name: 'Біло-синій', signal100: 'Не задіяно', signal1000: 'BI_DC- (Пара C -)' },
                { pin: 6, colorId: 'g',  name: 'Зелений', signal100: 'Rx- (Прийом -)', signal1000: 'BI_DB- (Пара B -)' },
                { pin: 7, colorId: 'wbr',name: 'Біло-коричневий', signal100: 'Не задіяно', signal1000: 'BI_DD+ (Пара D +)' },
                { pin: 8, colorId: 'br', name: 'Коричневий', signal100: 'Не задіяно', signal1000: 'BI_DD- (Пара D -)' }
            ]
        },
        t568a: {
            name: 'TIA/EIA-568-A',
            shortName: 'T568A',
            badge: 'Зелена пара (1-2)',
            description: 'Альтернативний стандарт. Починається із біло-зеленої пари (переставлені помаранчева і зелена пари).',
            pins: [
                { pin: 1, colorId: 'wg', name: 'Біло-зелений', signal100: 'Tx+ (Передача +)', signal1000: 'BI_DA+ (Пара A +)' },
                { pin: 2, colorId: 'g',  name: 'Зелений', signal100: 'Tx- (Передача -)', signal1000: 'BI_DA- (Пара A -)' },
                { pin: 3, colorId: 'wo', name: 'Біло-помаранчевий', signal100: 'Rx+ (Прийом +)', signal1000: 'BI_DB+ (Пара B +)' },
                { pin: 4, colorId: 'bl', name: 'Синій', signal100: 'Не задіяно', signal1000: 'BI_DC+ (Пара C +)' },
                { pin: 5, colorId: 'wbl',name: 'Біло-синій', signal100: 'Не задіяно', signal1000: 'BI_DC- (Пара C -)' },
                { pin: 6, colorId: 'o',  name: 'Помаранчевий', signal100: 'Rx- (Прийом -)', signal1000: 'BI_DB- (Пара B -)' },
                { pin: 7, colorId: 'wbr',name: 'Біло-коричневий', signal100: 'Не задіяно', signal1000: 'BI_DD+ (Пара D +)' },
                { pin: 8, colorId: 'br', name: 'Коричневий', signal100: 'Не задіяно', signal1000: 'BI_DD- (Пара D -)' }
            ]
        }
    },

    cablePresets: {
        straight_b: {
            id: 'straight_b',
            name: 'Прямий T568B (Straight-Through)',
            shortName: 'T568B ↔ T568B',
            category: 'straight',
            endA: 't568b',
            endB: 't568b',
            badgeColor: '#2563eb',
            usage: 'Різнорідні пристрої: ПК ↔ Комутатор, Роутер ↔ Комутатор',
            description: 'Стандартний прямий патч-корд для підключення комп\'ютера до локальної мережі (LAN).'
        },
        straight_a: {
            id: 'straight_a',
            name: 'Прямий T568A (Straight-Through)',
            shortName: 'T568A ↔ T568A',
            category: 'straight',
            endA: 't568a',
            endB: 't568a',
            badgeColor: '#10b981',
            usage: 'Різнорідні пристрої: ПК ↔ Комутатор, телефонні/мережеві панелі',
            description: 'Прямий кабель за альтернативним стандартом T568A з обох боків.'
        },
        crossover_ba: {
            id: 'crossover_ba',
            name: 'Кросовер T568B ↔ T568A (PC-to-PC)',
            shortName: 'Кросовер (B ↔ A)',
            category: 'crossover',
            endA: 't568b',
            endB: 't568a',
            badgeColor: '#f59e0b',
            usage: 'Однорідні пристрої: Комп\'ютер ↔ Комп\'ютер, Комутатор ↔ Комутатор',
            description: 'Перехресний кабель (Crossover). Пари Tx (1-2) з’єднано з парами Rx (3-6) для прямого зв\'язку без світча.'
        },
        crossover_ab: {
            id: 'crossover_ab',
            name: 'Кросовер T568A ↔ T568B (PC-to-PC)',
            shortName: 'Кросовер (A ↔ B)',
            category: 'crossover',
            endA: 't568a',
            endB: 't568b',
            badgeColor: '#f59e0b',
            usage: 'Однорідні пристрої: Комп\'ютер ↔ Комп\'ютер',
            description: 'Зворотний варіант перехресного кабелю. Кінець А — T568A, Кінець Б — T568B.'
        },
        custom: {
            id: 'custom',
            name: 'Вільний монтаж (Custom Patch Cord)',
            shortName: 'Вільний монтаж',
            category: 'custom',
            endA: 't568b',
            endB: 't568b',
            badgeColor: '#8b5cf6',
            usage: 'Досліди, експерименти, виявлення несправностей',
            description: 'Повний контроль над розташуванням жил на обох кінцях кабелю.'
        }
    },

    labMissions: [
        {
            id: 'm1',
            title: 'Завдання 1.1: Прямий патч-корд T568B (ПК ↔ Світч)',
            preset: 'straight_b',
            desc: 'Змонтуйте та обтисніть прямий патч-корд за стандартом T568B на обох кінцях (A і B) для підключення робочої станції до комутатора.'
        },
        {
            id: 'm2',
            title: 'Завдання 1.2: Прямий патч-корд T568A',
            preset: 'straight_a',
            desc: 'Змонтуйте прямий патч-корд за стандартом T568A на обох кінцях.'
        },
        {
            id: 'm3',
            title: 'Завдання 1.3: Перехресний кабель Crossover T568B ↔ T568A',
            preset: 'crossover_ba',
            desc: 'Створіть Crossover кабель (Кінець А: T568B, Кінець Б: T568A) для прямого з\'єднання двох ПК.'
        },
        {
            id: 'm4',
            title: 'Завдання 1.4: Дослідження схем трасування та діагностика',
            preset: 'custom',
            desc: 'Експериментуйте з розпіновками, перевірте реакцію LAN-тестера на розщеплені пари (Split Pair) та перехресні лінії.'
        }
    ],

    wireColors: [
        { id: 'wo', name: 'Біло-помаранчевий', isStripe: true, color: '#ff7700' },
        { id: 'o',  name: 'Помаранчевий', isStripe: false, color: '#ff6f00' },
        { id: 'wg', name: 'Біло-зелений', isStripe: true, color: '#00b050' },
        { id: 'bl', name: 'Синій', isStripe: false, color: '#0066cc' },
        { id: 'wbl',name: 'Біло-синій', isStripe: true, color: '#0066cc' },
        { id: 'g',  name: 'Зелений', isStripe: false, color: '#00a846' },
        { id: 'wbr',name: 'Біло-коричневий', isStripe: true, color: '#8b4513' },
        { id: 'br', name: 'Коричневий', isStripe: false, color: '#633a2d' }
    ]
};
window.THEORY_DATA = THEORY_DATA;

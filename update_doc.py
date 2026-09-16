# -*- coding: utf-8 -*-
"""
Script to update 'ЛАБОРАТОРНА РОБОТА № 1 Основи побудови комп’ютерних мереж.docx'
with comprehensive Task 1 instructions matching RJ-45 Crimp Lab Pro v3.0 DUAL-END & WIREMAP.
"""
import os
import shutil
import docx
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

DOCX_PATH = r"C:\Users\Yurec\OneDrive\НМК по дисциплінам\КСМ\НМК з КСМ\Лабораторні роботи дистанційно\ЛАБОРАТОРНА РОБОТА № 1 Основи побудови комп’ютерних мереж.docx"
BACKUP_PATH = DOCX_PATH + ".bak"

def format_run(run, bold=False, italic=False, font_name="Times New Roman", size_pt=14, color=None):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = color

def set_para_format(p, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=4, space_before=0, line_spacing=1.15):
    p.alignment = align
    pf = p.paragraph_format
    pf.space_after = Pt(space_after)
    pf.space_before = Pt(space_before) if space_before else None
    pf.line_spacing = line_spacing

def build_task1_paragraphs():
    """
    Builds data structures for paragraphs BEFORE Table 1.1 and AFTER Table 1.1.
    """
    # ----------------------------------------------------
    # PARAGRAPHS BEFORE TABLE 1.1 (Task Title, 1.1, 1.2, 1.3, 1.4, 1.5 preamble)
    # ----------------------------------------------------
    before_table = [
        # Main Task Title
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.LEFT,
            "space_before": 8,
            "space_after": 4,
            "line_spacing": None,
            "runs": [
                ("Завдання 1. Дослідження стандартів розпіновки, віртуальний двосторонній монтаж та трасування кабельних ліній (RJ-45 Crimp Lab Pro v3.0)", True, True)
            ]
        },
        # Introduction & Objectives
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Мета завдання: ", True, False),
                ("опанувати технологію монтажу та опресування роз'ємів RJ-45 (8P8C) на 4-парний неекранований кабель витої пари (UTP Cat 5e/6), дослідити фізичні та функціональні відмінності між стандартами колірного маркування TIA/EIA-568-B та TIA/EIA-568-A, вивчити правила побудови прямих (Straight-Through) та перехресних (Crossover) кабельних ліній, освоїти векторне трасування ліній Wiremap та навчитися діагностувати дефекти за допомогою цифрового кабельного LAN-тестера.", False, False)
            ]
        },
        # Guidance on built-in hints and references
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Вказівка щодо використання довідки та підказок у симуляторі: ", True, False),
                ("під час виконання роботи здобувачам освіти дозволяється та рекомендується користуватися вбудованими засобами самоперевірки та допомоги віртуального симулятора «RJ-45 Crimp Lab Pro v3.0» (файл ", False, False),
                ("index.html", True, False),
                (" у каталозі rj45_simulator або за веб-посиланням у системі дистанційного навчання):", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("Вбудований теоретичний довідник: ", True, False),
                ("кнопка «Довідник TIA-568» у верхньому меню симулятора відкриває детальні кольорові векторні схеми T568A, T568B, Crossover B <-> A, Crossover A <-> B, правила вибору прямого чи перехресного кабелю для з'єднання різнорідних (ПК <-> Комутатор) та однорідних (ПК <-> ПК) пристроїв, а також порівняння сигнальних ліній для 100BASE-TX та 1000BASE-T.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("Кольорові мітки-підказки у каналах конектора: ", True, False),
                ("у кожному незаповненому піні роз'єму RJ-45 підсвічується кольоровий маркер очікуваної жили відповідно до обраного стандарту монтажу.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("Інструменти автоматичного складання: ", True, False),
                ("кнопка «Підказка» на панелі верстата дозволяє автоматично розставити жилки активного кінця згідно зі стандартом, а кнопка «Зібрати обидва» здійснює автоматичний монтаж обох кінців кабелю (A і Б) для порівняльного аналізу.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 5,
            "line_spacing": 1.15,
            "runs": [
                ("Індикатори валідності: ", True, False),
                ("біля кожної встановленої жилки відображається позначка правильності монтажу (зелена галочка при коректному розміщенні або червоний хрестик у разі помилки).", False, False)
            ]
        },

        # --- Subtask 1.1 ---
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 4,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("1.1. Дослідження та віртуальний двосторонній монтаж прямого патч-корду за стандартом T568B (ПК <-> Комутатор):", True, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Призначення конфігурації: ", True, False),
                ("прямий патч-корд (Straight-Through) є основним типом кабелю в локальних мережах. Він використовується для сполучення ", False, False),
                ("різнорідних мережевих пристроїв", True, False),
                (": робочої станції (ПК) з комутатором (Switch), мережевого адаптера з настінною розеткою RJ-45 або порту маршрутизатора (Router) з комутатором. У стандарті T568B монтаж починається з помаранчевої пари (контакти 1-2). Обидва кінці кабелю мають абсолютно ідентичну розпіновку T568B.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("Покроковий алгоритм виконання:", True, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("1. Ідентифікація: ", True, False),
                ("у верхній панелі симулятора введіть власне Прізвище, Ім'я та академічну групу.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("2. Вибір завдання: ", True, False),
                ("у списку місій оберіть «Завдання 1.1: Прямий T568B (ПК <-> Світч)» (або натисніть кнопку «Прямий T568B (Straight)» на панелі пресетів типу кабелю).", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("3. Монтаж Кінця А (Master): ", True, False),
                ("переконайтеся, що активна вкладка «Кінець А (Master)». За допомогою миші (перетягуванням Drag-and-Drop або послідовними кліками: жилка -> слот) встановіть жилки з лотка в канали конектора 8P8C у послідовності стандарту T568B:\n", False, False),
                ("   1: Біло-помаранчевий, 2: Помаранчевий, 3: Біло-зелений, 4: Синій,\n   5: Біло-синій, 6: Зелений, 7: Біло-коричневий, 8: Коричневий.", False, True)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("4. Опресування (кримпування) роз'єму А: ", True, False),
                ("перевірте наявність усіх 8 жил та натисніть кнопку «Обтиснути конектор А (8/8)». Спостерігайте анімацію вдавлювання контактних ножів IDC крізь ізоляцію жил та затискання первинного пластикового клина оболонки кабелю.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("5. Монтаж Кінця Б (Remote): ", True, False),
                ("натисніть кнопку переходу «Кінець Б (Remote)». Для отримання прямого патч-корду розкладіть жилки за абсолютно аналогічною схемою стандарту T568B (піни 1-8) та натисніть кнопку «Обтиснути конектор Б (8/8)».", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("6. Апаратна діагностика в LAN-тестері: ", True, False),
                ("натисніть кнопку «Тестувати лінк (LAN TEST)». Зафіксуйте процес послідовного сканування пар від контакту 1 до 8.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 5,
            "line_spacing": 1.15,
            "runs": [
                ("Пояснення отриманого результату: ", True, False),
                ("під час діагностики генератор тестових імпульсів блока Master по черзі надсилає напругу на піни 1..8. На блоці Remote відповідні світлодіоди спалахують синхронно зеленим світлом у строго паралельному порядку: 1-1, 2-2, 3-3, 4-4, 5-5, 6-6, 7-7, 8-8. Діагностичний термінал фіксує режим ", False, False),
                ("«1000 Mbps Gigabit (Full Duplex)»", True, False),
                (", оскільки всі 4 кручені пари справні, мають правильну полярність та цілісність, що забезпечує повнодуплексний гігабітний лінк за стандартом 1000BASE-T. Після завершення тесту відкривається вікно «Акт верифікації та тестування лінку». Зробіть чіткий скріншот персонального акта (де зазначено ПІБ, групу, швидкість 1000 Мбіт/с та унікальний цифровий хеш-код) для включення у звіт.", False, False)
            ]
        },

        # --- Subtask 1.2 ---
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 4,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("1.2. Дослідження та віртуальний двосторонній монтаж прямого патч-корду за альтернативним стандартом T568A:", True, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Призначення конфігурації: ", True, False),
                ("стандарт TIA/EIA-568-A є історично першим базовим стандартом розпіновки та офіційно рекомендований урядовими установами США, а також застосовується у телекомунікаційних і телефонних системах. Головна відмінність від T568B — ", False, False),
                ("заміна місцями зеленої та помаранчевої пар", True, False),
                (": передавальною парою на контактах 1-2 є зелена, а прийомною на контактах 3-6 — помаранчева. Прямий кабель T568A <-> T568A забезпечує ті самі пропускні характеристики, що й T568B <-> T568B.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("Покроковий алгоритм виконання:", True, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("1. Вибір завдання: ", True, False),
                ("у випадаючому списку місій оберіть «Завдання 1.2: Прямий T568A» (або натисніть кнопку «Прямий T568A» у блоці пресетів).", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("2. Демонтаж попереднього кабелю: ", True, False),
                ("для переходу до нового монтажу раніше опресовані конектори необхідно зрізати. Натисніть кнопку «Зрізати конектор бокорізами» для Кінця А та аналогічно для Кінця Б.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("3. Монтаж Кінця А за стандартом T568A: ", True, False),
                ("перейдіть на вкладку «Кінець А (Master)» та розкладіть жилки за схемою T568A:\n", False, False),
                ("   1: Біло-зелений, 2: Зелений, 3: Біло-помаранчевий, 4: Синій,\n   5: Біло-синій, 6: Помаранчевий, 7: Біло-коричневий, 8: Коричневий.", False, True)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("4. Опресування роз'єму А: ", True, False),
                ("натисніть кнопку «Обтиснути конектор А (8/8)».", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("5. Монтаж Кінця Б за стандартом T568A: ", True, False),
                ("перемкніться на вкладку «Кінець Б (Remote)», розкладіть жилки за тією самою схемою T568A (піни 1-8) та обтисніть конектор Б.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("6. Тестування: ", True, False),
                ("запустіть перевірку лінку кнопкою «Тестувати лінк (LAN TEST)».", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 5,
            "line_spacing": 1.15,
            "runs": [
                ("Пояснення отриманого результату: ", True, False),
                ("як і в схемі T568B, діоди Master 1..8 та Remote 1..8 спалахують синхронно в прямому порядку від 1 до 8 зеленим кольором, а термінал фіксує максимальну швидкість ", False, False),
                ("«1000 Mbps Gigabit (Full Duplex)»", True, False),
                (". Прямий кабель T568A <-> T568A та прямий кабель T568B <-> T568B є повністю взаємозамінними при з'єднанні ПК з комутатором, оскільки на обох кінцях дотримується паралельне трасування пар. Проте змішувати ці два стандарти на кінцях одного прямого кабелю неприпустимо, оскільки це утворить перехресний кабель (Crossover).", False, False)
            ]
        },

        # --- Subtask 1.3 ---
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 4,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("1.3. Дослідження перехресного з'єднання (Crossover T568B <-> T568A) та аналіз векторної карти трасування Wiremap:", True, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Призначення конфігурації: ", True, False),
                ("перехресний кабель (Crossover Cable) призначений для прямого сполучення ", False, False),
                ("однорідних мережевих пристроїв", True, False),
                (" без використання комутатора: комп'ютер <-> комп'ютер (прямий зв'язок двох ПК), комутатор <-> комутатор або маршрутизатор <-> маршрутизатор. У мережевих картах без підтримки апаратного автоузгодження Auto-MDIX прямий кабель між двома ПК не працює, оскільки передавач одного комп'ютера (контакти Tx) виявляється замкненим на передавач іншого, а прийомні лінії (Rx) залишаються без сигналу. Кросовер вирішує цю проблему фізичним схрещенням передавальних і прийомних пар.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("Покроковий алгоритм виконання:", True, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("1. Вибір місії: ", True, False),
                ("у списку місій симулятора оберіть «Завдання 1.3: Кросовер T568B <-> T568A (ПК <-> ПК)» (або кнопку «Кросовер (B <-> A)»). За потреби зріжте попередні роз'єми.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("2. Монтаж Кінця А (Master) за T568B: ", True, False),
                ("на вкладці «Кінець А» розташуйте жилки за стандартом T568B (початок з біло-помаранчевої пари) та обтисніть конектор.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("3. Монтаж Кінця Б (Remote) за T568A: ", True, False),
                ("перемкніться на вкладку «Кінець Б» та розташуйте жилки за стандартом T568A (початок з біло-зеленої пари). Обтисніть конектор Б.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("4. Дослідження карти трасування Wiremap: ", True, False),
                ("натисніть кнопку перегляду «Схема трасування кабелю (Wiremap)». Дослідіть векторну діаграму сполучення ліній:\n", False, False),
                ("   • Передавальні контакти Tx (піни 1 та 2) Кінця А з'єднуються з прийомними контактами Rx (піни 3 та 6) Кінця Б;\n   • Прийомні контакти Rx (піни 3 та 6) Кінця А з'єднуються з передавальними контактами Tx (піни 1 та 2) Кінця Б;\n   • Пари 4-5 (синя) та 7-8 (коричнева) проходять паралельно без перехрещення.\n", False, False),
                ("Зробіть скріншот схеми Wiremap для включення у звіт.", True, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("5. Апаратне тестування: ", True, False),
                ("поверніться до LAN-тестера та натисніть «Тестувати лінк (LAN TEST)». Зафіксуйте порядок спалахів світлодіодів на пульті Remote.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 5,
            "line_spacing": 1.15,
            "runs": [
                ("Пояснення отриманого результату: ", True, False),
                ("під час тестування кросовера генератор Master по черзі надсилає імпульси на контакти 1..8, а на блоці Remote світлодіоди засвічуються у характерній перехресній послідовності:\n", False, False),
                ("   • Master 1 -> Remote 3 (зелений діод);\n   • Master 2 -> Remote 6 (зелений діод);\n   • Master 3 -> Remote 1 (зелений діод);\n   • Master 4 -> Remote 4 (зелений діод);\n   • Master 5 -> Remote 5 (зелений діод);\n   • Master 6 -> Remote 2 (зелений діод);\n   • Master 7 -> Remote 7 (зелений діод);\n   • Master 8 -> Remote 8 (зелений діод).\n", False, True),
                ("Тестер фіксує стан: «CROSSOVER CABLE: PC-to-PC Direct Link (100 / 1000 Mbps)». Передавачі першого ПК з'єднані з приймачами другого, що забезпечує стабільний обмін кадрами. Зробіть скріншот сформованого Акта верифікації кросовер-лінку для звіту.", False, False)
            ]
        },

        # --- Subtask 1.4 ---
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 4,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("1.4. Дослідження схем трасування та вільний монтаж (діагностика типових дефектів, деградація швидкості та фізика опресування):", True, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Призначення конфігурації: ", True, False),
                ("режим вільного монтажу призначений для експериментального дослідження реакції мережевого обладнання та LAN-тестера на типові монтажні помилки (порушення порядку пар, дефекти окремих провідників), спостереження ефекту автоматичної деградації швидкості зв'язку (падіння з 1000 Мбіт/с до 100 Мбіт/с), а також практичного засвоєння фізичного принципу незворотності обтискання конекторів 8P8C.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("Покроковий алгоритм виконання:", True, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("1. Вибір режиму: ", True, False),
                ("у списку місій оберіть «Завдання 1.4: Дослідження трасування та вільний монтаж» (або вкладку «Вільний монтаж»). Попередні конектори зріжте бокорізами.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("2. Моделювання дефекту допоміжних пар: ", True, False),
                ("змонтуйте Кінець А правильно за стандартом T568B та обтисніть його. На Кінці Б навмисно внесіть помилку: робочі пари 1-2 (помаранчева) та 3-6 (зелена) розкладіть правильно, а жилки 4 та 5 (синя пара) переплутайте місцями (встановіть у слот 4 біло-синю жилку, а в слот 5 — синю). Обтисніть конектор Б.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 3,
            "line_spacing": 1.15,
            "runs": [
                ("3. Тестування дефектного кабелю: ", True, False),
                ("запустіть LAN-тестер кнопкою «Тестувати лінк (LAN TEST)». Зверніть увагу на колір діодів на пульті Remote та зчитайте діагностичне повідомлення термінала.", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("4. Дослідження фізики незворотності обтискання: ", True, False),
                ("спробуйте витягнути або змінити положення жилок в опресованому конекторі. Переконайтеся, що симулятор блокує дію, виводячи технологічне попередження про нерозбірність вузла. Виконайте нормативний регламент ліквідації браку монтажу: натисніть кнопку «Зрізати конектор бокорізами» для видалення зіпсованого роз'єму.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 5,
            "line_spacing": 1.15,
            "runs": [
                ("Пояснення отриманого результату: ", True, False),
                ("під час діагностики лінії з дефектом у синій парі світлодіоди 1, 2, 3 та 6 світяться зеленим, тоді як діоди 4 та 5 світяться червоним кольором. LAN-тестер видає статус: ", False, False),
                ("«100 Mbps Fast Ethernet (Half Duplex) — Обмеження швидкості»", True, False),
                (". Оскільки основні лінії передачі даних (1-2) та прийому (3-6) змонтовано вірно, лінк 100 Мбіт/с успішно встановлюється, але гігабітний режим (1000BASE-T) не зможе працювати, оскільки він вимагає обов'язкової справності всіх 4 пар. Фізика незворотності опресування обумовлена дією врізного контакту IDC (Insulation Displacement Contact): під механічним тиском крімпера позолочені ножі-зубці прорізають ізоляцію та врізаються в мідну жилу, утворюючи газонепроникне з'єднання на молекулярному рівні, а пластикова планка деформує оболонку кабелю. Спроба розбирання роз'єму неминуче руйнує контакти, тому єдиним нормативним шляхом усунення браку є повне відкушування конектора бокорізами та повторний монтаж новим роз'ємом RJ-45.", False, False)
            ]
        },

        # --- Subtask 1.5 ---
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 4,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("1.5. Порівняльний аналіз стандартів розпіновки та функціоналу ліній зв'язку:", True, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Заповніть порівняльну таблицю 1.1, вказавши точне чергування кольорів для обох схем та їхнє функціональне призначення в стандартах Fast Ethernet (100BASE-TX) і Gigabit Ethernet (1000BASE-T). Зверніть особливу увагу на принципову відмінність: у 100BASE-TX активними є лише дві пари (контакти 1-2 для Tx і 3-6 для Rx, напівдуплекс/дуплекс), тоді як у 1000BASE-T застосовується одночасна повнодуплексна передача інформації всіма чотирма витими парами (Bi-Directional, BI_DA ... BI_DD) з гібридним розділенням сигналів.", False, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.LEFT,
            "space_before": 0,
            "space_after": 2,
            "line_spacing": 1.15,
            "runs": [
                ("Таблиця 1.1. Зіставлення колірних стандартів та функціоналу контактів роз'єму RJ-45", True, False)
            ]
        }
    ]

    # ----------------------------------------------------
    # PARAGRAPHS AFTER TABLE 1.1 (Subtask 1.6 Case Study)
    # ----------------------------------------------------
    after_table = [
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 6,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("1.6. Аналітичний кейс «Діагностика та аналіз типових помилок монтажу кабельних ліній»:", True, False)
            ]
        },
        {
            "style": "Normal",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Проаналізуйте наведені нижче три виробничі ситуації та дайте аргументовані письмові відповіді щодо фізичних причин збоїв, електродинамічних наслідків та нормативних способів їх усунення:", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Ситуація 1 (Надмірне розплетення пар): ", True, False),
                ("Монтажник під час підготовки кабелю RJ-45 розплів виті пари перед введенням у корпус конектора на довжину 35 мм (замість нормативних не більше 12–13 мм за стандартом ANSI/TIA-568). Чому при перевірці простим світлодіодним тестером усі контакти 1–8 показують наявність гальванічного контакту, але при передачі даних на швидкості 100/1000 Мбіт/с спостерігається лавиноподібне падіння пропускної здатності та масова втрата кадрів? Який фізичний механізм захисту від електромагнітних перехресних наведень (NEXT/FEXT) порушено?", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 4,
            "line_spacing": 1.15,
            "runs": [
                ("Ситуація 2 (Порушення фіксації зовнішньої оболонки): ", True, False),
                ("Під час зняття зовнішньої ізоляції монтажник надмірно зачистив оболонку UTP кабелю, в результаті чого внутрішня пластикова затискна планка конектора (strain relief bar) опустилася не на товсту зовнішню полівінілхлоридну оболонку, а лише на окремі тонкі жилки. До яких механічних та експлуатаційних наслідків під час регулярного перепідключення або вигинів кабелю це призведе? Чому затискання оболонки є критично важливим для категорійних кабельних ліній?", False, False)
            ]
        },
        {
            "style": "List Bullet",
            "align": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "space_before": 0,
            "space_after": 6,
            "line_spacing": 1.15,
            "runs": [
                ("Ситуація 3 (Розщеплені пари / Split Pair): ", True, False),
                ("Під час ручного монтажу замість прямого кабелю T568B майстер випадково переплутав жилки 3 та 4 (біло-зелений та синій провідники). Поясніть, чому звичайний простий кабельний тестер повідомить, що всі лінії «справні» (1-1, 2-2, 3-3, 4-4), але високошвидкісна мережа 100BASE-TX або 1000BASE-T взагалі не зможе встановити стабільний лінк або працюватиме з постійними збоями? Як концепція диференційного сигналу та хвильового опору (100 Ом) пояснює ефект Split Pair?", False, False)
            ]
        }
    ]

    return before_table, after_table

def update_document(target_path=DOCX_PATH):
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"Source document not found: {target_path}")

    # 1. Create backup if not exists and targeting actual doc
    if os.path.abspath(target_path) == os.path.abspath(DOCX_PATH):
        if not os.path.exists(BACKUP_PATH):
            shutil.copyfile(DOCX_PATH, BACKUP_PATH)
            print(f"Created backup at: {BACKUP_PATH}")
        else:
            print(f"Backup already exists at: {BACKUP_PATH}")

    doc = docx.Document(target_path)
    before_data, after_data = build_task1_paragraphs()

    # 1. Locate start element, table title element, table element, and task 2 element
    start_elem = None
    table_title_elem = None
    task2_elem = None

    for p in doc.paragraphs:
        txt = p.text.strip()
        if "Завдання 1." in txt and start_elem is None:
            start_elem = p._element
        if "Таблиця 1.1" in txt and table_title_elem is None:
            table_title_elem = p._element
        if "Завдання 2." in txt and task2_elem is None:
            task2_elem = p._element

    tbl_elem = doc.tables[0]._element

    assert start_elem is not None, "Could not find 'Завдання 1.'"
    assert table_title_elem is not None, "Could not find 'Таблиця 1.1'"
    assert task2_elem is not None, "Could not find 'Завдання 2.'"

    # Collect elements before table to replace (from start_elem to table_title_elem inclusive)
    before_replace = []
    curr = start_elem
    while curr is not None:
        before_replace.append(curr)
        if curr == table_title_elem:
            break
        curr = curr.getnext()

    print(f"Elements before table to remove: {len(before_replace)}")

    # Insert new before_data before start_elem
    anchor_p = docx.text.paragraph.Paragraph(start_elem, doc)
    for item in before_data:
        p_new = anchor_p.insert_paragraph_before()
        p_new.style = item["style"]
        set_para_format(p_new, align=item["align"], space_after=item["space_after"], space_before=item["space_before"], line_spacing=item["line_spacing"])
        for r_text, r_bold, r_italic in item["runs"]:
            r = p_new.add_run(r_text)
            format_run(r, bold=r_bold, italic=r_italic)

    # Remove old elements
    parent = start_elem.getparent()
    for elem in before_replace:
        parent.remove(elem)

    # Collect elements between tbl_elem and task2_elem
    after_replace = []
    curr = tbl_elem.getnext()
    while curr is not None and curr != task2_elem:
        after_replace.append(curr)
        curr = curr.getnext()

    print(f"Elements after table to remove: {len(after_replace)}")

    # Insert new after_data before task2_elem
    task2_p = docx.text.paragraph.Paragraph(task2_elem, doc)
    for item in after_data:
        p_new = task2_p.insert_paragraph_before()
        p_new.style = item["style"]
        set_para_format(p_new, align=item["align"], space_after=item["space_after"], space_before=item["space_before"], line_spacing=item["line_spacing"])
        for r_text, r_bold, r_italic in item["runs"]:
            r = p_new.add_run(r_text)
            format_run(r, bold=r_bold, italic=r_italic)

    # Remove old elements after table
    for elem in after_replace:
        parent.remove(elem)

    # Update Section 4: Зміст та оформлення звіту (пункт 3)
    for p in doc.paragraphs:
        if "3. Результати виконання Завдання 1:" in p.text:
            # Clear all child runs
            for r in list(p.runs):
                p._element.remove(r._element)
            p.style = "List Bullet"
            set_para_format(p, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=4, space_before=0, line_spacing=1.15)
            r1 = p.add_run("3. Результати виконання Завдання 1: ")
            format_run(r1, bold=True, italic=False)
            r2 = p.add_run(
                "скріншоти персональних «Актів верифікації та тестування лінку» із симулятора «RJ-45 Crimp Lab Pro v3.0» "
                "для прямого патч-корду T568B та перехресного кабелю Crossover (із зазначенням ПІБ, групи, швидкості лінку та захисного цифрового хеш-коду); "
                "скріншот інтерактивної векторної схеми трасування Wiremap із відображенням перехрещення сигнальних ліній; "
                "заповнена порівняльна таблиця 1.1 стандартів та сигналів ліній зв'язку; "
                "аргументовані письмові відповіді на 3 виробничі ситуації аналітичного кейсу з фізики збоїв кабельних ліній."
            )
            format_run(r2, bold=False, italic=False)
            print("Updated Section 4 report requirements for Task 1.")
            break

    doc.save(target_path)
    print(f"Successfully saved updated document to: {target_path}")

if __name__ == "__main__":
    update_document()

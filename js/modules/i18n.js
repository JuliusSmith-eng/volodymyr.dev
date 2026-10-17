(function () {
  var App = (window.App = window.App || {});
  var KEY = "lang";
  var LANGS = ["uk", "en", "de"];
  var DEFAULT = "uk"; // язык исходной разметки в index.html
  var listeners = [];
  var current = DEFAULT;

  // Все тексты сайта. Статичная разметка помечена data-i18n="ключ",
  // галерея, цены и поиск берут строки отсюда через App.i18n.t(ключ).
  var DICT = {
    uk: {
      "meta.title": "Volodymyr.dev — фронтенд-розробник: лендінги, дашборди, верстка на HTML/CSS/JS",
      "meta.description": "Володимир — фронтенд-розробник. Адаптивні лендінги, дашборди з API та верстка за макетом на чистому HTML, CSS і JavaScript. Строки від 2 днів, вихідні коди в комплекті.",
      "meta.author": "Володимир",
      "meta.ogTitle": "Volodymyr.dev — фронтенд-розробник",
      "meta.ogDescription": "Лендінги, дашборди та верстка на чистому HTML, CSS і JavaScript.",
      "meta.ogLocale": "uk_UA",
      "meta.jobTitle": "Фронтенд-розробник",
      "meta.name": "Володимир",

      "skip": "До вмісту",
      "logo.aria": "Volodymyr.dev, на головну",
      "nav.aria": "Основне меню",
      "nav.stack": "Стек",
      "nav.works": "Роботи",
      "nav.pricing": "Ціни",
      "nav.contacts": "Контакти",
      "theme.aria": "Перемкнути тему",
      "lang.aria": "Мова сайту",
      "search.toggle": "Пошук по сайту (Ctrl+K)",
      "search.placeholder": "Шукати по сайту",
      "search.aria": "Пошук по сайту",
      "search.close": "Закрити пошук",
      "search.results": "Результати пошуку",
      "search.head": "Швидкий перехід",
      "search.empty": "Нічого не знайдено. Спробуйте «лендінг», «ціни» або «API».",
      "search.hintWork": "робота",
      "search.hintSection": "розділ",
      "cta.write": "Написати мені",
      "burger.aria": "Відкрити меню",

      "hello.aria": "Привіт, я Володимир",
      "hello.l": "Привіт, я",
      "hello.r": "Володимир",
      "wolf.aria": "Вовк у жовтій худі озирається по сторонах",
      "hero.cta": "Обговоримо проєкт?",
      "hero.t1": "Чистий код.",
      "hero.t2": "Живий інтерфейс.",
      "hero.t3": "Сайт, що приводить клієнтів.",
      "hero.badge": "⚡ Строк виконання — від 2 днів",
      "hero.lead": "Я Володимир, фронтенд-розробник на HTML, CSS і vanilla JavaScript. Перетворюю макети Figma (та інші) на швидкі адаптивні сторінки з робочими формами.",
      "hero.works": "Дивитися роботи",
      "facts.first": "Перший результат",
      "facts.days": "дні",
      "facts.responsive": "Адаптив",
      "facts.revisions": "Правок у замовленні",
      "facts.upto": "до",

      "stack.h2": "З чим я працюю і що роблю",
      "stack.h3": "Стек",
      "stack.tagFigma": "Figma → HTML",
      "stack.tagBots": "Telegram-боти",
      "stack.text": "Пишу семантичну верстку, підключаю форми з валідацією та захистом від спаму, відправляю заявки на пошту або в Telegram. Вихідні коди й деплой на ваш хостинг входять у замовлення.",
      "stack.landing.h": "Лендінги",
      "stack.landing.p": "За макетом Figma. Анімації, FAQ, галереї, робоча форма заявок.",
      "stack.clone.h": "Копія дизайну",
      "stack.clone.p": "Перезберу сайт за референсом на ваших текстах і у вашому стилі. Без копіювання чужих логотипів.",
      "stack.dash.h": "Дашборди",
      "stack.dash.p": "Графіки Chart.js, фільтри, експорт у PDF, Excel і JSON, підключення API з авторизацією.",

      "works.h2": "Роботи",
      "works.filter": "Фільтр робіт",
      "works.all": "Усі",
      "works.slider": "Галерея робіт",
      "works.hint": "Тягніть або гортайте",
      "works.prev": "Попередні роботи",
      "works.next": "Наступні роботи",
      "works.open": "Відкрити: {title}",
      "work.close": "Закрити",
      "work.prevImg": "Попереднє зображення",
      "work.nextImg": "Наступне зображення",
      "work.thumb": "Зображення {n}",
      "work.imgAlt": "{title}: {n} з {total}",
      "work.link": "Переглянути роботу",
      "work.order": "Замовити схоже",
      "work.prevWork": "← Попередня робота",
      "work.nextWork": "Наступна робота →",
      "work.spec.type": "Тип",
      "work.spec.term": "Термін",
      "work.spec.result": "Результат",

      "pricing.h2": "Ціни",
      "pricing.tabsAria": "Напрям",
      "pricing.tabs": { landing: "Лендінг", clone: "Копія дизайну", dashboard: "Дашборд" },
      "pricing.hot": "Обирають частіше",
      "pricing.time": "Строк: {t}",
      "pricing.days": "{n} дні",
      "pricing.order": "Замовити",
      "pricing.note": "Прискорена здача за доплату. У кожному пакеті: вихідний код, оптимізація швидкості, деплой на ваш хостинг.",
      "calc.title": "Збери свій лендінг",
      "calc.lead": "Обирайте опції ліворуч і дивіться, як сайт збирається праворуч. Ціна рахується одразу.",
      "calc.included": "Входить у вартість",
      "calc.total": "Разом",
      "calc.order": "Замовити з цим набором",
      "calc.mockAria": "Схематичний макет вашого сайту",
      "calc.hint": "Макет збирається з ваших опцій: пробуйте вмикати та вимикати.",
      "calc.level": "Рівень",
      "calc.levels": ["Старт", "Про", "Майстер", "Ультимейт"],
      "calc.next": "ще {n} до «{name}»",
      "calc.max": "Максимальний рівень",
      "calc.ach": "Досягнення",
      "calc.achLocked": "Ще не відкрито",
      "calc.ach.speed": "Швидкий старт",
      "calc.ach.polyglot": "Поліглот",
      "calc.ach.auto": "Автоматизація",
      "calc.ach.play": "Інтерактив",
      "calc.ach.style": "Стиліст",
      "calc.ach.full": "Повний набір",
      "calc.less": "Менше",
      "calc.more": "Більше",
      "calc.toast.level": "Новий рівень: {name}!",
      "calc.toast.ach": "Досягнення: {name}",
      "calc.toast.copied": "Замовлення скопійовано. Вставте його в чат",
      "calc.toast.copyFail": "Скопіюйте замовлення вручну з поля",
      "calc.orderHead": "Привіт! Хочу замовити лендінг із такими опціями:",
      "calc.orderTotal": "Разом: {total}",
      "pricing.items": {
        landing: [
          ["1 сторінка, до 3–4 секцій", "HTML, CSS, vanilla JS", "2 правки", "Оптимізація швидкості (чистий JS, стиснення, lazy-load)", "Кастомні мікроанімації (GSAP, ScrollTrigger, CSS hover/reveal)"]
        ],
        clone: [
          ["Односторінкова копія за референсом", "Адаптив під усі екрани", "2 правки", "Оптимізація швидкості (чистий JS, стиснення, lazy-load)", "Кастомні мікроанімації (GSAP, ScrollTrigger, CSS hover/reveal)"]
        ],
        dashboard: [
          ["Сторінка з графіками Chart.js", "Динамічні фільтри", "2 правки", "Оптимізація швидкості (чистий JS, стиснення, lazy-load)", "Кастомні мікроанімації (GSAP, ScrollTrigger, CSS hover/reveal)"]
        ]
      },

      "contacts.h2": "Обговоримо проєкт?",
      "contacts.lead": "Надішліть макет або посилання на референс, і я скажу строк і ціну.",
      "contacts.tg": "Найшвидше відповідаю тут",
      "contacts.ig": "Свіжі роботи",
      "contacts.fiverr": "Замовлення з гарантією платформи",
      "footer.top": "Вгору",
      "footer.status": "Відкритий до нових проєктів",
      "footer.tag": "Верстаю сайти, що швидко вантажаться і гарно виглядають на будь-якому екрані.",
      "footer.nav": "Навігація",
      "footer.social": "Зв'язок",
      "footer.made": "Зверстано вручну: HTML, CSS і vanilla JS",

      "sections": [
        { id: "stack", title: "Стек", hint: "технології та послуги", kw: "html css javascript js tailwind php chart.js api технології послуги стек figma" },
        { id: "works", title: "Роботи", hint: "галерея проєктів", kw: "роботи проєкти портфоліо галерея лендінг дашборд" },
        { id: "pricing", title: "Ціни", hint: "пакети та терміни", kw: "ціни вартість пакети basic standard premium скільки коштує" },
        { id: "contacts", title: "Контакти", hint: "Telegram, Instagram, Fiverr", kw: "контакти зв'язок telegram instagram fiverr написати" }
      ]
    },

    en: {
      "meta.title": "Volodymyr.dev — Front-end developer: landing pages, dashboards, HTML/CSS/JS markup",
      "meta.description": "Volodymyr is a front-end developer. Responsive landing pages, API-powered dashboards and design-to-code in plain HTML, CSS and JavaScript. Turnaround from 2 days, source code included.",
      "meta.author": "Volodymyr",
      "meta.ogTitle": "Volodymyr.dev — front-end developer",
      "meta.ogDescription": "Landing pages, dashboards and layouts in plain HTML, CSS and JavaScript.",
      "meta.ogLocale": "en_US",
      "meta.jobTitle": "Front-end developer",
      "meta.name": "Volodymyr",

      "skip": "Skip to content",
      "logo.aria": "Volodymyr.dev, back to top",
      "nav.aria": "Main menu",
      "nav.stack": "Stack",
      "nav.works": "Work",
      "nav.pricing": "Pricing",
      "nav.contacts": "Contact",
      "theme.aria": "Toggle theme",
      "lang.aria": "Site language",
      "search.toggle": "Search the site (Ctrl+K)",
      "search.placeholder": "Search the site",
      "search.aria": "Search the site",
      "search.close": "Close search",
      "search.results": "Search results",
      "search.head": "Quick jump",
      "search.empty": "Nothing found. Try “landing”, “pricing” or “API”.",
      "search.hintWork": "project",
      "search.hintSection": "section",
      "cta.write": "Message me",
      "burger.aria": "Open menu",

      "hello.aria": "Hi, I'm Volodymyr",
      "hello.l": "Hi, I'm",
      "hello.r": "Volodymyr",
      "wolf.aria": "A wolf in a yellow hoodie looking around",
      "hero.cta": "Let's discuss your project?",
      "hero.t1": "Clean code.",
      "hero.t2": "A lively interface.",
      "hero.t3": "A website that brings clients.",
      "hero.badge": "⚡ Turnaround from 2 days",
      "hero.lead": "I'm Volodymyr, a front-end developer working with HTML, CSS and vanilla JavaScript. I turn Figma (and other) mockups into fast, responsive pages with working forms.",
      "hero.works": "View my work",
      "facts.first": "First result",
      "facts.days": "days",
      "facts.responsive": "Responsive",
      "facts.revisions": "Revisions per order",
      "facts.upto": "up to",

      "stack.h2": "What I work with and what I build",
      "stack.h3": "Stack",
      "stack.tagFigma": "Figma → HTML",
      "stack.tagBots": "Telegram bots",
      "stack.text": "I write semantic markup and wire up forms with validation and spam protection, sending requests to email or Telegram. Source code and deployment to your hosting are included in every order.",
      "stack.landing.h": "Landing pages",
      "stack.landing.p": "Built from Figma mockups. Animations, FAQ, galleries, a working request form.",
      "stack.clone.h": "Design clones",
      "stack.clone.p": "I'll rebuild a site from a reference using your copy and your style. No copying of other people's logos.",
      "stack.dash.h": "Dashboards",
      "stack.dash.p": "Chart.js charts, filters, export to PDF, Excel and JSON, API integration with authentication.",

      "works.h2": "Work",
      "works.filter": "Work filter",
      "works.all": "All",
      "works.slider": "Work gallery",
      "works.hint": "Drag or swipe",
      "works.prev": "Previous works",
      "works.next": "Next works",
      "works.open": "Open: {title}",
      "work.close": "Close",
      "work.prevImg": "Previous image",
      "work.nextImg": "Next image",
      "work.thumb": "Image {n}",
      "work.imgAlt": "{title}: {n} of {total}",
      "work.link": "View project",
      "work.order": "Order something similar",
      "work.prevWork": "← Previous project",
      "work.nextWork": "Next project →",
      "work.spec.type": "Type",
      "work.spec.term": "Timeline",
      "work.spec.result": "Result",

      "pricing.h2": "Pricing",
      "pricing.tabsAria": "Category",
      "pricing.tabs": { landing: "Landing page", clone: "Design clone", dashboard: "Dashboard" },
      "pricing.hot": "Most popular",
      "pricing.time": "Turnaround: {t}",
      "pricing.days": "{n} days",
      "pricing.order": "Order",
      "pricing.note": "Rush delivery available for an extra fee. Every package includes source code, speed optimization and deployment to your hosting.",
      "calc.title": "Build your landing page",
      "calc.lead": "Pick options on the left and watch the site assemble on the right. The price updates instantly.",
      "calc.included": "Included",
      "calc.total": "Total",
      "calc.order": "Order this setup",
      "calc.mockAria": "Schematic mockup of your site",
      "calc.hint": "The mockup is built from your options: try switching them on and off.",
      "calc.level": "Level",
      "calc.levels": ["Starter", "Pro", "Master", "Ultimate"],
      "calc.next": "{n} more to “{name}”",
      "calc.max": "Max level",
      "calc.ach": "Achievements",
      "calc.achLocked": "Not unlocked yet",
      "calc.ach.speed": "Quick start",
      "calc.ach.polyglot": "Polyglot",
      "calc.ach.auto": "Automation",
      "calc.ach.play": "Interactive",
      "calc.ach.style": "Stylist",
      "calc.ach.full": "Full house",
      "calc.less": "Less",
      "calc.more": "More",
      "calc.toast.level": "New level: {name}!",
      "calc.toast.ach": "Achievement: {name}",
      "calc.toast.copied": "Order copied. Paste it into the chat",
      "calc.toast.copyFail": "Please copy the order manually",
      "calc.orderHead": "Hi! I would like to order a landing page with these options:",
      "calc.orderTotal": "Total: {total}",
      "pricing.items": {
        landing: [
          ["1 page, up to 3–4 sections", "HTML, CSS, vanilla JS", "2 revisions", "Speed optimization (clean JS, compression, lazy-load)", "Custom micro-animations (GSAP, ScrollTrigger, CSS hover/reveal)"]
        ],
        clone: [
          ["One-page copy from a reference", "Responsive for all screens", "2 revisions", "Speed optimization (clean JS, compression, lazy-load)", "Custom micro-animations (GSAP, ScrollTrigger, CSS hover/reveal)"]
        ],
        dashboard: [
          ["Page with Chart.js charts", "Dynamic filters", "2 revisions", "Speed optimization (clean JS, compression, lazy-load)", "Custom micro-animations (GSAP, ScrollTrigger, CSS hover/reveal)"]
        ]
      },

      "contacts.h2": "Let's discuss your project?",
      "contacts.lead": "Send a mockup or a link to a reference and I'll tell you the timeline and price.",
      "contacts.tg": "I reply fastest here",
      "contacts.ig": "Latest work",
      "contacts.fiverr": "Orders backed by the platform's guarantee",
      "footer.top": "Back to top",
      "footer.status": "Open to new projects",
      "footer.tag": "I build websites that load fast and look great on any screen.",
      "footer.nav": "Navigation",
      "footer.social": "Get in touch",
      "footer.made": "Hand-coded with HTML, CSS and vanilla JS",

      "sections": [
        { id: "stack", title: "Stack", hint: "technologies and services", kw: "html css javascript js tailwind php chart.js api technologies services stack tech figma" },
        { id: "works", title: "Work", hint: "project gallery", kw: "work works projects portfolio gallery landing dashboard clone" },
        { id: "pricing", title: "Pricing", hint: "packages and timelines", kw: "pricing price cost packages basic standard premium how much" },
        { id: "contacts", title: "Contact", hint: "Telegram, Instagram, Fiverr", kw: "contact contacts telegram instagram fiverr message write hire" }
      ]
    },

    de: {
      "meta.title": "Volodymyr.dev — Frontend-Entwickler: Landingpages, Dashboards, Umsetzung in HTML/CSS/JS",
      "meta.description": "Volodymyr ist Frontend-Entwickler. Responsive Landingpages, Dashboards mit API-Anbindung und Design-Umsetzung in reinem HTML, CSS und JavaScript. Lieferzeit ab 2 Tagen, Quellcode inklusive.",
      "meta.author": "Volodymyr",
      "meta.ogTitle": "Volodymyr.dev — Frontend-Entwickler",
      "meta.ogDescription": "Landingpages, Dashboards und Umsetzungen in reinem HTML, CSS und JavaScript.",
      "meta.ogLocale": "de_DE",
      "meta.jobTitle": "Frontend-Entwickler",
      "meta.name": "Volodymyr",

      "skip": "Zum Inhalt springen",
      "logo.aria": "Volodymyr.dev, zum Seitenanfang",
      "nav.aria": "Hauptmenü",
      "nav.stack": "Stack",
      "nav.works": "Projekte",
      "nav.pricing": "Preise",
      "nav.contacts": "Kontakt",
      "theme.aria": "Farbschema wechseln",
      "lang.aria": "Sprache der Website",
      "search.toggle": "Website durchsuchen (Strg+K)",
      "search.placeholder": "Website durchsuchen",
      "search.aria": "Website durchsuchen",
      "search.close": "Suche schließen",
      "search.results": "Suchergebnisse",
      "search.head": "Schnellzugriff",
      "search.empty": "Nichts gefunden. Versuchen Sie „Landingpage“, „Preise“ oder „API“.",
      "search.hintWork": "Projekt",
      "search.hintSection": "Abschnitt",
      "cta.write": "Anfrage senden",
      "burger.aria": "Menü öffnen",

      "hello.aria": "Ich bin Volodymyr",
      "hello.l": "Ich bin",
      "hello.r": "Volodymyr",
      "wolf.aria": "Ein Wolf im gelben Hoodie schaut sich um",
      "hero.cta": "Projekt besprechen?",
      "hero.t1": "Sauberer Code.",
      "hero.t2": "Lebendiges Interface.",
      "hero.t3": "Eine Website, die Kunden bringt.",
      "hero.badge": "⚡ Lieferzeit ab 2 Tagen",
      "hero.lead": "Ich bin Volodymyr, Frontend-Entwickler mit HTML, CSS und Vanilla JavaScript. Ich verwandle Figma-Designs (und andere Vorlagen) in schnelle, responsive Seiten mit funktionierenden Formularen.",
      "hero.works": "Projekte ansehen",
      "facts.first": "Erstes Ergebnis",
      "facts.days": "Tage",
      "facts.responsive": "Responsive",
      "facts.revisions": "Korrekturen pro Auftrag",
      "facts.upto": "bis zu",

      "stack.h2": "Womit ich arbeite und was ich baue",
      "stack.h3": "Stack",
      "stack.tagFigma": "Figma → HTML",
      "stack.tagBots": "Telegram-Bots",
      "stack.text": "Ich schreibe semantisches Markup, binde Formulare mit Validierung und Spamschutz an und leite Anfragen per E-Mail oder an Telegram weiter. Quellcode und Deployment auf Ihrem Hosting sind im Auftrag enthalten.",
      "stack.landing.h": "Landingpages",
      "stack.landing.p": "Nach Figma-Design. Animationen, FAQ, Galerien, funktionierendes Anfrageformular.",
      "stack.clone.h": "Design-Nachbau",
      "stack.clone.p": "Ich baue eine Website nach Vorlage mit Ihren Texten und in Ihrem Stil neu auf. Ohne Kopieren fremder Logos.",
      "stack.dash.h": "Dashboards",
      "stack.dash.p": "Chart.js-Diagramme, Filter, Export als PDF, Excel und JSON, API-Anbindung mit Authentifizierung.",

      "works.h2": "Projekte",
      "works.filter": "Projektfilter",
      "works.all": "Alle",
      "works.slider": "Projektgalerie",
      "works.hint": "Ziehen oder wischen",
      "works.prev": "Vorherige Projekte",
      "works.next": "Nächste Projekte",
      "works.open": "Öffnen: {title}",
      "work.close": "Schließen",
      "work.prevImg": "Vorheriges Bild",
      "work.nextImg": "Nächstes Bild",
      "work.thumb": "Bild {n}",
      "work.imgAlt": "{title}: {n} von {total}",
      "work.link": "Projekt ansehen",
      "work.order": "Ähnliches bestellen",
      "work.prevWork": "← Vorheriges Projekt",
      "work.nextWork": "Nächstes Projekt →",
      "work.spec.type": "Typ",
      "work.spec.term": "Dauer",
      "work.spec.result": "Ergebnis",

      "pricing.h2": "Preise",
      "pricing.tabsAria": "Kategorie",
      "pricing.tabs": { landing: "Landingpage", clone: "Design-Nachbau", dashboard: "Dashboard" },
      "pricing.hot": "Meistgewählt",
      "pricing.time": "Lieferzeit: {t}",
      "pricing.days": "{n} Tage",
      "pricing.order": "Bestellen",
      "pricing.note": "Beschleunigte Lieferung gegen Aufpreis. In jedem Paket enthalten: Quellcode, Geschwindigkeitsoptimierung, Deployment auf Ihrem Hosting.",
      "calc.title": "Baue deine Landingpage",
      "calc.lead": "Wähle links Optionen und sieh rechts, wie die Seite entsteht. Der Preis aktualisiert sich sofort.",
      "calc.included": "Inklusive",
      "calc.total": "Gesamt",
      "calc.order": "Mit diesem Paket bestellen",
      "calc.mockAria": "Schematischer Entwurf deiner Website",
      "calc.hint": "Der Entwurf entsteht aus deinen Optionen: schalte sie ein und aus.",
      "calc.level": "Level",
      "calc.levels": ["Starter", "Pro", "Meister", "Ultimate"],
      "calc.next": "noch {n} bis „{name}“",
      "calc.max": "Höchstes Level",
      "calc.ach": "Erfolge",
      "calc.achLocked": "Noch nicht freigeschaltet",
      "calc.ach.speed": "Schnellstart",
      "calc.ach.polyglot": "Polyglott",
      "calc.ach.auto": "Automatisierung",
      "calc.ach.play": "Interaktiv",
      "calc.ach.style": "Stylist",
      "calc.ach.full": "Volles Paket",
      "calc.less": "Weniger",
      "calc.more": "Mehr",
      "calc.toast.level": "Neues Level: {name}!",
      "calc.toast.ach": "Erfolg: {name}",
      "calc.toast.copied": "Bestellung kopiert. Füge sie in den Chat ein",
      "calc.toast.copyFail": "Bitte kopiere die Bestellung manuell",
      "calc.orderHead": "Hallo! Ich möchte eine Landingpage mit diesen Optionen bestellen:",
      "calc.orderTotal": "Gesamt: {total}",
      "pricing.items": {
        landing: [
          ["1 Seite, bis zu 3–4 Abschnitte", "HTML, CSS, Vanilla JS", "2 Korrekturen", "Geschwindigkeitsoptimierung (reines JS, Komprimierung, Lazy-Load)", "Individuelle Mikro-Animationen (GSAP, ScrollTrigger, CSS-Hover/Reveal)"]
        ],
        clone: [
          ["Einseitiger Nachbau nach Vorlage", "Responsive für alle Bildschirmgrößen", "2 Korrekturen", "Geschwindigkeitsoptimierung (reines JS, Komprimierung, Lazy-Load)", "Individuelle Mikro-Animationen (GSAP, ScrollTrigger, CSS-Hover/Reveal)"]
        ],
        dashboard: [
          ["Seite mit Chart.js-Diagrammen", "Dynamische Filter", "2 Korrekturen", "Geschwindigkeitsoptimierung (reines JS, Komprimierung, Lazy-Load)", "Individuelle Mikro-Animationen (GSAP, ScrollTrigger, CSS-Hover/Reveal)"]
        ]
      },

      "contacts.h2": "Projekt besprechen?",
      "contacts.lead": "Senden Sie mir ein Design oder einen Link zur Vorlage, und ich nenne Ihnen Lieferzeit und Preis.",
      "contacts.tg": "Hier antworte ich am schnellsten",
      "contacts.ig": "Aktuelle Arbeiten",
      "contacts.fiverr": "Aufträge mit Plattformgarantie",
      "footer.top": "Nach oben",
      "footer.status": "Offen für neue Projekte",
      "footer.tag": "Ich baue Websites, die schnell laden und auf jedem Bildschirm gut aussehen.",
      "footer.nav": "Navigation",
      "footer.social": "Kontakt aufnehmen",
      "footer.made": "Handgemacht mit HTML, CSS und Vanilla JS",

      "sections": [
        { id: "stack", title: "Stack", hint: "Technologien und Leistungen", kw: "html css javascript js tailwind php chart.js api technologien leistungen stack figma" },
        { id: "works", title: "Projekte", hint: "Projektgalerie", kw: "projekte arbeiten portfolio galerie landingpage dashboard nachbau" },
        { id: "pricing", title: "Preise", hint: "Pakete und Lieferzeiten", kw: "preise kosten pakete basic standard premium wie viel" },
        { id: "contacts", title: "Kontakt", hint: "Telegram, Instagram, Fiverr", kw: "kontakt telegram instagram fiverr schreiben anfrage" }
      ]
    }
  };

  function t(key) {
    var d = DICT[current];
    if (d && d[key] !== undefined) return d[key];
    return DICT[DEFAULT][key];
  }

  function detect() {
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (q && LANGS.indexOf(q) !== -1) return q;
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved && LANGS.indexOf(saved) !== -1) return saved;
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < prefs.length; i++) {
      var p = String(prefs[i]).slice(0, 2).toLowerCase();
      if (p === "uk" || p === "ru" || p === "be") return "uk";
      if (p === "de") return "de";
      if (p === "en") return "en";
    }
    return "en"; // остальным посетителям понятнее английский
  }

  function setMeta(sel, attr, val) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }

  function apply() {
    var root = document.documentElement;
    root.lang = current;
    document.title = t("meta.title");
    setMeta('meta[name="description"]', "content", t("meta.description"));
    setMeta('meta[name="author"]', "content", t("meta.author"));
    setMeta('meta[property="og:title"]', "content", t("meta.ogTitle"));
    setMeta('meta[property="og:description"]', "content", t("meta.ogDescription"));
    setMeta('meta[property="og:locale"]', "content", t("meta.ogLocale"));

    var ld = document.querySelector('script[type="application/ld+json"]');
    if (ld) {
      try {
        var data = JSON.parse(ld.textContent);
        data.name = t("meta.name");
        data.jobTitle = t("meta.jobTitle");
        ld.textContent = JSON.stringify(data);
      } catch (e) {}
    }

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    // data-i18n-attr="aria-label:ключ;placeholder:ключ"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":");
        if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });

    var cur = document.getElementById("langCur");
    if (cur) cur.textContent = current === "uk" ? "UA" : current.toUpperCase();
    document.querySelectorAll("#langMenu [data-lang]").forEach(function (b) {
      b.setAttribute("aria-selected", String(b.dataset.lang === current));
    });
  }

  function set(lang, persist) {
    if (LANGS.indexOf(lang) === -1) return;
    current = lang;
    if (persist) {
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      try {
        var u = new URL(location.href);
        u.searchParams.set("lang", lang);
        history.replaceState(null, "", u);
      } catch (e) {}
    }
    apply();
    listeners.forEach(function (fn) { fn(current); });
  }

  function initSwitcher() {
    var root = document.getElementById("lang");
    var btn = document.getElementById("langBtn");
    var menu = document.getElementById("langMenu");
    if (!root || !btn || !menu) return;
    var opts = Array.prototype.slice.call(menu.querySelectorAll("[data-lang]"));

    function isOpen() { return root.classList.contains("is-open"); }
    function open() {
      root.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      opts.forEach(function (o) { o.tabIndex = 0; });
    }
    function shut(returnFocus) {
      root.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      opts.forEach(function (o) { o.tabIndex = -1; });
      if (returnFocus) btn.focus();
    }

    btn.addEventListener("click", function () { isOpen() ? shut(false) : open(); });
    menu.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lang]"); if (!b) return;
      set(b.dataset.lang, true);
      shut(true);
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) { e.stopPropagation(); shut(true); return; }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      if (!isOpen()) open();
      var i = opts.indexOf(document.activeElement);
      var n = e.key === "ArrowDown" ? i + 1 : i - 1;
      opts[(n + opts.length) % opts.length].focus();
    });
    document.addEventListener("pointerdown", function (e) {
      if (isOpen() && !e.target.closest("#lang")) shut(false);
    });
    opts.forEach(function (o) { o.tabIndex = -1; });
  }

  App.i18n = {
    langs: LANGS,
    get lang() { return current; },
    t: t,
    // подстановка {имя} в строку перевода
    fmt: function (key, vars) {
      return String(t(key)).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] !== undefined ? vars[k] : m; });
    },
    onChange: function (fn) { listeners.push(fn); },
    set: function (lang) { set(lang, true); },
    init: function () {
      current = detect();
      apply();
      initSwitcher();
    }
  };
})();

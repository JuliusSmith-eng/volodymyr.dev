/* ==========================================================================
   КАЛЬКУЛЯТОР СТОИМОСТИ. Здесь меняются цены, тексты и список опций.

   ЦЕНЫ
   • Цена опции: поле price. Базовая цена лендинга: base.price. Больше нигде цены не нужно менять,
     итог и текст заказа считаются сами.
   • Опция с количеством (qty): цена = price + perUnit × (n − included), где n выбранное количество.
       Мультимовность: price 20 покрывает 2 языка (included: 2), каждый новый язык +5 (perUnit: 5).
       Доп. блок:      price 0, каждый блок 15 (perUnit: 15, included: 0).

   КАК ДОБАВИТЬ ОПЦИЮ
   1. Скопируйте любой блок из options (от «{» до «},»), поменяйте id (уникальный, латиницей).
   2. icon: название иконки (список ниже). slot: что загорается в макете справа:
        "telegram" | "lang" | "widget" | "blocks" | "steps" | "theme" | "crm" | "urgent"
      или "chip": маленький бейдж в макете (подходит для любой новой опции; текст бейджа в chip: "SEO").
   3. Тексты на трёх языках: uk / en / de (title, desc, note). Если перевода нет, берётся другой язык.
   4. Обновите страницу. Опция появится в списке, в итоге и в тексте заказа.

   ИКОНКИ: page, telegram, globe, widget, blocks, forms, theme, sheet, bolt, seo, chart, card, shield, tool

   ИДЕИ (ideas внизу): готовые заготовки опций, которые НЕ показываются на сайте. Чтобы включить,
   перенесите блок в options и проверьте цену и текст. Цены в ideas только мои предложения.

   УРОВНИ (игровая часть): game.levels число выбранных опций, с которого начинается уровень
   (Старт / Про / Майстер / Ультимейт). Названия уровней и достижений лежат в js/modules/i18n.js (calc.*).
   ========================================================================== */

window.CALC = {
  base: {
    price: 80,
    uk: { title: "Базовий лендінг", desc: "Шапка, 3 блоки, контактна форма" },
    en: { title: "Basic landing page", desc: "Header, 3 sections, contact form" },
    de: { title: "Basis-Landingpage", desc: "Header, 3 Abschnitte, Kontaktformular" }
  },

  game: { levels: [0, 1, 4, 7] },

  options: [
    {
      id: "telegram", price: 20, icon: "telegram", slot: "telegram",
      uk: { title: "Інтеграція Telegram-бота", desc: "Сповіщення про заявки з форми" },
      en: { title: "Telegram bot integration", desc: "Instant notifications about form leads" },
      de: { title: "Telegram-Bot-Anbindung", desc: "Sofort-Benachrichtigung über Formular-Anfragen" }
    },
    {
      id: "i18n", price: 20, icon: "globe", slot: "lang",
      qty: { min: 2, max: 6, start: 2, included: 2, perUnit: 5 },
      uk: { title: "Мультимовність", desc: "Перемикач мов на JS (UA/EN у комплекті)", note: "+$5 за кожну нову мову", qty: "Мов: {n}" },
      en: { title: "Multilingual", desc: "JS language switcher (UA/EN included)", note: "+$5 per extra language", qty: "Languages: {n}" },
      de: { title: "Mehrsprachigkeit", desc: "JS-Sprachumschalter (UA/EN inklusive)", note: "+5 $ pro weitere Sprache", qty: "Sprachen: {n}" }
    },
    {
      id: "widget", price: 40, icon: "widget", slot: "widget",
      uk: { title: "Інтерактивний віджет / калькулятор", desc: "Ігровий елемент, тести, вибір параметрів" },
      en: { title: "Interactive widget / calculator", desc: "Game element, quizzes, parameter picker" },
      de: { title: "Interaktives Widget / Rechner", desc: "Spielelement, Tests, Parameterauswahl" }
    },
    {
      id: "blocks", price: 0, icon: "blocks", slot: "blocks",
      qty: { min: 1, max: 5, start: 1, included: 0, perUnit: 15 },
      uk: { title: "Додатковий блок контенту", desc: "Кожен +1 блок понад базу: відгуки, FAQ тощо", note: "$15 за кожен блок", qty: "Блоків: {n}" },
      en: { title: "Extra content block", desc: "Each +1 section beyond the base: reviews, FAQ, etc.", note: "$15 per block", qty: "Blocks: {n}" },
      de: { title: "Zusätzlicher Inhaltsblock", desc: "Jeder weitere Abschnitt: Bewertungen, FAQ usw.", note: "15 $ pro Block", qty: "Blöcke: {n}" }
    },
    {
      id: "forms", price: 30, icon: "forms", slot: "steps",
      uk: { title: "Просунуті форми та валідація", desc: "Покрокова мультиформа / квіз" },
      en: { title: "Advanced forms & validation", desc: "Multi-step form / quiz" },
      de: { title: "Erweiterte Formulare & Validierung", desc: "Mehrstufiges Formular / Quiz" }
    },
    {
      id: "theme", price: 10, icon: "theme", slot: "theme",
      uk: { title: "Темна / світла тема", desc: "Перемикач Dark / Light mode" },
      en: { title: "Dark / light theme", desc: "Dark / Light mode switcher" },
      de: { title: "Dunkles / helles Design", desc: "Dark-/Light-Mode-Umschalter" }
    },
    {
      id: "crm", price: 25, icon: "sheet", slot: "crm",
      uk: { title: "Інтеграція CRM / Google Таблиць", desc: "Автозбереження лідів" },
      en: { title: "CRM / Google Sheets integration", desc: "Automatic lead saving" },
      de: { title: "CRM- / Google-Sheets-Anbindung", desc: "Automatisches Speichern der Leads" }
    },
    {
      id: "urgent", price: 30, icon: "bolt", slot: "urgent",
      uk: { title: "Термінова розробка", desc: "Здача за 24–48 годин" },
      en: { title: "Rush delivery", desc: "Delivered in 24–48 hours" },
      de: { title: "Express-Entwicklung", desc: "Lieferung in 24–48 Stunden" }
    }
  ],

  /* ---- ИДЕИ: на сайте не показываются. Перенесите блок в options, чтобы включить. ---- */
  ideas: [
    {
      id: "seo", price: 15, icon: "seo", slot: "chip", chip: "SEO",
      uk: { title: "SEO-основа", desc: "Meta, Open Graph, sitemap, JSON-LD" },
      en: { title: "SEO basics", desc: "Meta tags, Open Graph, sitemap, JSON-LD" },
      de: { title: "SEO-Grundlagen", desc: "Meta-Tags, Open Graph, Sitemap, JSON-LD" }
    },
    {
      id: "analytics", price: 15, icon: "chart", slot: "chip", chip: "GA4",
      uk: { title: "Аналітика", desc: "GA4 / Meta Pixel і події цілей" },
      en: { title: "Analytics", desc: "GA4 / Meta Pixel and goal events" },
      de: { title: "Analytics", desc: "GA4 / Meta Pixel und Zielereignisse" }
    },
    {
      id: "payment", price: 35, icon: "card", slot: "chip", chip: "Pay",
      uk: { title: "Онлайн-оплата", desc: "Stripe / LiqPay: кнопка або чекаут" },
      en: { title: "Online payment", desc: "Stripe / LiqPay: button or checkout" },
      de: { title: "Online-Zahlung", desc: "Stripe / LiqPay: Button oder Checkout" }
    },
    {
      id: "cookies", price: 10, icon: "shield", slot: "chip", chip: "GDPR",
      uk: { title: "Cookie-банер (GDPR)", desc: "Згода на cookies із збереженням вибору" },
      en: { title: "Cookie banner (GDPR)", desc: "Cookie consent with saved choice" },
      de: { title: "Cookie-Banner (DSGVO)", desc: "Cookie-Einwilligung mit gespeicherter Auswahl" }
    },
    {
      id: "support", price: 20, icon: "tool", slot: "chip", chip: "30d",
      uk: { title: "Підтримка 30 днів", desc: "Дрібні правки та виправлення після запуску" },
      en: { title: "30 days of support", desc: "Small edits and fixes after launch" },
      de: { title: "30 Tage Support", desc: "Kleine Änderungen und Fixes nach dem Launch" }
    }
  ]
};

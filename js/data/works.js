/* ==========================================================================
   РАБОТЫ ПОРТФОЛИО. Единственное место, где нужно что-то менять, чтобы добавить работу.

   КАК ДОБАВИТЬ РАБОТУ (3 шага)
   1. Создайте папку  assets/works/<id>/  и положите туда скриншоты: 1.webp, 2.webp, 3.webp ...
      Лучше всего 1600×1000 px (16:10), формат .webp, 100–200 КБ на файл. Первый скриншот
      станет обложкой карточки в ленте.
   2. Скопируйте любой блок из списка works ниже (от «{» до «},»), вставьте в конец списка
      и поменяйте значения.
   3. Обновите страницу. Работа появится в ленте, в фильтре, в поиске и в окне с галереей.

   ШАБЛОН (скопируйте и заполните)
     {
       id: "my-site",                 // латиницей, без пробелов; = название папки в assets/works/
       cat: "landing",                // ключ категории из списка categories ниже
       images: 3,                     // сколько картинок лежит в папке (1.webp ... 3.webp)
       ext: "webp",                   // необязательно: формат картинок, по умолчанию imageExt (ниже)
       stack: ["HTML", "CSS", "JS"],  // технологии (показываются тегами)
       link: "https://example.com",   // необязательно: ссылка на живой сайт, кнопка «Открыть сайт»
       uk: { title: "Назва", desc: "Опис у 1–3 реченнях.", type: "Лендінг", term: "5 днів", result: "+30% заявок" },
       en: { title: "Title", desc: "Short description.",   type: "Landing page", term: "5 days", result: "+30% leads" },
       de: { title: "Titel", desc: "Kurze Beschreibung.",  type: "Landingpage",  term: "5 Tage", result: "+30% Anfragen" }
     },

   ЗАМЕТКИ
   • Обязательны только id, cat, images и title в uk. Остальное можно не писать: пустые поля
     просто не показываются. Если нет перевода (en или de), берётся другой язык.
   • type / term / result попадают в строки «Тип / Термін / Результат» в окне работы.
     Нужна своя строка? Добавьте  specs: [["Роль", "Дизайн + вёрстка"]]  внутрь языкового блока.
   • images можно задать списком своих имён: images: ["home.webp", "mobile.webp"]
     (файлы лежат в той же папке assets/works/<id>/). Можно и полными путями или ссылками.
   • Обложка по умолчанию первая картинка. Другая: cover: 2 (номер) или cover: "home.webp".
   • Порядок в ленте = порядок в списке. Новые работы удобнее ставить в начало.
   • Нужна новая категория? Добавьте её в categories (с названиями на трёх языках)
     и используйте ключ в cat. Фильтр обновится сам. Если в категории нет работ, кнопка не показывается.
   • Ошибки (опечатка в категории, нет картинки, повторный id) пишутся в консоль браузера
     при открытии сайта локально: F12 → Console.
   ========================================================================== */

window.PORTFOLIO = {
  // Формат картинок по умолчанию. Сейчас лежат заглушки .svg; когда положите настоящие
  // скриншоты в .webp, поменяйте на "webp" (или пишите ext: "webp" в нужных работах).
  imageExt: "svg",

  // Категории для фильтра: ключ → названия на трёх языках (слово «Усі / All / Alle» добавляется само).
  categories: {
    landing:   { uk: "Лендінги",       en: "Landing pages", de: "Landingpages" },
    dashboard: { uk: "Дашборди",       en: "Dashboards",    de: "Dashboards" },
    clone:     { uk: "Копії дизайну",  en: "Design clones", de: "Design-Nachbauten" }
  },

  works: [
    {
      id: "online-course",
      cat: "landing",
      images: 3,
      stack: ["HTML", "CSS", "JS"],
      uk: { title: "Лендінг онлайн-курсу", type: "Лендінг", desc: "Адаптивний лендінг для онлайн-курсу англійської: тарифи, FAQ, форма заявки." },
      en: { title: "Online course landing page", type: "Landing page", desc: "Responsive landing page for an online English course: pricing plans, FAQ, request form." },
      de: { title: "Landingpage für Online-Kurs", type: "Landingpage", desc: "Responsive Landingpage für einen Englisch-Onlinekurs: Tarife, FAQ, Anfrageformular." }
    },
    {
      id: "ga4-dashboard",
      cat: "dashboard",
      images: 3,
      stack: ["Chart.js", "PHP", "GA4 API"],
      uk: { title: "Дашборд GA4", type: "Дашборд", desc: "Дашборд живого трафіку освітнього центру, вхід по логіну, ключі API на сервері." },
      en: { title: "GA4 dashboard", type: "Dashboard", desc: "Live traffic dashboard for an education center, login-protected, API keys kept on the server." },
      de: { title: "GA4-Dashboard", type: "Dashboard", desc: "Live-Traffic-Dashboard für ein Bildungszentrum, Login-Schutz, API-Schlüssel auf dem Server." }
    },
    {
      id: "excursions",
      cat: "landing",
      images: 3,
      stack: ["HTML", "CSS", "Vanilla JS"],
      uk: { title: "Сайт екскурсій", type: "Сайт", desc: "Сайт туристичної компанії з екскурсіями, галереєю та формою заявки в Telegram." },
      en: { title: "Excursions website", type: "Website", desc: "Website for a travel company with excursions, a gallery and a request form that posts to Telegram." },
      de: { title: "Website für Ausflüge", type: "Website", desc: "Website eines Reiseunternehmens mit Ausflügen, Galerie und Anfrageformular, das an Telegram sendet." }
    },
    {
      id: "kora",
      cat: "clone",
      images: 3,
      stack: ["HTML", "CSS", "JS"],
      uk: { title: "KORA", type: "Копія дизайну", desc: "Піксель-перфект копія дизайну за референсом, на власних текстах і зображеннях." },
      en: { title: "KORA", type: "Design clone", desc: "Pixel-perfect copy of a design from a reference, with custom copy and images." },
      de: { title: "KORA", type: "Design-Nachbau", desc: "Pixelgenauer Nachbau eines Designs nach Vorlage, mit eigenen Texten und Bildern." }
    },
    {
      id: "api-dashboard",
      cat: "dashboard",
      images: 3,
      stack: ["Chart.js", "REST API"],
      uk: { title: "Дашборд з API", type: "Дашборд", desc: "Графіки, фільтри за датами, експорт у PDF, Excel і JSON, світла та темна тема." },
      en: { title: "API dashboard", type: "Dashboard", desc: "Charts, date filters, export to PDF, Excel and JSON, light and dark theme." },
      de: { title: "Dashboard mit API", type: "Dashboard", desc: "Diagramme, Datumsfilter, Export als PDF, Excel und JSON, helles und dunkles Design." }
    },
    {
      id: "landing-clone",
      cat: "clone",
      images: 3,
      stack: ["HTML", "CSS", "JS"],
      uk: { title: "Копія лендінгу", type: "Копія дизайну", desc: "Відтворення односторінкового сайту: адаптив, слайдери, FAQ-акордеони." },
      en: { title: "Landing page clone", type: "Design clone", desc: "Recreation of a one-page site: responsive layout, sliders, FAQ accordions." },
      de: { title: "Landingpage-Nachbau", type: "Design-Nachbau", desc: "Nachbau einer Onepage-Website: responsives Layout, Slider, FAQ-Akkordeons." }
    }
  ]
};

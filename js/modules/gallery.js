(function () {
  var App = (window.App = window.App || {});
  var CATS = { all: "Усі", landing: "Лендінги", dashboard: "Дашборди", clone: "Копії дизайну" };
  // Замените картинки в assets/img и тексты на свои
  var WORKS = [
    { title: "Лендінг онлайн-курсу", cat: "landing", img: "assets/img/work-1.svg", desc: "Адаптивний лендінг для онлайн-курсу англійської: тарифи, FAQ, форма заявки.", stack: ["HTML", "CSS", "JS"] },
    { title: "Дашборд GA4", cat: "dashboard", img: "assets/img/work-2.svg", desc: "Дашборд живого трафіку освітнього центру, вхід по логіну, ключі API на сервері.", stack: ["Chart.js", "PHP", "GA4 API"] },
    { title: "Сайт екскурсій", cat: "landing", img: "assets/img/work-3.svg", desc: "Сайт туристичної компанії з екскурсіями, галереєю та формою заявки в Telegram.", stack: ["HTML", "CSS", "Vanilla JS"] },
    { title: "KORA", cat: "clone", img: "assets/img/work-4.svg", desc: "Піксель-перфект копія дизайну за референсом, на власних текстах і зображеннях.", stack: ["HTML", "CSS", "JS"] },
    { title: "Дашборд з API", cat: "dashboard", img: "assets/img/work-5.svg", desc: "Графіки, фільтри за датами, експорт у PDF, Excel і JSON, світла та темна тема.", stack: ["Chart.js", "REST API"] },
    { title: "Копія лендінгу", cat: "clone", img: "assets/img/work-6.svg", desc: "Відтворення односторінкового сайту: адаптив, слайдери, FAQ-акордеони.", stack: ["HTML", "CSS", "JS"] }
  ];
  var current = WORKS, idx = 0;

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  App.gallery = {
    init: function () {
      var grid = document.getElementById("gallery");
      var filters = document.getElementById("filters");
      var modal = document.getElementById("modal");

      Object.keys(CATS).forEach(function (k) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = CATS[k]; b.dataset.cat = k;
        b.setAttribute("aria-pressed", k === "all");
        filters.appendChild(b);
      });

      function render(cat) {
        current = cat === "all" ? WORKS : WORKS.filter(function (w) { return w.cat === cat; });
        grid.innerHTML = current.map(function (w, i) {
          return '<button class="card" type="button" data-i="' + i + '" style="animation-delay:' + i * 60 + 'ms">' +
            '<img src="' + w.img + '" alt="' + esc(w.title) + '" width="800" height="500" loading="lazy">' +
            '<span class="card__body"><h3>' + esc(w.title) + "</h3><span>" + CATS[w.cat] + "</span></span></button>";
        }).join("");
      }

      function show(i) {
        idx = (i + current.length) % current.length;
        var w = current[idx];
        var img = document.getElementById("modalImg");
        img.src = w.img; img.alt = w.title;
        document.getElementById("modalTitle").textContent = w.title;
        document.getElementById("modalDesc").textContent = w.desc;
        document.getElementById("modalTags").innerHTML = w.stack.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
      }

      filters.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        render(b.dataset.cat);
      });
      grid.addEventListener("click", function (e) {
        var c = e.target.closest(".card"); if (!c) return;
        show(+c.dataset.i);
        if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
      });
      document.getElementById("modalClose").addEventListener("click", function () { modal.close(); });
      document.getElementById("modalPrev").addEventListener("click", function () { show(idx - 1); });
      document.getElementById("modalNext").addEventListener("click", function () { show(idx + 1); });
      modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
      modal.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") show(idx - 1);
        if (e.key === "ArrowRight") show(idx + 1);
      });
      var x0 = null;
      modal.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      modal.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
        x0 = null;
      });
      render("all");
    }
  };
})();

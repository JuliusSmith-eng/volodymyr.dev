(function () {
  var App = (window.App = window.App || {});
  // Замените картинки в assets/img; тексты работ лежат в js/modules/i18n.js (works.items, в том же порядке)
  var BASE = [
    { cat: "landing", img: "assets/img/work-1.svg", stack: ["HTML", "CSS", "JS"] },
    { cat: "dashboard", img: "assets/img/work-2.svg", stack: ["Chart.js", "PHP", "GA4 API"] },
    { cat: "landing", img: "assets/img/work-3.svg", stack: ["HTML", "CSS", "Vanilla JS"] },
    { cat: "clone", img: "assets/img/work-4.svg", stack: ["HTML", "CSS", "JS"] },
    { cat: "dashboard", img: "assets/img/work-5.svg", stack: ["Chart.js", "REST API"] },
    { cat: "clone", img: "assets/img/work-6.svg", stack: ["HTML", "CSS", "JS"] }
  ];
  var CAT_IDS = ["all", "landing", "dashboard", "clone"];
  var CATS = {}, WORKS = [], current = [], idx = 0, curCat = "all";

  function localize() {
    var tx = App.i18n.t("works.items");
    CATS = App.i18n.t("works.cats");
    WORKS = BASE.map(function (w, i) {
      return { title: tx[i].title, desc: tx[i].desc, cat: w.cat, img: w.img, stack: w.stack };
    });
    App.gallery.works = WORKS;
  }

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  App.gallery = {
    works: WORKS,
    init: function () {
      var grid = document.getElementById("gallery");
      var filters = document.getElementById("filters");
      var modal = document.getElementById("modal");
      localize();

      CAT_IDS.forEach(function (k) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = CATS[k]; b.dataset.cat = k;
        b.setAttribute("aria-pressed", k === "all");
        filters.appendChild(b);
      });

      function render(cat) {
        curCat = cat;
        current = cat === "all" ? WORKS : WORKS.filter(function (w) { return w.cat === cat; });
        grid.innerHTML = current.map(function (w, i) {
          return '<button class="card" type="button" data-i="' + i + '" data-reveal>' +
            '<img src="' + w.img + '" alt="' + esc(w.title) + '" width="800" height="500" loading="lazy">' +
            '<span class="card__body"><h3>' + esc(w.title) + "</h3><span>" + CATS[w.cat] + "</span></span></button>";
        }).join("");
        if (App.reveal) App.reveal.observe(grid);
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

      // Смена языка: подписи фильтров, карточки и открытое окно перерисовываются на месте
      App.i18n.onChange(function () {
        localize();
        filters.querySelectorAll("button").forEach(function (b) { b.textContent = CATS[b.dataset.cat]; });
        var openIdx = idx, isOpen = modal.open;
        render(curCat);
        if (isOpen) show(openIdx);
      });
      // Открыть работу из поиска: сбрасываем фильтр и показываем окно
      App.gallery.open = function (n) {
        filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.cat === "all"); });
        render("all");
        show(n);
        if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
      };
    }
  };
})();

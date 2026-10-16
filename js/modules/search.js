(function () {
  var App = (window.App = window.App || {});

  // Разделы и ключевые слова поиска по языкам лежат в js/modules/i18n.js (sections)
  function sections() { return App.i18n.t("sections"); }
  var T = function (k) { return App.i18n.t(k); };

  App.search = {
    init: function () {
      var root = document.getElementById("search");
      var header = document.getElementById("header");
      var toggle = document.getElementById("searchToggle");
      var input = document.getElementById("searchInput");
      var close = document.getElementById("searchClose");
      var list = document.getElementById("searchResults");
      if (!root || !input) return;
      var items = [], active = -1;

      function isOpen() { return root.classList.contains("is-open"); }

      function open() {
        root.classList.add("is-open");
        header.classList.add("is-searching");
        toggle.setAttribute("aria-expanded", "true");
        input.setAttribute("aria-expanded", "true");
        input.tabIndex = 0; close.tabIndex = 0;
        render("");
        input.focus();
      }
      function shut(returnFocus) {
        root.classList.remove("is-open");
        header.classList.remove("is-searching");
        toggle.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-expanded", "false");
        input.tabIndex = -1; close.tabIndex = -1;
        input.value = ""; input.blur();
        if (returnFocus) toggle.focus();
      }

      function haystack(w) { return (w.title + " " + w.desc + " " + w.stack.join(" ") + " " + (w.catLabel || w.cat)).toLowerCase(); }

      function find(q) {
        q = q.trim().toLowerCase();
        var res = [];
        if (!q) {
          return sections().map(function (s) { return { kind: "section", title: s.title, hint: s.hint, id: s.id }; });
        }
        var tokens = q.split(/\s+/);
        (App.gallery && App.gallery.works || []).forEach(function (w, i) {
          var h = haystack(w);
          if (tokens.every(function (t) { return h.indexOf(t) !== -1; })) res.push({ kind: "work", title: w.title, hint: T("search.hintWork"), index: i });
        });
        sections().forEach(function (s) {
          var h = (s.title + " " + s.kw).toLowerCase();
          if (tokens.every(function (t) { return h.indexOf(t) !== -1; })) res.push({ kind: "section", title: s.title, hint: T("search.hintSection"), id: s.id });
        });
        return res.slice(0, 7);
      }

      function render(q) {
        items = find(q); active = items.length ? 0 : -1;
        var html = "";
        if (!q.trim()) html += '<li class="search__head" role="presentation">' + T("search.head") + "</li>";
        if (!items.length) html += '<li class="search__empty" role="presentation">' + T("search.empty") + "</li>";
        items.forEach(function (it, i) {
          var t = document.createElement("div"); t.textContent = it.title;
          var h = document.createElement("div"); h.textContent = it.hint;
          html += '<li role="presentation"><button class="search__item" type="button" role="option" id="sr' + i + '" data-i="' + i + '" tabindex="-1" aria-selected="' + (i === active) + '"><span>' + t.innerHTML + "</span><small>" + h.innerHTML + "</small></button></li>";
        });
        list.innerHTML = html;
        input.setAttribute("aria-activedescendant", active >= 0 ? "sr" + active : "");
      }

      function setActive(n) {
        if (!items.length) return;
        active = (n + items.length) % items.length;
        list.querySelectorAll(".search__item").forEach(function (b, i) { b.setAttribute("aria-selected", i === active); });
        input.setAttribute("aria-activedescendant", "sr" + active);
        var el = document.getElementById("sr" + active);
        if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
      }

      function choose(i) {
        var it = items[i]; if (!it) return;
        shut(false);
        if (it.kind === "section") {
          var el = document.getElementById(it.id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
          var works = document.getElementById("works");
          if (works) works.scrollIntoView({ behavior: "smooth" });
          if (App.gallery && App.gallery.open) setTimeout(function () { App.gallery.open(it.index); }, 450);
        }
      }

      App.i18n.onChange(function () { if (isOpen()) render(input.value); });
      toggle.addEventListener("click", open);
      close.addEventListener("click", function () { shut(true); });
      input.addEventListener("input", function () { render(input.value); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
        else if (e.key === "Enter") { e.preventDefault(); choose(active); }
      });
      list.addEventListener("click", function (e) {
        var b = e.target.closest(".search__item"); if (b) choose(+b.dataset.i);
      });
      list.addEventListener("pointermove", function (e) {
        var b = e.target.closest(".search__item"); if (b && +b.dataset.i !== active) setActive(+b.dataset.i);
      });
      document.addEventListener("pointerdown", function (e) {
        if (isOpen() && !e.target.closest("#search")) shut(false);
      });
      document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); isOpen() ? shut(true) : open(); }
        else if (e.key === "Escape" && isOpen()) { shut(true); }
      });
    }
  };
})();

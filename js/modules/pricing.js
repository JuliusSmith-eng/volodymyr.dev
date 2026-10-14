(function () {
  var App = (window.App = window.App || {});
  // Цены, сроки и пометка «hot» тут, тексты пакетов и подписи в js/modules/i18n.js (pricing.*)
  var PLANS = {
    landing: [{ name: "Basic", price: 80, days: 2 }, { name: "Standard", price: 120, days: 3, hot: true }, { name: "Premium", price: 180, days: 4 }],
    clone: [{ name: "Basic", price: 80, days: 2 }, { name: "Standard", price: 120, days: 3, hot: true }, { name: "Premium", price: 180, days: 4 }],
    dashboard: [{ name: "Basic", price: 80, days: 2 }, { name: "Standard", price: 120, days: 3, hot: true }, { name: "Premium", price: 180, days: 4 }]
  };

  App.pricing = {
    init: function () {
      var tabs = document.getElementById("priceTabs");
      var grid = document.getElementById("pricing-grid");
      var keys = Object.keys(PLANS), active = keys[0];
      var i18n = App.i18n;
      function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
      keys.forEach(function (k, i) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = i18n.t("pricing.tabs")[k]; b.dataset.k = k;
        b.setAttribute("aria-pressed", i === 0);
        tabs.appendChild(b);
      });
      function render(k) {
        active = k;
        var items = i18n.t("pricing.items")[k];
        grid.innerHTML = PLANS[k].map(function (p, n) {
          var time = i18n.fmt("pricing.time", { t: i18n.fmt("pricing.days", { n: p.days }) });
          return '<article class="plan' + (p.hot ? " plan--hot" : "") + '" data-reveal>' +
            (p.hot ? '<span class="plan__badge">' + esc(i18n.t("pricing.hot")) + "</span>" : "") +
            "<h3>" + p.name + '</h3><div class="plan__price">$' + p.price + '</div><p class="plan__time">' + esc(time) + "</p><ul>" +
            items[n].map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
            '</ul><a class="btn ' + (p.hot ? "btn--primary" : "btn--ghost") + '" href="#contacts">' + esc(i18n.t("pricing.order")) + "</a></article>";
        }).join("");
        if (App.reveal) App.reveal.observe(grid);
      }
      i18n.onChange(function () {
        tabs.querySelectorAll("button").forEach(function (b) { b.textContent = i18n.t("pricing.tabs")[b.dataset.k]; });
        render(active);
      });
      tabs.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        tabs.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        render(b.dataset.k);
      });
      render(active);
    }
  };
})();

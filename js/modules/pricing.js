(function () {
  var App = (window.App = window.App || {});
  // Цены и условия как в гигах на Fiverr, правьте под себя
  var PLANS = {
    "Лендінг": [
      { name: "Basic", price: 80, time: "2 дні", items: ["1 сторінка, до 3–4 секцій", "HTML, CSS, vanilla JS", "2 правки"] },
      { name: "Standard", price: 120, time: "3 дні", hot: true, items: ["До 5 секцій", "Інтерактив і робоча форма", "3 правки"] },
      { name: "Premium", price: 180, time: "4 дні", items: ["До 8 секцій", "Складні анімації, власний JS", "5 правок"] }
    ],
    "Копія дизайну": [
      { name: "Basic", price: 80, time: "2 дні", items: ["Односторінкова копія за референсом", "Адаптив під усі екрани", "2 правки"] },
      { name: "Standard", price: 120, time: "3 дні", hot: true, items: ["Багатосекційний лендінг", "Інтерактивні елементи та CSS-анімації", "3 правки"] },
      { name: "Premium", price: 180, time: "4 дні", items: ["Багатосторінковий сайт", "JS-функціональність, форми", "5 правок"] }
    ],
    "Дашборд": [
      { name: "Basic", price: 80, time: "2 дні", items: ["Сторінка з графіками Chart.js", "Динамічні фільтри", "2 правки"] },
      { name: "Standard", price: 120, time: "3 дні", hot: true, items: ["Дашборд + 1 реальний API", "GA4, Stripe, CRM або Webhook", "3 правки"] },
      { name: "Premium", price: 180, time: "4 дні", items: ["Кілька джерел API", "Авторизація, експорт в 1 клік", "5 правок"] }
    ]
  };

  App.pricing = {
    init: function () {
      var tabs = document.getElementById("priceTabs");
      var grid = document.getElementById("pricing-grid");
      var keys = Object.keys(PLANS);
      keys.forEach(function (k, i) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = k; b.dataset.k = k;
        b.setAttribute("aria-pressed", i === 0);
        tabs.appendChild(b);
      });
      function render(k) {
        grid.innerHTML = PLANS[k].map(function (p) {
          return '<article class="plan' + (p.hot ? " plan--hot" : "") + '" data-reveal>' +
            (p.hot ? '<span class="plan__badge">Обирають частіше</span>' : "") +
            "<h3>" + p.name + '</h3><div class="plan__price">$' + p.price + '</div><p class="plan__time">Строк: ' + p.time + "</p><ul>" +
            p.items.map(function (t) { return "<li>" + t + "</li>"; }).join("") +
            '</ul><a class="btn ' + (p.hot ? "btn--primary" : "btn--ghost") + '" href="#contacts">Замовити</a></article>';
        }).join("");
        if (App.reveal) App.reveal.observe(grid);
      }
      tabs.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        tabs.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        render(b.dataset.k);
      });
      render(keys[0]);
    }
  };
})();

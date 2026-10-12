(function () {
  var App = (window.App = window.App || {});
  App.hello = {
    init: function () {
      var el = document.getElementById("hello");
      if (!el) return;
      var i = 0;
      el.querySelectorAll(".hello__col > span").forEach(function (line) {
        var text = line.textContent;
        line.textContent = "";
        line.setAttribute("aria-hidden", "true");
        text.split("").forEach(function (c) {
          var s = document.createElement("span");
          s.className = "ch";
          s.style.setProperty("--i", i++);
          s.textContent = c;
          line.appendChild(s);
        });
      });
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("is-on"); return; }
      // Печатаем надпись, держим, стираем и начинаем заново
      function cycle() {
        el.classList.add("is-on");
        setTimeout(function () {
          el.classList.remove("is-on");
          setTimeout(cycle, 900);
        }, 1400 + i * 55 + 3200);
      }
      setTimeout(cycle, 500);
    }
  };
})();

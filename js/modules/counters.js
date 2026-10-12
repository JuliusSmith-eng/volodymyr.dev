(function () {
  var App = (window.App = window.App || {});
  App.counters = {
    init: function () {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      document.querySelectorAll("[data-count]").forEach(function (el) {
        var to = +el.dataset.count, t0 = null;
        function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / 1400, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = "0";
        requestAnimationFrame(step);
      });
    }
  };
})();

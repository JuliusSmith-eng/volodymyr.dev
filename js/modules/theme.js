(function () {
  var App = (window.App = window.App || {});
  var KEY = "theme";
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = t === "light" ? "#F5F5DC" : "#0A1824";
  }
  App.theme = {
    init: function () {
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      var t = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      apply(t);
      document.getElementById("themeToggle").addEventListener("click", function () {
        t = t === "dark" ? "light" : "dark";
        apply(t);
        try { localStorage.setItem(KEY, t); } catch (e) {}
      });
    }
  };
})();

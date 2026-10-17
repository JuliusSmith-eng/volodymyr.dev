(function () {
  var App = window.App || {};
  document.documentElement.classList.add("js");
  document.getElementById("year").textContent = new Date().getFullYear();
  ["i18n", "theme", "themeToggle", "nav", "gallery", "pricing", "calculator", "search", "counters", "hello", "wolf", "footer"].forEach(function (name) {
    if (App[name] && App[name].init) App[name].init();
  });
  // Анимацию появления вешаем на карточки после их отрисовки
  [".stack", ".contacts", "#pricing-grid"].forEach(function (sel) {
    var g = document.querySelector(sel);
    if (g) g.setAttribute("data-reveal-group", "");
  });
  document.querySelectorAll(".section h2").forEach(function (el) { el.setAttribute("data-reveal", "blur"); });
  document.querySelectorAll(".stack__item").forEach(function (el, i) {
    el.setAttribute("data-reveal", i % 2 ? "right" : "left");
  });
  document.querySelectorAll(".contact").forEach(function (el) { el.setAttribute("data-reveal", "scale"); });
  // Паралакс: фоновое свечение, сцена и текст героя
  var glow = document.querySelector(".hero__glow");
  if (glow) glow.setAttribute("data-parallax", "90");
  var stage = document.querySelector(".hero__stage");
  if (stage) stage.setAttribute("data-parallax", "46");
  var heroText = document.querySelector(".hero__text");
  if (heroText) heroText.setAttribute("data-parallax", "26");
  if (App.reveal) App.reveal.init();
})();

(function () {
  var App = window.App || {};
  document.documentElement.classList.add("js");
  document.getElementById("year").textContent = new Date().getFullYear();
  ["theme", "nav", "gallery", "pricing", "counters", "hello", "wolf"].forEach(function (name) {
    if (App[name] && App[name].init) App[name].init();
  });
  // Анимацию появления вешаем на карточки после их отрисовки
  document.querySelectorAll(".stack__item, .contact, .section h2").forEach(function (el) { el.setAttribute("data-reveal", ""); });
  if (App.reveal) App.reveal.init();
})();

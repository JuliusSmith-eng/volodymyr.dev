(function () {
  var App = (window.App = window.App || {});

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  App.themeToggle = {
    init: function () {
      var btn = document.getElementById("themeToggle");
      if (!btn) return;
      var track = btn.querySelector(".tt__track");
      var knob = btn.querySelector(".tt__knob");
      var hole = btn.querySelector(".tt__hole");
      var cv = btn.querySelector(".tt__cv");
      var ctx = cv && cv.getContext && cv.getContext("2d");
      var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      var W = 0, H = 0, dpr = 1, busy = false;

      function size() {
        var r = track.getBoundingClientRect();
        W = r.width; H = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      size();
      window.addEventListener("resize", size);

      // Человечек из палочек: ноги и руки считаются по фазе шага
      function man(x, foot, k, phase, pose, rot, color) {
        ctx.save();
        ctx.translate(x, foot);
        if (rot) ctx.rotate(rot);
        ctx.scale(k, k);
        ctx.strokeStyle = color; ctx.fillStyle = color;
        ctx.lineWidth = 1.9; ctx.lineCap = "round"; ctx.lineJoin = "round";
        var hip = -8, sh = -13.5, s = Math.sin(phase);
        function leg(a) {
          var kx = Math.sin(a) * 4.2, ky = hip + Math.cos(a) * 4.2;
          var b = a * 0.2 - (a < 0 ? 0.35 * -a : 0);
          ctx.beginPath(); ctx.moveTo(0, hip); ctx.lineTo(kx, ky);
          ctx.lineTo(kx + Math.sin(b) * 3.8, ky + Math.cos(b) * 3.8); ctx.stroke();
        }
        if (pose === "walk") { leg(s * 0.75); leg(-s * 0.75); }
        else { leg(0.35); leg(-0.35); }
        ctx.beginPath(); ctx.moveTo(0, hip); ctx.lineTo(0, sh - 0.8); ctx.stroke();           // туловище
        if (pose === "walk") {
          var a2 = s * 0.8;
          ctx.beginPath(); ctx.moveTo(0, sh);
          ctx.lineTo(Math.sin(a2) * 5.6, sh + Math.cos(a2) * 5.6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, sh);
          ctx.lineTo(Math.sin(-a2) * 5.6, sh + Math.cos(-a2) * 5.6); ctx.stroke();
        } else {                                                                              // руки вверх
          ctx.beginPath(); ctx.moveTo(0, sh); ctx.lineTo(-4.6, sh - 6.2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, sh); ctx.lineTo(4.6, sh - 6.2); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, sh - 4.4, 3.1, 0, Math.PI * 2); ctx.fill();               // голова
        ctx.restore();
      }

      function run() {
        busy = true;
        btn.classList.add("is-busy", "is-pressed");
        setTimeout(function () { btn.classList.remove("is-pressed"); }, 180);

        size();
        var k = H / 40;
        var kr = knob.getBoundingClientRect(), tr = track.getBoundingClientRect();
        var x0 = kr.left - tr.left + kr.width / 2;                 // центр кнопки: отсюда выходит человечек
        var floor = H * 0.72;
        var holeX = W * 0.78;
        var xStop = holeX - H * 0.42;
        var walkDur = Math.max(700, (xStop - x0) / (0.035 * k));
        var T1 = walkDur, T2 = T1 + 340, T3 = T2 + 460, TEND = T3 + 280;
        var switched = false, opened = false, closed = false;
        var t0 = performance.now(), last = t0, phase = 0;

        function frame(now) {
          var t = now - t0, dt = now - last; last = now;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);
          var color = getComputedStyle(btn).color;

          if (t < T1) {                                            // выходит из-под кнопки и идёт к люку
            var u = t / T1;
            phase += dt * 0.0205;
            var kk = k * (0.35 + 0.65 * ease(clamp01(t / 260)));
            man(x0 + (xStop - x0) * u, floor - Math.abs(Math.sin(phase)) * 0.9 * k, kk, phase, "walk", 0, color);
          } else if (t < T2) {                                     // прыжок к люку, люк открывается
            if (!opened) { opened = true; btn.classList.add("is-open"); }
            var j = (t - T1) / (T2 - T1);
            man(xStop + (holeX - xStop) * ease(j), floor - Math.sin(Math.PI * j) * H * 0.24, k, 0, "up", j * 0.25, color);
          } else if (t < T3) {                                     // падает в люк, тема переключается
            if (!switched) {
              switched = true;
              var hr = hole.getBoundingClientRect();
              App.theme.toggle({ x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 });
            }
            var f = (t - T2) / (T3 - T2);
            ctx.save();
            ctx.beginPath(); ctx.rect(0, 0, W, floor + 0.5 * k); ctx.clip();   // ниже края люка не видно
            man(holeX, floor + f * f * H * 0.8, k * (1 - 0.3 * f), 0, "up", 0.25 + f * 0.5, color);
            ctx.restore();
          } else if (t < TEND) {                                   // люк закрывается
            if (!closed) { closed = true; btn.classList.remove("is-open"); }
          } else {
            ctx.clearRect(0, 0, W, H);
            btn.classList.remove("is-busy");
            busy = false;
            return;
          }
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }

      btn.addEventListener("click", function () {
        if (busy) return;
        if (!ctx || reduce) { App.theme.toggle(null); return; }   // без анимации: просто переключаем
        run();
      });
    }
  };
})();

(function () {
  var App = (window.App = window.App || {});

  var VS = "attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=a_pos*0.5+0.5;v_uv.y=1.0-v_uv.y;gl_Position=vec4(a_pos,0.0,1.0);}";
  var FS = [
    "precision mediump float;",
    "varying vec2 v_uv;",
    "uniform sampler2D u_tex;",
    "void main(){",
    "  vec4 c=texture2D(u_tex,v_uv);",
    "  float y=dot(c.rgb,vec3(0.299,0.587,0.114));",
    "  float cb=(c.b-y)/1.772;",
    "  float cr=(c.r-y)/1.402;",
    "  float d=distance(vec2(cb,cr),vec2(-0.1732,-0.0792));",
    "  float t=clamp((d-0.012)/0.148,0.0,1.0);",
    "  float a=t*t*(3.0-2.0*t);",
    "  float neu=max(c.r,c.b);",
    "  float avg=(c.r+c.b)*0.5;",
    "  float g=min(min(c.g,neu),mix(avg,neu,smoothstep(0.5,1.0,a)));",
    "  gl_FragColor=vec4(vec3(c.r,g,c.b)*a,a);",
    "}"
  ].join("\n");

  // Длительность ролика и карта «угол взгляда → время в ролике»
  var PERIOD = 6.05;
  var KEYS = [[0, 1.9], [45, 2.15], [90, 2.5], [135, 3.64], [180, 3.86], [225, 4.25], [270, 5.13], [315, 5.67], [360, 7.95]];
  var FB_N = 121;

  function angleToTime(a) {
    for (var i = 1; i < KEYS.length; i++) {
      if (a <= KEYS[i][0]) {
        var k = (a - KEYS[i - 1][0]) / (KEYS[i][0] - KEYS[i - 1][0]);
        return KEYS[i - 1][1] + k * (KEYS[i][1] - KEYS[i - 1][1]);
      }
    }
    return 0;
  }
  function wrap(t) { return ((t % PERIOD) + PERIOD) % PERIOD; }
  function delta(a) { return ((a + PERIOD / 2) % PERIOD + PERIOD) % PERIOD - PERIOD / 2; }

  App.wolf = {
    init: function () {
      var box = document.getElementById("wolfBox");
      var video = document.getElementById("wolfVideo");
      var canvas = document.getElementById("wolf");
      if (!box || !video || !canvas) return;

      var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      var mode = "video"; // video | frames | poster
      var visible = true, live = false, raf = 0, lastTs = 0;
      var gl = null, tex = null, glBound = false;
      var ctx2d = null, frames = [], loaded = [], fdrawn = -1;
      var cur = 0, target = 0, lastMove = -1e9;
      var seeking = false, seekGuard = 0;

      function fail(reason) {
        if (mode === "poster") return;
        mode = "poster";
        if (raf) cancelAnimationFrame(raf);
        raf = 0; gl = null; live = false;
        box.classList.remove("is-live");
        box.classList.add("no-gl");
        if (reason) console.warn("wolf: " + reason);
      }

      function toFrames(reason) {
        if (mode !== "video") return;
        if (reduce) { fail(reason + " (reduced motion)"); return; }
        mode = "frames";
        gl = null;
        video.pause();
        if (reason) console.warn("wolf: " + reason + " — fallback to frames");
        if (!use2D()) { fail("no 2d context"); return; }
        for (var i = 0; i < FB_N; i++) (function (i) {
          var img = new Image();
          img.onload = function () { loaded[i] = 1; };
          img.src = "assets/wolf/f" + (i < 10 ? "00" : i < 100 ? "0" : "") + i + ".webp";
          frames[i] = img;
        })(i);
        if (!raf) raf = requestAnimationFrame(tick);
      }

      function use2D() {
        if (ctx2d) return true;
        if (glBound) {
          var fresh = canvas.cloneNode(false);
          canvas.parentNode.replaceChild(fresh, canvas);
          canvas = fresh;
          glBound = false;
        }
        ctx2d = canvas.getContext("2d");
        return !!ctx2d;
      }

      function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      }

      function setup() {
        var opts = { alpha: true, antialias: false, premultipliedAlpha: true };
        gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
        if (gl) glBound = true;
        if (!gl) { toFrames("no webgl"); return false; }
        var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
        if (!vs || !fs) { toFrames("shader compile error"); return false; }
        var p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { toFrames("program link error"); return false; }
        gl.useProgram(p);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(p, "a_pos");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.clearColor(0, 0, 0, 0);
        return true;
      }

      function ensureSize() {
        var r = box.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = Math.max(1, Math.round(r.width * dpr));
        var h = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          if (gl) gl.viewport(0, 0, w, h);
          return true;
        }
        return false;
      }

      function markLive() {
        if (!live) {
          live = true;
          box.classList.add("is-live");
        }
      }

      function draw() {
        if (mode !== "video" || !gl || video.readyState < 2) return;
        ensureSize();
        try {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        } catch (e) { toFrames("video texture blocked: " + e.name); return; }
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        markLive();
      }

      function drawFrame(idx) {
        if (!ctx2d || !frames[idx] || !loaded[idx]) return;
        var resized = ensureSize();
        if (fdrawn === idx && !resized) return;
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        ctx2d.drawImage(frames[idx], 0, 0, canvas.width, canvas.height);
        fdrawn = idx;
        markLive();
      }

      function follow(dt) {
        var d = delta(target - cur);
        cur = wrap(cur + (reduce ? d : d * Math.min(1, dt * 7)));
      }

      function stepVideo(dt, now) {
        var following = now - lastMove < 5000;
        if (!following) {
          if (reduce) {
            if (!video.paused) video.pause();
          } else {
            if (video.playbackRate !== 1) video.playbackRate = 1;
            if (video.paused) {
              var pr = video.play();
              if (pr && pr.catch) pr.catch(function () {});
            }
            cur = video.currentTime;
            draw();
          }
          return;
        }
        // Слежение: вперёд — проигрывание на ускорении (кадр обновляется каждый рAF),
        // назад — одиночный сериализованный seek
        if (reduce) {
          if (!video.paused) video.pause();
          var dr = delta(target - video.currentTime);
          if (Math.abs(dr) > 0.05 && !seeking) startSeek(wrap(video.currentTime + dr));
          draw();
          return;
        }
        var d = delta(target - video.currentTime);
        if (d > 0.1) {
          var rate = Math.min(3, Math.max(0.5, d / 0.35));
          if (video.paused) {
            video.playbackRate = rate;
            var pp = video.play();
            if (pp && pp.catch) pp.catch(function () {});
          } else {
            video.playbackRate = rate;
          }
        } else if (d < -0.1) {
          if (!video.paused) video.pause();
          if (!seeking) startSeek(wrap(video.currentTime + d));
        } else {
          if (!video.paused) video.pause();
        }
        cur = video.currentTime;
        draw();
      }

      function startSeek(t) {
        seeking = true;
        video.currentTime = t;
        clearTimeout(seekGuard);
        seekGuard = setTimeout(function () { seeking = false; }, 150);
      }

      function stepFrames(dt, now) {
        if (now - lastMove < 5000) {
          follow(dt);
        } else if (!reduce) {
          cur = wrap(cur + dt * 0.6);
        }
        drawFrame(Math.round(cur / PERIOD * FB_N) % FB_N);
      }

      function tick(ts) {
        raf = 0;
        var dt = Math.min((ts - (lastTs || ts)) / 1000, 0.1);
        lastTs = ts;
        if (mode === "poster") return;
        if (mode === "video") {
          if (visible && !document.hidden && gl) stepVideo(dt, ts);
          else if (!video.paused) video.pause();
        } else if (mode === "frames") {
          if (visible && !document.hidden) stepFrames(dt, ts);
        }
        raf = requestAnimationFrame(tick);
      }

      function onPointer(e) {
        var r = box.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height * 0.2); // голова примерно на 20% высоты
        if (Math.hypot(dx, dy) < 24) return;
        var a = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
        target = angleToTime(a);
        lastMove = performance.now();
      }

      function checkSeekable() {
        if (mode !== "video") return;
        var s = video.seekable;
        if (!s.length || s.end(s.length - 1) < PERIOD * 0.5) {
          toFrames("video not seekable (no Range support)");
        }
      }

      if (!setup()) { if (mode === "video") fail("setup failed"); }
      if (glBound) {
        canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); toFrames("webgl context lost"); });
      }

      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPointer, { passive: true });
      video.addEventListener("loadeddata", function () { draw(); checkSeekable(); });
      video.addEventListener("canplay", checkSeekable);
      video.addEventListener("seeked", function () {
        seeking = false;
        if (mode === "video" && visible && !document.hidden && performance.now() - lastMove < 5000) draw();
      });
      video.addEventListener("error", function () { toFrames("video error"); });
      window.addEventListener("resize", function () { if (live && mode === "video") draw(); }, { passive: true });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden && mode === "video") video.pause();
      });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible && mode === "video") draw();
        }).observe(box);
      }

      if (reduce) {
        video.addEventListener("loadeddata", function () { video.currentTime = 0; });
      }

      if (video.readyState >= 2) { draw(); checkSeekable(); }
      if (!raf) raf = requestAnimationFrame(tick);
    }
  };
})();

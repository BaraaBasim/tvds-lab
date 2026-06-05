/* TVDS Group — interactions: nav, scroll reveal, animated graph hero */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---- Scroll reveal ---- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Animated graph network (hero canvas) ----
     Drifting nodes connected by edges that brighten as they near —
     a living "time-varying graph". Pauses if reduced-motion is set. */
  var canvas = document.getElementById("graph-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var nodes = [];
  var W, H, DPR;
  var NODE_COUNT, LINK_DIST;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    NODE_COUNT = Math.max(28, Math.min(70, Math.round((W * H) / 18000)));
    LINK_DIST = Math.min(170, Math.max(120, W / 9));
    build();
  }

  function build() {
    nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1.3
      });
    }
  }

  var palette = [
    [99, 102, 241],   // indigo
    [124, 58, 237],   // violet
    [6, 182, 212]     // teal
  ];

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // edges
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          var alpha = (1 - d / LINK_DIST) * 0.5;
          ctx.strokeStyle = "rgba(150, 170, 255," + alpha + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var c = palette[k % palette.length];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0.9)";
      ctx.shadowColor = "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0.8)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  window.addEventListener("resize", resize);
  resize();
  if (reduced) { draw(); } else { loop(); }
})();

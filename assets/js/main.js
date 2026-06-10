/* TVDS Group — interactions: mobile nav, scroll reveal, research graph,
   publication filter, black-swan heavy-tail demo */
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

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =================================================================
     Research directions — single source of truth.
     Each direction (and sub-direction) has a `slug` used to filter
     the publications page via publications.html?topic=<slug>.
     ================================================================= */
  var DIRECTIONS = [
    { slug: "heavy-tails", label: "Heavy-Tailed Distributions", subs: [
      { slug: "alpha-stable", label: "α-stable models" },
      { slug: "extreme-events", label: "Black swans & extremes", swan: true },
      { slug: "impulsive-noise", label: "Impulsive noise" }
    ]},
    { slug: "bayesian", label: "Bayesian Learning", subs: [
      { slug: "monte-carlo", label: "Monte Carlo" },
      { slug: "bnn", label: "Bayesian neural nets" },
      { slug: "uncertainty", label: "Uncertainty" }
    ]},
    { slug: "gsp", label: "Graph Signal Processing", subs: [
      { slug: "time-varying", label: "Time-varying graphs" },
      { slug: "adaptive", label: "Adaptive graph filters" },
      { slug: "edge-signals", label: "Edge signals" }
    ]},
    { slug: "applications", label: "Applications", subs: [
      { slug: "climate", label: "Climate & Earth" },
      { slug: "finance", label: "Finance" },
      { slug: "genomics", label: "Genomics" },
      { slug: "neuro", label: "Neuroscience" },
      { slug: "remote-sensing", label: "Remote sensing" },
      { slug: "cosmology", label: "Cosmology" }
    ]},
    { slug: "tda", label: "Topological Data Analysis", subs: [
      { slug: "simplicial", label: "Simplicial methods" }
    ]},
    { slug: "sdl", label: "Stochastic Deep Learning", subs: [
      { slug: "llm", label: "LLM methods" },
      { slug: "net-opt", label: "Network optimization" }
    ]},
    { slug: "ssp", label: "Statistical Signal Processing", subs: [
      { slug: "source-separation", label: "Source separation" },
      { slug: "nonstationary", label: "Non-stationary processes" }
    ]}
  ];

  /* slug -> label, for the publications filter banner */
  var LABELS = {};
  DIRECTIONS.forEach(function (d) {
    LABELS[d.slug] = d.label;
    d.subs.forEach(function (s) { LABELS[s.slug] = s.label; });
  });

  var SVGNS = "http://www.w3.org/2000/svg";
  function pubHref(slug) { return "publications.html?topic=" + encodeURIComponent(slug); }

  /* ---- Black swan glyph (shared by graph node, demo card, canvas) ---- */
  var SWAN_BODY = "M24 39 C27 34.5 33 32.8 39 33 C46 33.2 51.5 31.8 55.5 28.8 C57.8 27.2 59.3 28.2 58.6 30.6 C57.2 35.4 53.5 41 48 43.8 C43.5 46 37.5 46.6 32.5 46.2 C27.5 45.7 24.7 43.3 24 39 Z";
  var SWAN_NECK = "M27.5 38.5 C20.5 34.5 26.5 27.5 23.5 22 C22.2 19.5 20.8 17.2 20.3 15.4";
  var SWAN_BEAK = "M17 11.9 L10.2 13.9 L17.1 15.6 Z";

  function swanSVG(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="6 8 56 42" fill="currentColor" aria-hidden="true">' +
      '<path d="' + SWAN_BODY + '"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="4.4" stroke-linecap="round" d="' + SWAN_NECK + '"/>' +
      '<circle cx="19.9" cy="13.4" r="3.7"/>' +
      '<path d="' + SWAN_BEAK + '"/></svg>';
  }

  /* ---- Research graph (desktop): HTML nodes over an SVG edge layer ---- */
  function renderGraph(el) {
    var cx = 50, cy = 50;
    var Rx = 29, Ry = 31;     // main ring radii (% of container)
    var Rx2 = 45, Ry2 = 46;   // sub ring radii
    var n = DIRECTIONS.length;
    var nodes = [{ x: cx, y: cy, label: "Research", kind: "hub" }];
    var edges = [];

    DIRECTIONS.forEach(function (d, i) {
      var base = -90 + i * (360 / n);
      var a = base * Math.PI / 180;
      var mx = cx + Rx * Math.cos(a);
      var my = cy + Ry * Math.sin(a);
      nodes.push({ x: mx, y: my, label: d.label, slug: d.slug, dir: d.slug, kind: "main" });
      edges.push({ x1: cx, y1: cy, x2: mx, y2: my, dir: d.slug });

      var m = d.subs.length;
      // the top fan (i=0) lines its pills up horizontally, so it needs wider angles
      var spacing = m > 4 ? 11 : (i === 0 ? 21 : 17);
      d.subs.forEach(function (s, j) {
        var aa = (base + (j - (m - 1) / 2) * spacing) * Math.PI / 180;
        var stagger = m > 3 ? (j % 2 ? 4.5 : -3) : 0;
        var sx = cx + (Rx2 + stagger) * Math.cos(aa);
        var sy = cy + (Ry2 + stagger) * Math.sin(aa);
        nodes.push({ x: sx, y: sy, label: s.label, slug: s.slug, dir: d.slug, kind: "sub", swan: s.swan });
        edges.push({ x1: mx, y1: my, x2: sx, y2: sy, dir: d.slug });
      });
    });

    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "research-graph__edges");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    edges.forEach(function (e) {
      var ln = document.createElementNS(SVGNS, "line");
      ln.setAttribute("x1", e.x1); ln.setAttribute("y1", e.y1);
      ln.setAttribute("x2", e.x2); ln.setAttribute("y2", e.y2);
      ln.setAttribute("data-dir", e.dir);
      ln.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(ln);
    });
    el.appendChild(svg);

    function focusDir(slug) {
      el.classList.add("is-focus");
      el.querySelectorAll('[data-dir="' + slug + '"]').forEach(function (m) { m.classList.add("is-hot"); });
    }
    function clearFocus() {
      el.classList.remove("is-focus");
      el.querySelectorAll(".is-hot").forEach(function (m) { m.classList.remove("is-hot"); });
    }

    nodes.forEach(function (nd) {
      var node;
      if (nd.kind === "hub") {
        node = document.createElement("div");
      } else {
        node = document.createElement("a");
        node.href = pubHref(nd.slug);
        node.setAttribute("data-dir", nd.dir);
        node.addEventListener("mouseenter", function () { focusDir(nd.dir); });
        node.addEventListener("mouseleave", clearFocus);
        node.addEventListener("focus", function () { focusDir(nd.dir); });
        node.addEventListener("blur", clearFocus);
      }
      node.className = "rg-node rg-node--" + nd.kind;
      node.style.left = nd.x + "%";
      node.style.top = nd.y + "%";

      var pill = document.createElement("span");
      pill.className = "rg-node__pill";
      if (nd.swan) {
        pill.innerHTML = swanSVG(16) + "<span>" + nd.label + "</span>";
      } else {
        pill.textContent = nd.label;
      }
      if (nd.kind !== "hub" && !reducedMotion) {
        pill.style.animationDuration = (6 + Math.random() * 3).toFixed(2) + "s";
        pill.style.animationDelay = (-Math.random() * 7).toFixed(2) + "s";
      }
      node.appendChild(pill);
      el.appendChild(node);
    });
  }

  /* ---- Research list (mobile / no-graph fallback) ---- */
  function renderList(el) {
    DIRECTIONS.forEach(function (d) {
      var group = document.createElement("div");
      group.className = "rl-group";

      var main = document.createElement("a");
      main.className = "rl-main";
      main.href = pubHref(d.slug);
      main.textContent = d.label;
      group.appendChild(main);

      var subs = document.createElement("div");
      subs.className = "rl-subs";
      d.subs.forEach(function (s) {
        var chip = document.createElement("a");
        chip.className = "rl-sub";
        chip.href = pubHref(s.slug);
        if (s.swan) chip.innerHTML = swanSVG(14) + "<span>" + s.label + "</span>";
        else chip.textContent = s.label;
        subs.appendChild(chip);
      });
      group.appendChild(subs);
      el.appendChild(group);
    });
  }

  var graphEl = document.getElementById("researchGraph");
  if (graphEl) renderGraph(graphEl);
  var listEl = document.getElementById("researchList");
  if (listEl) renderList(listEl);

  /* ---- Publications filter (reads ?topic=) ---- */
  var filterBar = document.getElementById("pubFilter");
  if (filterBar) {
    var topic = new URLSearchParams(window.location.search).get("topic");
    if (topic) {
      var pubs = document.querySelectorAll(".pub[data-topics]");
      var shown = 0;
      pubs.forEach(function (pub) {
        var tags = (pub.getAttribute("data-topics") || "").split(/\s+/);
        var match = tags.indexOf(topic) !== -1;
        pub.hidden = !match;
        if (match) shown++;
      });

      /* hide year headings whose publications are all filtered out */
      document.querySelectorAll(".year-head").forEach(function (head) {
        var visible = 0, node = head.nextElementSibling;
        while (node && !node.classList.contains("year-head")) {
          if (node.classList.contains("pub") && !node.hidden) visible++;
          node = node.nextElementSibling;
        }
        head.hidden = visible === 0;
      });

      var label = LABELS[topic] || topic;
      filterBar.innerHTML =
        '<span class="pubfilter__label">Filtered by <strong></strong>' +
        ' &middot; ' + shown + ' publication' + (shown === 1 ? "" : "s") + '</span>' +
        '<a class="pubfilter__clear" href="publications.html">Clear filter &times;</a>';
      filterBar.querySelector("strong").textContent = label;
      filterBar.hidden = false;

      if (shown === 0) {
        var empty = document.createElement("p");
        empty.className = "pubfilter__empty";
        empty.textContent = "No listed publications are tagged with this topic yet.";
        filterBar.insertAdjacentElement("afterend", empty);
      }
    }
  }

  /* =================================================================
     Black-swan demo: live samples from a symmetric α-stable
     distribution (Chambers–Mallows–Stuck). At α = 2 the samples are
     Gaussian; lower α gives heavier tails and "black swan" events.
     ================================================================= */
  function initSwanDemo(card) {
    var canvas = document.getElementById("swanCanvas");
    var slider = document.getElementById("alphaSlider");
    var alphaVal = document.getElementById("alphaVal");
    var countEl = document.getElementById("swanCount");
    var iconEl = card.querySelector(".swan-icon");
    if (!canvas || !slider) return;
    if (iconEl) iconEl.innerHTML = swanSVG(22);

    var ctx = canvas.getContext("2d");
    var alpha = parseFloat(slider.value);
    var THRESHOLD = 6, MAXU = 10, DX = 6, STEP = 75;
    var values = [], flags = [], count = 0;

    var swanBody = new Path2D(SWAN_BODY);
    var swanNeck = new Path2D(SWAN_NECK);
    var swanBeak = new Path2D(SWAN_BEAK);

    function sampleSaS(a) {
      var V = (Math.random() - 0.5) * Math.PI;
      var W = -Math.log(1 - Math.random());
      if (Math.abs(a - 1) < 1e-6) return Math.tan(V);
      return Math.sin(a * V) / Math.pow(Math.cos(V), 1 / a) *
             Math.pow(Math.cos(V - a * V) / W, (1 - a) / a);
    }

    function compress(v) {
      var av = Math.abs(v);
      var cv = av <= THRESHOLD ? av :
        Math.min(THRESHOLD + 1.6 * Math.log2(av / THRESHOLD + 1), MAXU);
      return (v < 0 ? -cv : cv);
    }

    function fit() {
      var r = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function capacity() {
      return Math.ceil(canvas.getBoundingClientRect().width / DX) + 1;
    }

    function push() {
      var v = sampleSaS(alpha);
      var extreme = Math.abs(v) > THRESHOLD;
      values.push(v); flags.push(extreme);
      if (extreme) { count++; countEl.textContent = count; }
      var cap = capacity();
      while (values.length > cap) { values.shift(); flags.shift(); }
    }

    function drawSwan(x, yTip, vPositive) {
      var size = 24;
      ctx.save();
      if (vPositive) ctx.translate(x - size * 0.42, yTip - size - 2);
      else ctx.translate(x - size * 0.42, yTip + 4);
      ctx.scale(size / 64, size / 64);
      ctx.fillStyle = "#1a2230";
      ctx.fill(swanBody);
      ctx.beginPath();
      ctx.arc(19.9, 13.4, 3.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fill(swanBeak);
      ctx.strokeStyle = "#1a2230";
      ctx.lineWidth = 4.4;
      ctx.lineCap = "round";
      ctx.stroke(swanNeck);
      ctx.restore();
    }

    function draw() {
      var r = canvas.getBoundingClientRect();
      var w = r.width, h = r.height, mid = h / 2;
      var unit = (h / 2 - 30) / MAXU;
      ctx.clearRect(0, 0, w, h);

      /* midline + threshold guides */
      ctx.strokeStyle = "#e7e6e1"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = "#d9c9b8";
      [-1, 1].forEach(function (s) {
        var y = mid - s * THRESHOLD * unit;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      });
      ctx.setLineDash([]);

      for (var i = 0; i < values.length; i++) {
        var x = w - (values.length - 1 - i) * DX - 6;
        if (x < -DX) continue;
        var cv = compress(values[i]);
        var y = mid - cv * unit;
        ctx.strokeStyle = flags[i] ? "#27405a" : "rgba(94,124,151,.55)";
        ctx.lineWidth = flags[i] ? 2 : 1.4;
        ctx.beginPath(); ctx.moveTo(x, mid); ctx.lineTo(x, y); ctx.stroke();
        if (flags[i]) drawSwan(x, y, values[i] >= 0);
      }
    }

    function reset() {
      values = []; flags = []; count = 0;
      countEl.textContent = "0";
    }

    function fillStatic() {
      var cap = capacity();
      for (var i = 0; i < cap; i++) push();
      draw();
    }

    slider.addEventListener("input", function () {
      alpha = parseFloat(slider.value);
      alphaVal.textContent = alpha.toFixed(2);
      reset();
      if (reducedMotion) fillStatic();
    });

    fit();
    alphaVal.textContent = alpha.toFixed(2);

    window.addEventListener("resize", function () { fit(); draw(); });

    if (reducedMotion) { fillStatic(); return; }

    var running = true, last = 0, acc = 0;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
        last = 0;
      }, { threshold: 0.05 }).observe(canvas);
    }

    function loop(ts) {
      requestAnimationFrame(loop);
      if (!running || document.hidden) { last = ts; return; }
      if (!last) last = ts;
      acc += ts - last; last = ts;
      if (acc > 600) acc = 600;
      var dirty = false;
      while (acc >= STEP) { push(); acc -= STEP; dirty = true; }
      if (dirty) draw();
    }
    requestAnimationFrame(loop);
  }

  var swanCard = document.getElementById("swanDemo");
  if (swanCard) initSwanDemo(swanCard);

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();

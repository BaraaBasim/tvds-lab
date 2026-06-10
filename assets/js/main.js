/* TVDS Group — interactions: mobile nav, scroll reveal, research graph, publication filter */
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

  /* =================================================================
     Research directions — single source of truth.
     Each direction (and sub-direction) has a `slug` used to filter
     the publications page via publications.html?topic=<slug>.
     ================================================================= */
  var DIRECTIONS = [
    { slug: "bayesian", label: "Bayesian Learning", subs: [
      { slug: "inference", label: "Inference" },
      { slug: "uncertainty", label: "Uncertainty" }
    ]},
    { slug: "gsp", label: "Graph Signal Processing", subs: [
      { slug: "time-varying", label: "Time-varying graphs" },
      { slug: "dynamic-topologies", label: "Dynamic topologies" },
      { slug: "edge-signals", label: "Edge signals" }
    ]},
    { slug: "ssp", label: "Statistical Signal Processing", subs: [
      { slug: "non-gaussian", label: "Non-Gaussian" },
      { slug: "adaptive", label: "Adaptive algorithms" }
    ]},
    { slug: "tda", label: "Topological Data Analysis", subs: [
      { slug: "simplicial", label: "Simplicial methods" }
    ]},
    { slug: "sdl", label: "Stochastic Deep Learning", subs: [
      { slug: "llm", label: "LLM methods" },
      { slug: "non-stationary", label: "Non-stationary" }
    ]},
    { slug: "applications", label: "Applications", subs: [
      { slug: "climate", label: "Climate" },
      { slug: "finance", label: "Finance" },
      { slug: "genomics", label: "Genomics" }
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
      nodes.push({ x: mx, y: my, label: d.label, slug: d.slug, kind: "main" });
      edges.push({ x1: cx, y1: cy, x2: mx, y2: my });

      var m = d.subs.length;
      d.subs.forEach(function (s, j) {
        var aa = (base + (j - (m - 1) / 2) * 17) * Math.PI / 180;
        var sx = cx + Rx2 * Math.cos(aa);
        var sy = cy + Ry2 * Math.sin(aa);
        nodes.push({ x: sx, y: sy, label: s.label, slug: s.slug, kind: "sub" });
        edges.push({ x1: mx, y1: my, x2: sx, y2: sy });
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
      ln.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(ln);
    });
    el.appendChild(svg);

    nodes.forEach(function (nd) {
      var node;
      if (nd.kind === "hub") {
        node = document.createElement("div");
      } else {
        node = document.createElement("a");
        node.href = pubHref(nd.slug);
      }
      node.className = "rg-node rg-node--" + nd.kind;
      node.style.left = nd.x + "%";
      node.style.top = nd.y + "%";
      node.textContent = nd.label;
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
        chip.textContent = s.label;
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
})();

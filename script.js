/* ============================================================
   Eden's Homestay — interactions
   ============================================================ */

/* ------------------------------------------------------------
   ⚙️ CONFIG — paste the homestay's WhatsApp Business number here
   (country code + number, digits only, no "+", no spaces).
   e.g. "919876543210"
   Until it's set, WhatsApp buttons open the chat panel with a
   friendly note instead of a dead link.
   ------------------------------------------------------------ */
const WHATSAPP_NUMBER = "919064810826"; // Eden's WhatsApp Business (India +91)

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- WhatsApp wiring ---------------- */
  const waPanel = document.getElementById("waPanel");
  const waFab = document.getElementById("waFab");
  const waClose = document.getElementById("waClose");
  const waWidget = document.getElementById("waWidget");

  function numberReady() {
    return /^\d{8,15}$/.test(WHATSAPP_NUMBER);
  }

  function waUrl(text) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  }

  // Used only by elements that can't be native links (e.g. the composer's
  // send button). A user-gesture anchor click with target="_blank" opens
  // WhatsApp in a new tab everywhere — even where window.open is blocked —
  // and this website always stays open.
  function openWaLink(text) {
    const a = document.createElement("a");
    a.href = waUrl(text);
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function showPanel() {
    waPanel.hidden = false;
    waFab.setAttribute("aria-expanded", "true");
  }
  function hidePanel() {
    if (waPanel.hidden) return;
    waPanel.hidden = true;
    waFab.setAttribute("aria-expanded", "false");
  }

  if (!numberReady()) {
    // Placeholder mode: explain gently inside the panel.
    const note = document.createElement("p");
    note.className = "wa__note";
    note.innerHTML =
      "📱 WhatsApp number coming soon! Until then, find us on " +
      '<a href="https://www.airbnb.com/h/edenshomestay" target="_blank" rel="noopener">Airbnb</a> or ' +
      '<a href="https://www.instagram.com/edenshomestaysikkim/" target="_blank" rel="noopener">Instagram</a>.';
    waPanel.querySelector(".wa__body").appendChild(note);
  }

  document.querySelectorAll("[data-wa]").forEach((el) => {
    if (numberReady()) {
      // turn it into a plain new-tab link — the browser handles everything
      // natively (new tab, site stays open), no popup blockers involved
      el.href = waUrl(el.getAttribute("data-wa-text") || "Hi Eden! I'd like to plan a stay. 🏡");
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        showPanel();
      });
    }
  });

  if (waFab) {
    waFab.addEventListener("click", () => {
      waPanel.hidden ? showPanel() : hidePanel();
    });
  }
  if (waClose) waClose.addEventListener("click", hidePanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hidePanel();
      closeMenu();
    }
  });

  document.addEventListener("click", (e) => {
    if (!waPanel.hidden && !waWidget.contains(e.target)) hidePanel();
  });

  /* ---------------- Availability composer ---------------- */
  const waToggle = document.getElementById("waDatesToggle");
  const waFields = document.getElementById("waFields");
  const waIn = document.getElementById("waIn");
  const waOut = document.getElementById("waOut");
  const waGuests = document.getElementById("waGuests");
  const waRoom = document.getElementById("waRoom");
  const waSend = document.getElementById("waSend");

  const isoDay = (d) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

  if (waToggle && waFields) {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    waIn.min = isoDay(today);
    waOut.min = isoDay(tomorrow);

    // keep check-out after check-in
    waIn.addEventListener("change", () => {
      if (!waIn.value) return;
      const next = new Date(waIn.value + "T00:00:00");
      next.setDate(next.getDate() + 1);
      waOut.min = isoDay(next);
      if (!waOut.value || waOut.value <= waIn.value) waOut.value = isoDay(next);
    });

    waToggle.addEventListener("click", () => {
      const show = waFields.hidden;
      waFields.hidden = !show;
      waToggle.classList.toggle("open", show);
      waToggle.setAttribute("aria-expanded", String(show));
    });

    waSend.addEventListener("click", () => {
      const fmt = (v) =>
        new Date(v + "T00:00:00").toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      let msg = "Hi Eden! I'd like to check availability 🗓️";
      if (waIn.value) msg += "\n▪ Check-in: " + fmt(waIn.value);
      if (waOut.value) msg += "\n▪ Check-out: " + fmt(waOut.value);
      msg += "\n▪ Guests: " + waGuests.value + " · Room: " + waRoom.value;
      msg += "\nCould you confirm availability and tariff?";
      openWaLink(msg);
    });
  }

  /* ---------------- Nav ---------------- */
  const nav = document.querySelector(".nav");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    nav.classList.remove("nav--open");
    burger.setAttribute("aria-expanded", "false");
  }

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("nav--open");
    burger.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  const onScrollNav = () => nav.classList.toggle("nav--scrolled", window.scrollY > 40);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------------- Mobile sticky bar ---------------- */
  const mBar = document.getElementById("mBar");
  const isMobile = window.matchMedia("(max-width: 768px)");

  function toggleMBar() {
    mBar.hidden = !(isMobile.matches && window.scrollY > 480);
  }
  toggleMBar();
  window.addEventListener("scroll", toggleMBar, { passive: true });
  isMobile.addEventListener?.("change", toggleMBar);

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------- Animated counters ---------------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1500;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const val = target * easeOut(p);
      el.textContent =
        decimals > 0
          ? val.toFixed(decimals)
          : Math.round(val).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString("en-IN");
    }
    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => {
      const d = parseInt(el.dataset.decimals || "0", 10);
      el.textContent = parseFloat(el.dataset.count).toFixed(d);
    });
  }

  /* ---------------- Review gauges ---------------- */
  const CIRC = 2 * Math.PI * 50; // r = 50 → 314.16
  const gauges = document.querySelectorAll(".gauge");
  if ("IntersectionObserver" in window) {
    const gio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const g = entry.target;
            const score = parseFloat(g.dataset.score) || 0;
            g.style.setProperty("--dash", (CIRC * (1 - score)).toFixed(1));
            g.classList.add("in");
            gio.unobserve(g);
          }
        });
      },
      { threshold: 0.4 }
    );
    gauges.forEach((g) => gio.observe(g));
  } else {
    gauges.forEach((g) => {
      g.style.setProperty("--dash", (CIRC * (1 - (parseFloat(g.dataset.score) || 0))).toFixed(1));
      g.classList.add("in");
    });
  }

  /* ============================================================
     HERO 3D — a constructed valley that moves on its own:
     drifting clouds & mist, waving lungta flags printed with
     Om Mani Padme Hum, falling cherry petals, crossing birds.
     Pointer adds gentle depth parallax (no rotation); scrolling
     glides you into the valley.
     ============================================================ */
  (function heroScene() {
    const hero = document.querySelector(".hero");
    const world = document.getElementById("heroWorld");
    const flagsBox = document.getElementById("heroFlags");
    const content = hero?.querySelector(".hero__content");
    if (!hero || !world || !flagsBox) return;

    /* ---- authentic lungta (wind horse) flags ----
       Colors in the fixed order: sky, air, fire, water, earth.
       Prints: the wind horse carrying the jewel, the mantra
       Om Mani Padme Hum, and the greeting Tashi Delek. */
    const COLORS = ["#3f6fb5", "#f3efe2", "#c34a36", "#3f8a5c", "#e9b949"];
    const MANTRA = "ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ།"; // Om Mani Padme Hum
    const LUNGTA = "རླུང་རྟ།"; // wind horse
    const TASHI_A = "བཀྲ་ཤིས།"; // tashi (auspiciousness)
    const TASHI_B = "བདེ་ལེགས།"; // delek (wellbeing)
    const SYLL = ["ཨོཾ་", "མ་ཎི་", "པདྨེ་", "ཧཱུྃ།"];

    const flagFrame = (ink) => `
      <rect x="4" y="4" width="92" height="112" fill="none" stroke="${ink}" stroke-width="1.6" opacity=".55"/>
      <rect x="8" y="8" width="84" height="104" fill="none" stroke="${ink}" stroke-width=".7" opacity=".35"/>`;
    const txt = (s, y, size, ink, op = 0.92) =>
      `<text x="50" y="${y}" text-anchor="middle" font-family="'Noto Serif Tibetan','Kailasa',serif" font-size="${size}" fill="${ink}" opacity="${op}">${s}</text>`;

    // the wind horse, galloping left, jewel of fortune on its back
    const horse = (ink) => `<g fill="${ink}">
      <path d="M30 62 L64 56 L70 68 L32 72 Z"/>
      <path d="M60 58 L70 42 L80 45 L73 60 Z"/>
      <path d="M73 43 L77 34 L82 45 Z"/>
      <path d="M79 45 L90 49 L82 55 Z"/>
      <path d="M34 70 L17 79 L20 85 L37 76 Z"/>
      <path d="M43 72 L31 86 L36 90 L48 77 Z"/>
      <path d="M63 68 L81 82 L76 86 L58 72 Z"/>
      <path d="M67 63 L87 70 L85 76 L64 68 Z"/>
      <path d="M31 59 Q19 52 15 40 Q25 49 33 53 Z"/>
      <path d="M47 38 L54 45 L47 52 L40 45 Z"/>
      <path d="M47 28 L50 37 L44 37 Z"/>
      <path d="M70 45 Q63 50 61 58 Q68 54 72 49 Z"/>
    </g>`;

    function flagArt(i) {
      const c = COLORS[i % 5];
      const ink = (c === "#f3efe2" || c === "#e9b949") ? "#6b4423" : "#f8f1de";
      const kind = i % 3;
      let art = flagFrame(ink);
      if (kind === 0) {
        art += txt(MANTRA, 18, 9, ink) + horse(ink) + txt(LUNGTA, 111, 9, ink, 0.85);
        art += `<circle cx="14" cy="13" r="3" fill="${ink}" opacity=".7"/>`;
        art += `<path d="M83 9 a5.5 5.5 0 1 0 5 9 a4.4 4.4 0 1 1 -5 -9" fill="${ink}" opacity=".7"/>`;
      } else if (kind === 1) {
        art += txt(LUNGTA, 16, 8.5, ink, 0.85);
        SYLL.forEach((s, k) => { art += txt(s, 40 + k * 25, 14.5, ink); });
      } else {
        art += txt(LUNGTA, 15, 8, ink, 0.8);
        art += txt(TASHI_A, 54, 16, ink) + txt(TASHI_B, 80, 16, ink);
        art += txt(MANTRA, 110, 7.5, ink, 0.7);
      }
      return `<svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true">${art}</svg>`;
    }

    /* --- weave the flag line along the rope curve (viewBox 1200x90) --- */
    const ropeY = (x) => {
      if (x <= 600) { const t = x / 600; return (1 - t) * (1 - t) * 14 + 2 * (1 - t) * t * 78 + t * t * 62; }
      const t = (x - 600) / 600; return (1 - t) * (1 - t) * 62 + 2 * (1 - t) * t * 46 + t * t * 18;
    };
    const COUNT = Math.max(8, Math.min(12, Math.round(window.innerWidth / 130)));
    const flags = [];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const x = ((i + 0.5) / COUNT) * 1200;
      const el = document.createElement("i");
      el.className = "flag";
      el.style.left = (x / 12) + "%";
      el.style.top = ((ropeY(x) / 90) * 100) + "%";
      el.style.backgroundColor = COLORS[i % 5];
      el.innerHTML = flagArt(i);
      frag.appendChild(el);
      flags.push({ el, phase: i * 0.55, amp: 14 + (i % 3) * 5 });
    }
    flagsBox.appendChild(frag);

    if (prefersReducedMotion) {
      flags.forEach((f, i) => { f.el.style.transform = `translate(-50%,0) rotateY(${i % 2 ? 13 : -13}deg)`; });
      return; // static postcard — no engines
    }

    /* --- petal canvas --- */
    const canvas = document.getElementById("petalCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    let W = 0, H = 0;
    const petals = [];
    const PETALS = window.innerWidth < 700 ? 22 : 46;
    function sizeCanvas() {
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(p, fromEdge) {
      p.x = Math.random() * W;
      p.y = fromEdge ? H + 12 : Math.random() * H;
      p.s = 2.5 + Math.random() * 4;
      p.vx = 0.3 + Math.random() * 0.5;
      p.vy = 0.35 + Math.random() * 0.75;
      p.r = Math.random() * Math.PI;
      p.vr = (Math.random() - 0.5) * 0.05;
      p.o = 0.3 + Math.random() * 0.5;
      p.sw = Math.random() * Math.PI * 2;
    }
    sizeCanvas();
    if (ctx) { for (let i = 0; i < PETALS; i++) { const p = {}; spawn(p, false); petals.push(p); } }
    window.addEventListener("resize", sizeCanvas, { passive: true });

    /* --- state: gentle parallax targets/current + wind --- */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let wind = 0, windT = 0, lastX = null;
    let running = false, raf = 0, phase = 0, lastT = 0;

    function setPointer(nx, ny, vx) {
      tx = nx - 0.5; ty = ny - 0.5;
      if (vx) windT = Math.max(-1, Math.min(1, windT + vx));
    }
    if (window.matchMedia("(pointer: fine)").matches) {
      hero.addEventListener("mousemove", (e) => {
        const v = lastX === null ? 0 : (e.clientX - lastX) / window.innerWidth;
        lastX = e.clientX;
        setPointer(e.clientX / window.innerWidth, e.clientY / window.innerHeight, v * 0.5);
      });
    }
    hero.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      if (t) setPointer(t.clientX / window.innerWidth, t.clientY / window.innerHeight, 0);
    }, { passive: true });

    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
      lastT = t;
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      windT *= 0.96;
      wind += (windT - wind) * 0.08;
      phase += dt * (1.6 + Math.abs(wind) * 2.6);

      // glide: pointer parallax (depth does the work) + scroll fly-in
      const fly = Math.min(1, window.scrollY / (hero.offsetHeight || 1));
      const px = (cx * -18).toFixed(1), py = (cy * -10).toFixed(1);
      world.style.transform =
        `translate3d(${px}px, ${py}px, 0) translateY(${(fly * 90).toFixed(1)}px) scale(${(1 - fly * 0.05).toFixed(3)})`;
      if (content) content.style.opacity = (1 - fly * 0.9).toFixed(2);

      for (const f of flags) {
        const ry = Math.sin(phase + f.phase) * (f.amp + wind * 26);
        const rz = Math.cos(phase * 0.7 + f.phase) * (3 + wind * 6);
        f.el.style.transform = `translate(-50%,0) rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`;
        f.el.style.setProperty("--hl", Math.max(0, ry / 50).toFixed(2));
        f.el.style.setProperty("--sh", Math.max(0, -ry / 60).toFixed(2));
      }

      if (ctx) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#f7c9d6";
        for (const p of petals) {
          p.sw += dt * 2;
          p.x += p.vx + wind * 1.5 + Math.sin(p.sw) * 0.3;
          p.y += p.vy;
          p.r += p.vr;
          if (p.y > H + 14 || p.x < -14 || p.x > W + 14) spawn(p, true);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.globalAlpha = p.o;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.s, p.s * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    }

    // run only while the hero is on screen and the tab is visible
    function start() { if (!running) { running = true; lastT = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting && !document.hidden ? start() : stop();
    }).observe(hero);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    start();
  })();

  /* ---------------- Footer year ---------------- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();

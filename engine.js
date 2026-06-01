/* ============================================================
   Trust by Design — timeline engine
   - Single per-scene progress value p (0..1) drives all motion
   - Deterministic: update(p) must be a pure function of p
   - Auto-plays the scene spine; presenter can pause / step
   ============================================================ */
(function () {
  const TBD = (window.TBD = window.TBD || {});

  /* ---------- easing ---------- */
  const E = (TBD.ease = {
    linear: (t) => t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    inQuint: (t) => t * t * t * t * t,
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutQuint: (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
    outBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    outBackSoft: (t) => {
      const c1 = 1.1, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
  });

  /* ---------- math helpers ---------- */
  TBD.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  TBD.lerp = (a, b, t) => a + (b - a) * t;
  // local normalized progress within [a,b] of the scene timeline
  TBD.seg = (p, a, b, ease) => {
    const t = TBD.clamp((p - a) / (b - a), 0, 1);
    return ease ? ease(t) : t;
  };
  // a pulse that ramps 0->1->0 across [a,b]
  TBD.pulse = (p, a, b) => {
    const t = TBD.clamp((p - a) / (b - a), 0, 1);
    return Math.sin(t * Math.PI);
  };

  /* ---------- scene registry ---------- */
  TBD.scenes = [];
  TBD.register = (scene) => TBD.scenes.push(scene);

  /* ============================================================
     Deck controller
     ============================================================ */
  const Deck = {
    i: 0,
    playing: true,
    elapsed: 0,        // seconds into current scene (animation clock)
    pace: 2,           // tweakable multiplier (2 = double-speed playback)
    HOLD: 3.2,         // seconds held on final frame before auto-advance
    last: 0,
    root: null,
    built: null,       // currently built scene
  };
  TBD.deck = Deck;

  function scene() { return TBD.scenes[Deck.i]; }
  function totalDur() { const s = scene(); return (s.dur || 10) + (s.noHold ? 0 : Deck.HOLD); }

  function buildScene() {
    const s = scene();
    Deck.root.innerHTML = "";
    Deck.built = s;
    Deck.elapsed = 0;
    // scene root
    const el = document.createElement("div");
    el.className = "scene";
    el.setAttribute("data-screen-label", String(Deck.i + 1).padStart(2, "0"));
    Deck.root.appendChild(el);
    s._el = el;
    if (s.build) s.build(el, window.CONTENT[s.id] || {});
    if (s.update) s.update(0);
    TBD.HUD.config(s, Deck.i);
    updateChrome();
  }

  function update(now) {
    if (!Deck.last) Deck.last = now;
    let dt = (now - Deck.last) / 1000;
    Deck.last = now;
    if (dt > 0.1) dt = 0.1; // guard tab-switch jumps
    const s = scene();
    const dur = s.dur || 10;

    if (Deck.playing) {
      Deck.elapsed += dt * Deck.pace;
      const total = totalDur();
      // No auto-advance: hold on the final frame. Move on only via manual input (left-click / arrow keys).
      if (Deck.elapsed >= total) { Deck.elapsed = total; }
    }
    const p = TBD.clamp(Deck.elapsed / dur, 0, 1);
    if (s.update) s.update(p);
    TBD.HUD.update(p);
    updateProgress(p);
    requestAnimationFrame(update);
  }

  /* ---------- chrome / controls ---------- */
  let elName, elNum, elBar, elPlay, elDots, elBarFill;
  function updateChrome() {
    const s = scene();
    if (elName) elName.textContent = s.title || s.name || "";
    if (elNum) elNum.textContent = String(Deck.i + 1).padStart(2, "0") + " / " + String(TBD.scenes.length).padStart(2, "0");
    if (elDots) {
      [...elDots.children].forEach((d, idx) => d.classList.toggle("on", idx === Deck.i));
    }
  }
  function updateProgress(p) {
    if (elBarFill) elBarFill.style.transform = "scaleX(" + p + ")";
  }

  TBD.goTo = (i) => { Deck.i = TBD.clamp(i, 0, TBD.scenes.length - 1) | 0; buildScene(); };
  TBD.next = () => { if (Deck.i < TBD.scenes.length - 1) { Deck.i++; buildScene(); } };
  TBD.prev = () => { if (Deck.i > 0) { Deck.i--; buildScene(); } };
  TBD.togglePlay = () => { Deck.playing = !Deck.playing; if (elPlay) elPlay.setAttribute("data-playing", Deck.playing); };
  TBD.restart = () => { Deck.elapsed = 0; };
  TBD.setPace = (v) => { Deck.pace = v; };

  /* ---------- stage scaling ---------- */
  function fit() {
    const stage = document.getElementById("stage");
    const wrap = document.getElementById("stagewrap");
    const sx = wrap.clientWidth / 1920;
    const sy = wrap.clientHeight / 1080;
    const sc = Math.min(sx, sy);
    stage.style.transform = "translate(-50%,-50%) scale(" + sc + ")";
  }
  TBD.fit = fit;

  /* ---------- boot ---------- */
  TBD.boot = function () {
    Deck.root = document.getElementById("scene-root");
    elName = document.getElementById("c-name");
    elNum = document.getElementById("c-num");
    elPlay = document.getElementById("c-play");
    elDots = document.getElementById("c-dots");
    elBarFill = document.getElementById("c-barfill");

    // build dot rail
    TBD.scenes.forEach((s, idx) => {
      const d = document.createElement("button");
      d.className = "dot";
      d.title = s.title || s.name;
      d.addEventListener("click", () => TBD.goTo(idx));
      elDots.appendChild(d);
    });

    elPlay.addEventListener("click", TBD.togglePlay);
    document.getElementById("c-prev").addEventListener("click", TBD.prev);
    document.getElementById("c-next").addEventListener("click", TBD.next);

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); TBD.next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); TBD.prev(); }
      else if (e.key === " ") { e.preventDefault(); TBD.togglePlay(); }
      else if (e.key === "r" || e.key === "R") { TBD.restart(); }
    });

    // left-click anywhere advances to the next slide (ignore clicks on the Tweaks panel)
    window.addEventListener("click", (e) => {
      if (e.target.closest && e.target.closest("#tweaks-root")) return;
      TBD.next();
    });

    window.addEventListener("resize", fit);
    fit();
    TBD.HUD.init(document.getElementById("hud"));
    elPlay.setAttribute("data-playing", Deck.playing);
    buildScene();
    requestAnimationFrame(update);
  };
})();
